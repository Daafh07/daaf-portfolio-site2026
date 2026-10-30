// A small local texture is enough: only the hero content beneath the lens is painted.
// The reference hero uses its round 128px variant, not the 80 × 54 base variant.
export const LENS_SIZE = 122;
export const GLASS_CANVAS_SIZE = 320;
const TEXTURE_SIZE = GLASS_CANVAS_SIZE;
const WIDTH = GLASS_CANVAS_SIZE;
const HEIGHT = GLASS_CANVAS_SIZE;
const RESOLUTION = 2;

const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;
// Radial refraction follows the reference hero's optical parameters:
// strength 4.05, pinch 5.5, aberration .18; no tint, blur, zoom or painted rim.
const fragment = `
precision highp float;
uniform sampler2D scene;
uniform float pixelRatio;
uniform vec4 shape; // width, height, corner radius, snap amount
varying vec2 uv;
void main() {
  vec2 p = (uv - .5) * 320.;
  float radius = min(shape.x, shape.y) * .5;
  float corner = min(shape.z, radius);
  vec2 q = abs(p) - shape.xy * .5 + corner;
  float signedDistance = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - corner;
  if (signedDistance >= 0.) discard;
  float r = clamp(1. + signedDistance / radius, 0., 1.);
  vec2 edgeDirection = max(q, 0.) * sign(p);
  if (length(edgeDirection) < .001) edgeDirection = q.x > q.y ? vec2(sign(p.x), 0.) : vec2(0., sign(p.y));
  vec2 direction = normalize(edgeDirection + .00001);
  float strength = mix(4.05, .6, shape.w);
  float displacement = pow(r, 5.5 * radius * pixelRatio / 100.) * strength * 40. * .95 / pixelRatio;
  vec2 sampleUv = .5 + (p - direction * displacement) / 320.;
  sampleUv.y = 1. - sampleUv.y;
  vec2 split = vec2(direction.x, -direction.y) * .18 * .02 * r * 247. / 320.;
  vec3 color = vec3(texture2D(scene, sampleUv + split).r,
                    texture2D(scene, sampleUv).g,
                    texture2D(scene, sampleUv - split).b);
  float mask = 1. - smoothstep(.985, 1., r);
  gl_FragColor = vec4(color, mask);
}
`;

// The scene texture is painted by hand (the lens cannot read the DOM), so every kind of thing
// that may sit under the lens needs a painter. The canvas must already be translated to the lens.
function paintText(ctx: CanvasRenderingContext2D, text: string, rect: DOMRect, style: CSSStyleDeclaration) {
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(text);
  const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * .8;
  const descent = metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * .2;
  ctx.fillText(text, rect.left, rect.top + (rect.height - ascent - descent) / 2 + ascent);
}

function paintImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, rect: DOMRect) {
  if (!img.complete || !img.naturalWidth) return;
  const style = getComputedStyle(img);
  const matrix = new DOMMatrix(style.transform === "none" ? undefined : style.transform);
  ctx.save();
  ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.rotate(Math.atan2(matrix.b, matrix.a));
  const width = parseFloat(style.width), height = parseFloat(style.height);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

// A control outside the hero (a menu link, a button) is painted into the lens too, so the glass
// refracts it instead of covering it. Images first (a button's blob), then its text on top.
function paintControl(ctx: CanvasRenderingContext2D, control: HTMLElement) {
  const style = getComputedStyle(control);
  if (style.backgroundColor !== "rgba(0, 0, 0, 0)" && style.backgroundColor !== "transparent") {
    const rect = control.getBoundingClientRect();
    ctx.fillStyle = style.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(rect.left, rect.top, rect.width, rect.height, parseFloat(style.borderTopLeftRadius) || 0);
    ctx.fill();
  }
  control.querySelectorAll<HTMLImageElement>("img").forEach((img) => paintImage(ctx, img, img.getBoundingClientRect()));
  const range = document.createRange();
  const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim();
    if (!text || !node.parentElement) continue;
    range.selectNodeContents(node);
    paintText(ctx, text, range.getBoundingClientRect(), getComputedStyle(node.parentElement));
  }
}

export function createGlassLens(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return null;
  const shaders: WebGLShader[] = [];
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Shader unavailable");
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error("Shader compilation failed");
    return shader;
  };
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const dispose = () => {
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(texture);
  };
  if (!program || !buffer || !texture) { dispose(); return null; }
  try {
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Shader linking failed");
  } catch { dispose(); return null; }
  const source = document.createElement("canvas");
  source.width = source.height = TEXTURE_SIZE * RESOLUTION;
  const ctx = source.getContext("2d");
  if (!ctx) { dispose(); return null; }
  canvas.width = WIDTH * RESOLUTION;
  canvas.height = HEIGHT * RESOLUTION;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, "scene"), 0);
  const shapeLocation = gl.getUniformLocation(program, "shape");
  const pixelRatio = gl.getUniformLocation(program, "pixelRatio");

  return {
    draw(
      x: number, y: number, hero: HTMLElement, width = LENS_SIZE, height = LENS_SIZE, corner = LENS_SIZE / 2, snap = 0,
      control: HTMLElement | null = null,
    ) {
      if (gl.isContextLost()) throw new Error("WebGL context lost");
      ctx.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
      ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
      ctx.translate(TEXTURE_SIZE / 2 - x, TEXTURE_SIZE / 2 - y);
      const overlaps = (rect: DOMRect) => rect.right > x - TEXTURE_SIZE / 2 && rect.left < x + TEXTURE_SIZE / 2 && rect.bottom > y - TEXTURE_SIZE / 2 && rect.top < y + TEXTURE_SIZE / 2;
      hero.querySelectorAll<HTMLElement>("[data-hero-letter]").forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        if (!overlaps(rect)) return;
        paintText(ctx, letter.textContent ?? "", rect, getComputedStyle(letter));
      });
      hero.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (overlaps(rect)) paintImage(ctx, img, rect);
      });
      if (control) paintControl(ctx, control);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.uniform1f(pixelRatio, window.devicePixelRatio || 1);
      gl.uniform4f(shapeLocation, width, height, corner, snap);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    dispose,
  };
}
