// Paints the part of the page that lies under the glass lens into a 2D canvas.
//
// The lens is a WebGL shader and cannot read the page, so whatever it bends has to be redrawn by
// hand. This site is text and images (a button is a stretched image with text on top), so that is
// what is painted:
// - text, word by word, so wrapped and centred text lands exactly where the browser put it
// - images, with their rotation and scale, object-fit and rounded corners (the photo cards)
// Backgrounds, borders and shadows are not painted: nothing on the page uses them yet.
//
// Everything is painted in viewport coordinates. The caller moves the canvas to the lens first.

export type Region = { left: number; top: number; right: number; bottom: number };

type Item = Text | HTMLImageElement;

const SKIPPED = "script, style, noscript, canvas, svg, .intro, [data-glass-ignore]";

let items: Item[] = [];
let dirty = true;
let observer: MutationObserver | undefined;

const overlaps = (rect: Pick<DOMRect, "left" | "top" | "right" | "bottom">, region: Region) =>
  rect.right > region.left && rect.left < region.right && rect.bottom > region.top && rect.top < region.bottom;

// The page changes rarely compared to how often the lens redraws, so the text nodes and images
// are collected once and again only after the DOM changes. Their positions are read every frame.
function collect() {
  items = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
      const element = node as Element;
      if (element.matches(SKIPPED)) return NodeFilter.FILTER_REJECT; // the whole subtree
      return element instanceof HTMLImageElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) items.push(node as Item);
  dirty = false;
}

function watchPage() {
  if (observer) return;
  observer = new MutationObserver(() => { dirty = true; });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

/** Stops watching the page. */
export function disposeScene() {
  observer?.disconnect();
  observer = undefined;
  items = [];
  dirty = true;
}

// How visible an element really is: hidden things are skipped, faded things are drawn faded.
// Memoised per frame because many elements share the same ancestors.
function alphaOf(element: Element | null, memo: Map<Element, number>): number {
  if (!element || element === document.documentElement) return 1;
  const known = memo.get(element);
  if (known !== undefined) return known;
  const style = getComputedStyle(element);
  const own = style.display === "none" || style.visibility === "hidden" ? 0 : Number(style.opacity);
  const alpha = own === 0 ? 0 : own * alphaOf(element.parentElement, memo);
  memo.set(element, alpha);
  return alpha;
}

function transformCase(word: string, transform: string) {
  if (transform === "uppercase") return word.toUpperCase();
  if (transform === "lowercase") return word.toLowerCase();
  return word;
}

function paintText(
  ctx: CanvasRenderingContext2D, node: Text, region: Region,
  memo: Map<Element, number>, boxes: Map<Element, DOMRect>, range: Range,
) {
  const element = node.parentElement;
  if (!element) return;
  let box = boxes.get(element);
  if (!box) boxes.set(element, (box = element.getBoundingClientRect()));
  if (!overlaps(box, region)) return;
  const alpha = alphaOf(element, memo);
  if (alpha === 0) return;

  const style = getComputedStyle(element);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "alphabetic";
  if ("letterSpacing" in ctx) ctx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
  const metrics = ctx.measureText("Hg");
  const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8;
  const descent = metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.2;

  for (const word of node.data.matchAll(/\S+/g)) {
    const start = word.index ?? 0;
    range.setStart(node, start);
    range.setEnd(node, start + word[0].length);
    const rect = range.getBoundingClientRect();
    if (!overlaps(rect, region)) continue;
    ctx.fillText(transformCase(word[0], style.textTransform), rect.left, rect.top + (rect.height - ascent - descent) / 2 + ascent);
  }
  ctx.restore();
}

// The rotation and scale an element ends up with, from its own transform and all its ancestors'.
// Only the linear part matters: the position comes from the bounding box, whose center is the
// center of the transformed element.
function linearTransform(element: Element) {
  let matrix = new DOMMatrix();
  for (let e: Element | null = element; e && e !== document.documentElement; e = e.parentElement) {
    const transform = getComputedStyle(e).transform;
    if (transform !== "none") matrix = new DOMMatrix(transform).multiply(matrix);
  }
  return matrix;
}

// An image is clipped by its own rounded corners, or by its parent (a card with overflow hidden).
function cornerRadius(image: HTMLImageElement, width: number, height: number) {
  for (const element of [image, image.parentElement]) {
    if (!element) continue;
    const style = getComputedStyle(element);
    if (element !== image && style.overflow === "visible") continue;
    const raw = style.borderTopLeftRadius;
    const value = parseFloat(raw);
    if (value > 0) return raw.endsWith("%") ? (value / 100) * Math.min(width, height) : value;
  }
  return 0;
}

// "8% 50%" → [0.08, 0.5]. Anything that is not a percentage counts as centered.
const objectPosition = (value: string) => value.split(" ").slice(0, 2).map((part) => (part.endsWith("%") ? parseFloat(part) / 100 : 0.5));

function paintImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, region: Region, memo: Map<Element, number>) {
  if (!image.complete || !image.naturalWidth) return;
  const rect = image.getBoundingClientRect();
  if (!overlaps(rect, region)) return;
  const alpha = alphaOf(image, memo);
  if (alpha === 0) return;

  const style = getComputedStyle(image);
  const width = image.offsetWidth; // the size before any transform
  const height = image.offsetHeight;
  const { a, b, c, d } = linearTransform(image);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(rect.left + rect.width / 2, rect.top + rect.height / 2);
  ctx.transform(a, b, c, d, 0, 0);
  const radius = cornerRadius(image, width, height);
  if (radius) {
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, radius);
    ctx.clip();
  }
  if (style.objectFit === "cover") {
    const { naturalWidth: nw, naturalHeight: nh } = image;
    const scale = Math.max(width / nw, height / nh);
    const sw = width / scale;
    const sh = height / scale;
    const [px, py] = objectPosition(style.objectPosition);
    ctx.drawImage(image, (nw - sw) * px, (nh - sh) * py, sw, sh, -width / 2, -height / 2, width, height);
  } else {
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  }
  ctx.restore();
}

/** Paints everything of the page that falls inside `region` (viewport coordinates). */
export function paintScene(ctx: CanvasRenderingContext2D, region: Region) {
  watchPage();
  if (dirty) collect();
  const memo = new Map<Element, number>();
  const boxes = new Map<Element, DOMRect>();
  const range = document.createRange();
  for (const item of items) {
    if (item instanceof HTMLImageElement) paintImage(ctx, item, region, memo);
    else paintText(ctx, item, region, memo, boxes, range);
  }
}
