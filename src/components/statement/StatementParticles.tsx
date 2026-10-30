"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// The backdrop of the statement: dots on loose circles, in the pink of the first project. They are
// my own build (the behaviour is the familiar "dots scatter from the pointer and spring home; press
// for a shockwave"). While you scroll, each circle draws itself in dots and the circles turn at
// their own speed and direction; when the sentence is complete the dots are blown outward by a
// wave that runs from the middle, and are gone. Drawn on one canvas, and only while something moves.
export type ParticlesHandle = {
  /** How far the sentence is typed, 0 to 1. */
  setProgress: (q: number) => void;
  /** True once the sentence is complete: the wave runs. False again when scrolling back. */
  setDone: (done: boolean) => void;
};

// The circles, deliberately not tidy. `start` and `span` are fractions of the progress in which the
// circle draws itself; `rot` is where on the circle it starts (radians); `dir` is 1 or -1; `spin` is
// how far (radians) the whole circle turns over the whole progress. Sizes are in a 1000-unit box.
const RINGS = [
  { r: 70, dx: 0, dy: 0, rot: 0.7, dir: 1, start: 0.0, span: 0.4, spin: 2.6 },
  { r: 135, dx: -45, dy: 30, rot: 3.5, dir: -1, start: 0.1, span: 0.45, spin: 2.0 },
  { r: 195, dx: 55, dy: -40, rot: 5.4, dir: 1, start: 0.04, span: 0.5, spin: 1.6 },
  { r: 255, dx: -65, dy: -25, rot: 2.1, dir: -1, start: 0.22, span: 0.4, spin: 2.4 },
  { r: 325, dx: 35, dy: 65, rot: 4.4, dir: 1, start: 0.16, span: 0.5, spin: 1.2 },
  { r: 395, dx: -30, dy: -55, rot: 0.35, dir: -1, start: 0.36, span: 0.4, spin: 1.9 },
  { r: 465, dx: 75, dy: 20, rot: 2.8, dir: 1, start: 0.3, span: 0.5, spin: 1.0 },
  { r: 545, dx: -55, dy: 65, rot: 4.9, dir: -1, start: 0.46, span: 0.44, spin: 1.5 },
  { r: 625, dx: 20, dy: -35, rot: 1.6, dir: 1, start: 0.5, span: 0.5, spin: 0.9 },
];

const SPACING = 15; // px between dots on a circle
const SPRING = 22; // how hard a dot is pulled back home
const DAMPING = 5.5;
const POINTER_REACH = 110; // px: the pointer scatters dots within this
const WAVE_DELAY = 0.4; // s after "done", the same as the CSS wave rings, which start with the circles gone
const WAVE_TIME = 2.2; // s for the wave to reach the corners

type Dot = { ring: number; u: number; jitter: number; size: number; ox: number; oy: number; vx: number; vy: number; hit: number };

