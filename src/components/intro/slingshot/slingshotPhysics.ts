import { INTRO } from "../introConfig";

const SLING = INTRO.slingshot;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const SOFT_START = 0.55;

/**
 * Pull resistance. Up to 55% of the max pull the band follows the pointer 1:1. After that it
 * gets heavier, easing towards a limit it never quite reaches (like rubber at full stretch).
 * Input is the pointer distance as a fraction of maxPull, output the actual pull, also as a fraction.
 */
export function softPull(n: number) {
  if (n <= SOFT_START) return n;
  const room = 1 - SOFT_START;
  return SOFT_START + room * (1 - Math.exp(-(n - SOFT_START) / room));
}

/** 0 → 1 over the last stretch of the pull (from 80% to 95%): drives the trembling at the limit. */
export function strainOf(pull: number) {
  const t = clamp((pull - 0.8) / 0.15, 0, 1);
  return t * t * (3 - 2 * t);
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * The idle demo: how far (px) the D pulls itself back at `time` seconds after the game appeared.
 * Pull out smoothly, hold, then a damped wobble back to rest, like a released band.
 */
export function demoPull(time: number) {
  const { start, every, pull, out, hold } = SLING.demo;
  if (time < start) return 0;
  const t = (time - start) % every;
  const depth = pull * SLING.maxPull;
  if (t < out) return easeInOut(t / out) * depth;
  if (t < out + hold) return depth;
  const back = t - out - hold;
  return depth * Math.exp(-7 * back) * Math.cos(20 * back);
}

/**
 * Launch velocity in px/s: opposite to the pull, and the speed grows with the pull along a
 * curve, so short pulls launch gently and long pulls hard. Desktop launches a bit faster.
 */
export function launchVelocity(dx: number, dy: number, maxPull: number, viewportWidth: number) {
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { vx: 0, vy: 0 };
  const top = viewportWidth >= SLING.desktopFrom ? SLING.topSpeed.desktop : SLING.topSpeed.mobile;
  const speed = top * clamp(dist / maxPull, 0, 1) ** SLING.launchCurve;
  return { vx: (-dx / dist) * speed, vy: (-dy / dist) * speed };
}

/**
 * The band: the outline around two circles (the socket and the ball), like a rubber band
 * stretched over both. When the circles overlap it is just the socket.
 */
export function bandPath(ax: number, ay: number, r1: number, bx: number, by: number, r2: number) {
  const circle = `M${ax - r1},${ay}a${r1},${r1} 0 1,0 ${r1 * 2},0a${r1},${r1} 0 1,0 ${-r1 * 2},0Z`;
  const d = Math.hypot(bx - ax, by - ay);
  if (d <= Math.abs(r1 - r2) + 0.5) return circle;

  // The outer tangent lines touch both circles at this angle either side of the line between them.
  const heading = Math.atan2(by - ay, bx - ax);
  const spread = Math.acos(clamp((r1 - r2) / d, -1, 1));
  const at = (cx: number, cy: number, r: number, angle: number) =>
    `${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`;

  return [
    `M${at(ax, ay, r1, heading + spread)}`,
    `L${at(bx, by, r2, heading + spread)}`,
    `A${r2},${r2} 0 0,0 ${at(bx, by, r2, heading - spread)}`,
    `L${at(ax, ay, r1, heading - spread)}`,
    `A${r1},${r1} 0 1,0 ${at(ax, ay, r1, heading + spread)}Z`,
  ].join("");
}
