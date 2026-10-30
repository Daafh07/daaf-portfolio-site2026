export const SNAP_DISTANCE = 12;
export const RELEASE_DISTANCE = 17;
export const SNAP_SELECTOR = '[data-intro-target="sticker"], [data-glass-snap], a[href], button, [role="button"]';
export const magneticOffsets = new WeakMap<HTMLElement, { x: number; y: number }>();
export const isMagneticIcon = (element: HTMLElement) => element.matches('[data-intro-target="sticker"]');

export function restingBox(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const offset = magneticOffsets.get(element) ?? { x: 0, y: 0 };
  return { left: rect.left - offset.x, right: rect.right - offset.x, top: rect.top - offset.y,
    bottom: rect.bottom - offset.y, width: rect.width, height: rect.height };
}

export function snapBox(element: HTMLElement) {
  const box = restingBox(element);
  // The reference has a separate, stationary Snapme area around each icon.
  // Its padding is asymmetric by 1px; the visible icon can move independently.
  const sides = isMagneticIcon(element) ? [45, 46, 38, 37].map((v) => v * .95) : [0, 0, 0, 0];
  return { left: box.left - sides[0], right: box.right + sides[1], top: box.top - sides[2],
    bottom: box.bottom + sides[3], width: box.width + sides[0] + sides[1], height: box.height + sides[2] + sides[3] };
}

export function distanceToBox(x: number, y: number, box: { left: number; right: number; top: number; bottom: number }) {
  return Math.hypot(Math.max(box.left - x, 0, x - box.right), Math.max(box.top - y, 0, y - box.bottom));
}

export function findSnapTarget(x: number, y: number, current: HTMLElement | null) {
  const eligible = (element: HTMLElement) => {
    const box = snapBox(element);
    const style = getComputedStyle(element);
    return element.isConnected && box.width > 0 && box.height > 0 && box.width < 280 && box.height < 280 &&
      style.visibility === "visible" && style.display !== "none" && Number(style.opacity) > 0 &&
      !element.closest('[inert], [disabled], [aria-disabled="true"], [data-glass-ignore], .intro');
  };
  if (current && eligible(current) && distanceToBox(x, y, snapBox(current)) <= RELEASE_DISTANCE) return current;
  let closest: HTMLElement | null = null;
  let distance = Infinity;
  for (const element of document.querySelectorAll<HTMLElement>(SNAP_SELECTOR)) {
    if (!eligible(element)) continue;
    const box = snapBox(element);
    const next = distanceToBox(x, y, box);
    if (next > SNAP_DISTANCE || next >= distance) continue;
    // Is something lying over it? Test the center: the bounding box of a rotated icon has corners
    // and edges that are not part of the icon, so a point on that box can miss the icon itself.
    const actual = element.getBoundingClientRect();
    const hit = document.elementFromPoint(actual.left + actual.width / 2, actual.top + actual.height / 2);
    if (hit && hit !== element && !element.contains(hit)) continue;
    closest = element;
    distance = next;
  }
  return closest;
}