// Small seeded random numbers: the dots are the same on every load (and on the server).
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const StatementParticles = forwardRef<ParticlesHandle, { still?: boolean }>(function StatementParticles({ still = false }, handle) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<ParticlesHandle>({ setProgress: () => {}, setDone: () => {} });
  useImperativeHandle(handle, () => ({ setProgress: (q) => api.current.setProgress(q), setDone: (d) => api.current.setDone(d) }), []);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const stage = element.parentElement!;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let scale = 1;
    let dots: Dot[] = [];
    let target = 0; // progress as asked for
    let shown = 0; // progress as drawn: it follows the target a little late, which is what makes it flow
    let done = false;
    let waveTime = -1; // seconds since the wave started; -1 when it is not running
    let pointer: { x: number; y: number } | null = null;
    let pointerUntil = 0;
    let frame = 0;
    let last = 0;

    const build = () => {
      const rand = random(7);
      dots = [];
      RINGS.forEach((ring, k) => {
        const circumference = 2 * Math.PI * ring.r * scale;
        const count = Math.max(12, Math.round(circumference / SPACING));
        for (let i = 0; i < count; i++) {
          dots.push({ ring: k, u: (i + rand() * 0.6) / count, jitter: (rand() - 0.5) * 10, size: 1.3 + rand() * 1.7, ox: 0, oy: 0, vx: 0, vy: 0, hit: -1 });
        }
      });
    };

    const resize = () => {
      const box = stage.getBoundingClientRect();
      width = box.width;
      height = box.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      scale = (1.3 * Math.max(width, height)) / 1000; // the circles live in a box of 1.3 x the longest side
      build();
      schedule();
    };

    // One step: move the dots (pointer, wave, springs) and draw them. Returns true while anything moves.
    const step = (now: number, dt: number) => {
      shown += (target - shown) * Math.min(1, dt * 9);
      if (Math.abs(target - shown) < 0.0005) shown = target;
      if (done && waveTime >= 0) waveTime += dt;
      const front = waveTime > WAVE_DELAY ? (1 - Math.pow(1 - Math.min(1, (waveTime - WAVE_DELAY) / WAVE_TIME), 3)) * Math.hypot(width, height) * 0.55 : -1;
      const cx = width / 2;
      const cy = height / 2;
      const pointerOn = pointer !== null && now < pointerUntil;
      let moving = Math.abs(target - shown) > 0.0005 || (done && waveTime >= 0 && waveTime < WAVE_DELAY + WAVE_TIME + 1) || pointerOn;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#f9007e";
      const drawn: { x: number; y: number; alpha: number; size: number }[] = [];

      for (const dot of dots) {
        const ring = RINGS[dot.ring];
        const progress = Math.min(1, Math.max(0, (shown - ring.start) / ring.span));
        const angle = ring.rot + ring.dir * (2 * Math.PI * dot.u + ring.spin * shown);
        const radius = (ring.r + dot.jitter) * scale;
        const hx = cx + ring.dx * scale + Math.cos(angle) * radius;
        const hy = cy + ring.dy * scale + Math.sin(angle) * radius;

        // The wave blows a dot outward once, the moment its front passes the dot's place.
        if (front >= 0 && dot.hit < 0 && Math.hypot(hx - cx, hy - cy) <= front) {
          const away = Math.atan2(hy - cy, hx - cx);
          const kick = 520 + dot.size * 120;
          dot.vx += Math.cos(away) * kick;
          dot.vy += Math.sin(away) * kick;
          dot.hit = 0;
        }
        if (dot.hit >= 0) dot.hit += dt;

        // The pointer pushes dots away; they spring home.
        if (pointerOn) {
          const px = hx + dot.ox - pointer!.x;
          const py = hy + dot.oy - pointer!.y;
          const d = Math.hypot(px, py);
          if (d < POINTER_REACH && d > 0.01) {
            const push = (1 - d / POINTER_REACH) * 2600 * dt;
            dot.vx += (px / d) * push;
            dot.vy += (py / d) * push;
          }
        }
        dot.vx += (-SPRING * dot.ox - DAMPING * dot.vx) * dt;
        dot.vy += (-SPRING * dot.oy - DAMPING * dot.vy) * dt;
        dot.ox += dot.vx * dt;
        dot.oy += dot.vy * dt;
        if (Math.abs(dot.ox) + Math.abs(dot.oy) + Math.abs(dot.vx) + Math.abs(dot.vy) > 0.4) moving = true;

        // Visible from the start of its circle up to how far the circle has drawn; faint at both ends.
        const head = Math.min(1, Math.max(0, (progress - dot.u) * 14));
        if (head <= 0) continue;
        const along = 0.14 + 0.86 * Math.sin(Math.PI * Math.min(1, dot.u * 0.9 + 0.05));
        const gone = dot.hit >= 0 ? Math.max(0, 1 - dot.hit / 0.9) : 1;
        const alpha = head * along * gone;
        if (alpha > 0.02) drawn.push({ x: hx + dot.ox, y: hy + dot.oy, alpha, size: dot.size });
      }

      // A soft halo first, then the dots themselves.
      for (const dot of drawn) {
        context.globalAlpha = dot.alpha * 0.16;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.size * 3.4, 0, 6.2832);
        context.fill();
      }
      for (const dot of drawn) {
        context.globalAlpha = Math.min(1, dot.alpha * 1.1);
        context.beginPath();
        context.arc(dot.x, dot.y, dot.size, 0, 6.2832);
        context.fill();
      }
      context.globalAlpha = 1;
      return moving;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
      last = now;
      frame = step(now, dt) ? requestAnimationFrame(loop) : 0;
    };
    function schedule() {
      if (still) {
        shown = target;
        if (width) step(performance.now(), 0.016);
        return;
      }
      if (!frame && width) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    }

    api.current = {
      setProgress: (q) => {
        target = q;
        schedule();
      },
      setDone: (value) => {
        if (value === done) return;
        done = value;
        waveTime = value ? 0 : -1;
        if (!value) for (const dot of dots) Object.assign(dot, { ox: 0, oy: 0, vx: 0, vy: 0, hit: -1 });
        schedule();
      },
    };

    // The pointer (mouse only): dots scatter from it, and a press sends out a shockwave.
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || still) return;
      const box = stage.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      pointerUntil = performance.now() + 400;
      schedule();
    };
    const leave = () => {
      pointer = null;
    };
    const press = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || still) return;
      const box = stage.getBoundingClientRect();
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      for (const dot of dots) {
        const ring = RINGS[dot.ring];
        const angle = ring.rot + ring.dir * (2 * Math.PI * dot.u + ring.spin * shown);
        const radius = (ring.r + dot.jitter) * scale;
        const dx = width / 2 + ring.dx * scale + Math.cos(angle) * radius + dot.ox - px;
        const dy = height / 2 + ring.dy * scale + Math.sin(angle) * radius + dot.oy - py;
        const d = Math.hypot(dx, dy);
        if (d < 300 && d > 0.01) {
          const kick = (1 - d / 300) * 900;
          dot.vx += (dx / d) * kick;
          dot.vy += (dy / d) * kick;
        }
      }
      schedule();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    stage.addEventListener("pointermove", move, { passive: true });
    stage.addEventListener("pointerleave", leave);
    stage.addEventListener("pointerdown", press, { passive: true });
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
      stage.removeEventListener("pointerdown", press);
      api.current = { setProgress: () => {}, setDone: () => {} };
    };
  }, [still]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
});
