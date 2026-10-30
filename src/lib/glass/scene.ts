// Paints the part of the page that lies under the glass lens into a 2D canvas.
//
// The lens is a WebGL shader and cannot read the page, so whatever it bends has to be redrawn by
// hand. This site is text and images (a button is a stretched image with text on top), so that is
// what is painted:
// - text, word by word, so wrapped and centred text lands exactly where the browser put it
// - images, with their rotation and scale, object-fit and rounded corners (the photo cards)
// - background colours, with rounded corners and transparency (the menu bar is 92% dark and dims
//   the photos behind it)
// Background images, borders and shadows are not painted: nothing on the page uses them yet.
//
// Things are painted in the order the browser stacks them, not in document order: the fixed menu
// comes first in the HTML but lies above the content, and a card with a z-index lies above its
// neighbours.
//
// Everything is painted in viewport coordinates. The caller moves the canvas to the lens first.

export type Region = { left: number; top: number; right: number; bottom: number };

// A piece of the page to paint: text, an image, or the background of a box.
type Item = { kind: "text"; node: Text; element: Element } | { kind: "image"; element: HTMLImageElement } | { kind: "box"; element: Element };

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
      return (node as Element).matches(SKIPPED) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; // reject: the whole subtree
    },
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      items.push({ kind: "text", node: node as Text, element: node.parentElement as Element });
    } else if (node instanceof HTMLImageElement) {
      items.push({ kind: "image", element: node });
    } else if (hasBackground(node as Element)) {
      items.push({ kind: "box", element: node as Element });
    }
  }
  dirty = false;
}

// Whether an element has a background colour that is not fully transparent.
function hasBackground(element: Element) {
  const color = getComputedStyle(element).backgroundColor;
  return color !== "rgba(0, 0, 0, 0)" && color !== "transparent";
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
  // The browser rounds a font's ascent and descent to whole pixels and puts the baseline that far
  // below the top of the text's box. (Centring fractional metrics in the box put the text half a
  // pixel too high.)
  const metrics = ctx.measureText("Hg");
  const ascent = Math.round(metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8);

  for (const word of node.data.matchAll(/\S+/g)) {
    const start = word.index ?? 0;
    range.setStart(node, start);
    range.setEnd(node, start + word[0].length);
    const rect = range.getBoundingClientRect();
    if (!overlaps(rect, region)) continue;
    ctx.fillText(transformCase(word[0], style.textTransform), rect.left, rect.top + ascent);
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

// A box is clipped by its own rounded corners, or (for an image) by its parent: a card with overflow hidden.
function cornerRadius(box: Element, width: number, height: number) {
  for (const element of [box, box.parentElement]) {
    if (!element) continue;
    const style = getComputedStyle(element);
    if (element !== box && (style.overflow === "visible" || !(box instanceof HTMLImageElement))) continue;
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
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, cornerRadius(image, width, height));
  ctx.clip();
  if (style.objectFit === "cover") {
    // The image is scaled to cover the box and the box clips it. This avoids drawImage's source
    // rectangle, whose units do not match naturalWidth for the resized variants next/image serves.
    const { naturalWidth: nw, naturalHeight: nh } = image;
    const scale = Math.max(width / nw, height / nh);
    const [px, py] = objectPosition(style.objectPosition);
    ctx.drawImage(image, -width / 2 + (width - nw * scale) * px, -height / 2 + (height - nh * scale) * py, nw * scale, nh * scale);
  } else {
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  }
  ctx.restore();
}

// The background colour of a box, with its rounded corners.
function paintBox(ctx: CanvasRenderingContext2D, element: Element, region: Region, memo: Map<Element, number>) {
  const rect = element.getBoundingClientRect();
  if (!overlaps(rect, region)) return;
  const alpha = alphaOf(element, memo);
  if (alpha === 0) return;
  const style = getComputedStyle(element);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = style.backgroundColor;
  ctx.beginPath();
  ctx.roundRect(rect.left, rect.top, rect.width, rect.height, cornerRadius(element, rect.width, rect.height));
  ctx.fill();
  ctx.restore();
}

// Which layer an element is painted in, like the browser stacks them: plain content at the
// bottom, positioned elements above it, and an explicit z-index decides the rest. The outermost
// ancestor with a z-index counts, as everything inside it moves with it.
type Layer = { positioned: boolean; z: number | undefined };
function layerOf(element: Element, memo: Map<Element, Layer>): Layer {
  const known = memo.get(element);
  if (known) return known;
  const style = getComputedStyle(element);
  const own = style.position !== "static";
  const parent = element.parentElement && element.parentElement !== document.documentElement
    ? layerOf(element.parentElement, memo)
    : { positioned: false, z: undefined };
  const layer: Layer = {
    positioned: own || parent.positioned,
    z: parent.z ?? (own && style.zIndex !== "auto" ? Number(style.zIndex) : undefined),
  };
  memo.set(element, layer);
  return layer;
}

/** Paints everything of the page that falls inside `region` (viewport coordinates). */
export function paintScene(ctx: CanvasRenderingContext2D, region: Region) {
  watchPage();
  if (dirty) collect();
  const memo = new Map<Element, number>();
  const boxes = new Map<Element, DOMRect>();
  const layers = new Map<Element, Layer>();
  const range = document.createRange();

  // Only what is near the lens, in the order the browser would paint it.
  const nearby: { item: Item; layer: number; order: number }[] = [];
  items.forEach((item, order) => {
    let box = boxes.get(item.element);
    if (!box) boxes.set(item.element, (box = item.element.getBoundingClientRect()));
    if (!overlaps(box, region)) return;
    const layer = layerOf(item.element, layers);
    // Plain content (-1) lies below everything positioned (0), then come the z-indexes.
    nearby.push({ item, layer: layer.z ?? (layer.positioned ? 0 : -1), order });
  });
  nearby.sort((x, y) => x.layer - y.layer || x.order - y.order);

  for (const { item } of nearby) {
    if (item.kind === "image") paintImage(ctx, item.element, region, memo);
    else if (item.kind === "box") paintBox(ctx, item.element, region, memo);
    else paintText(ctx, item.node, region, memo, boxes, range);
  }
}
