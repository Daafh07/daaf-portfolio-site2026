"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/* ══ The statement's backdrop: circles made of dots ═══════════
   The behaviour and the numbers of the dots come from Bencho's Particles (bencho.dev/blocks/particles,
   MIT licence, bencho.dev/licence): a dot springs toward its home, is pushed away from the pointer,
   is thrown out by a shockwave, and is drawn a little long along the way it moves. What is different
   here is the home. In Bencho the homes are a still shape; here they are points on loose circles that
   draw themselves and turn as you scroll, so the dots follow their homes round on the spring, a
   little late, which is what makes the turning read as a flow rather than a rotation.

   ── ONE SPRING, FOR EVERYTHING THAT SETTLES ─────────────
   Frames, not milliseconds. `dt` is in sixtieths of a second and the damping is RAISED to it rather
   than multiplied by it, so a dropped frame takes the same amount of energy as the two frames it
   replaced. (Bencho's reasoning, and it holds here.) The loop parks itself the moment nothing moves. */
export type ParticlesHandle = {
  /** How far the sentence is typed, 0 to 1: the circles draw themselves and turn. */
  setProgress: (q: number) => void;
  /** True once the sentence is complete: a wave runs out from the middle and throws the dots out. */
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
/* Bencho's numbers: how hard the spring pulls (per frame), how much of the speed is left each frame,
   how far the pointer reaches (px), and how hard it pushes (its `force` of 60 gives 0.6 * 11) */
const PULL = 0.05;
const KEEP = 0.84;
const REACH = 100;
const PUSH = 6.6;
const WAVE_DELAY = 0.4; // s after "done", the same as the CSS wave rings, which start with the circles gone
const WAVE_TIME = 2.2; // s for the wave to reach the corners

type Dot = { ring: number; u: number; jitter: number; size: number; x: number; y: number; vx: number; vy: number; hit: number };

// Small seeded random numbers: the dots are the same on every load (and on the server).
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

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
    let q = 0; // progress as asked for
    let done = false;
    let waveTime = -1; // seconds since the wave started; -1 when it is not running
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let prev = 0;

    // Where on screen a dot's home is: its circle, turned by the progress.
    const home = (dot: Dot) => {
      const ring = RINGS[dot.ring];
      const angle = ring.rot + ring.dir * (2 * Math.PI * dot.u + ring.spin * q);
      const radius = (ring.r + dot.jitter) * scale;
      return [width / 2 + ring.dx * scale + Math.cos(angle) * radius, height / 2 + ring.dy * scale + Math.sin(angle) * radius] as const;
    };

    const build = () => {
      const rand = random(7);
      dots = [];
      RINGS.forEach((ring, k) => {
        const count = Math.max(12, Math.round((2 * Math.PI * ring.r * scale) / SPACING));
        for (let i = 0; i < count; i++) {
          const dot: Dot = { ring: k, u: (i + rand() * 0.6) / count, jitter: (rand() - 0.5) * 10, size: 1.3 + rand() * 1.7, x: 0, y: 0, vx: 0, vy: 0, hit: -1 };
          [dot.x, dot.y] = home(dot);
          dots.push(dot);
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
      run();
    };

    // One frame: move the dots, draw them. Returns true while anything is still moving.
    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      if (done && waveTime >= 0) waveTime += dt / 60;
      const front = waveTime > WAVE_DELAY ? (1 - Math.pow(1 - Math.min(1, (waveTime - WAVE_DELAY) / WAVE_TIME), 3)) * Math.hypot(width, height) * 0.55 : -1;
      const cx = width / 2;
      const cy = height / 2;
      let busy = !!pointer || (done && waveTime >= 0 && waveTime < WAVE_DELAY + WAVE_TIME + 1);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#f9007e";
      const drawn: { dot: Dot; alpha: number; speed: number }[] = [];

      for (const dot of dots) {
        const ring = RINGS[dot.ring];
        const [hx, hy] = home(dot);

        // The wave throws a dot out once, the moment its front passes the dot's place.
        if (front >= 0 && dot.hit < 0 && Math.hypot(hx - cx, hy - cy) <= front) {
          const away = Math.atan2(hy - cy, hx - cx);
          const kick = 9 + dot.size * 2.4;
          dot.vx += Math.cos(away) * kick;
          dot.vy += Math.sin(away) * kick;
          dot.hit = 0;
        }
        if (dot.hit >= 0) dot.hit += dt / 60;

        // The pointer pushes it away: the nearer, the harder (squared).
        if (pointer) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const dd = Math.hypot(dx, dy);
          if (dd < REACH && dd > 0.01) {
            const f = Math.pow(1 - dd / REACH, 2) * PUSH;
            dot.vx += (dx / dd) * f * dt;
            dot.vy += (dy / dd) * f * dt;
          }
        }
        // The spring toward home, then the damping.
        dot.vx = (dot.vx + (hx - dot.x) * PULL * dt) * Math.pow(KEEP, dt);
        dot.vy = (dot.vy + (hy - dot.y) * PULL * dt) * Math.pow(KEEP, dt);
        dot.x += dot.vx * dt;
        dot.y += dot.vy * dt;
        if (Math.abs(hx - dot.x) < 0.05 && Math.abs(hy - dot.y) < 0.05 && Math.abs(dot.vx) < 0.02 && Math.abs(dot.vy) < 0.02) {
          dot.x = hx;
          dot.y = hy;
          dot.vx = 0;
          dot.vy = 0;
        } else busy = true;

        // Visible from the start of its circle up to how far the circle has drawn; faint at both ends.
        const progress = clamp((q - ring.start) / ring.span, 0, 1);
        const head = clamp((progress - dot.u) * 14, 0, 1);
        if (head <= 0) continue;
        const along = 0.14 + 0.86 * Math.sin(Math.PI * Math.min(1, dot.u * 0.9 + 0.05));
        const gone = dot.hit >= 0 ? Math.max(0, 1 - dot.hit / 0.9) : 1;
        const alpha = head * along * gone;
        if (alpha > 0.02) drawn.push({ dot, alpha, speed: Math.hypot(dot.vx, dot.vy) });
      }

      // A soft halo first, then the dots: round at rest, a little long along the way they move.
      for (const { dot, alpha } of drawn) {
        context.globalAlpha = alpha * 0.16;
        context.beginPath();
        context.arc(dot.x, dot.y, dot.size * 3.4, 0, 6.2832);
        context.fill();
      }
      for (const { dot, alpha, speed } of drawn) {
        context.globalAlpha = Math.min(1, alpha * 1.1);
        context.beginPath();
        if (speed < 0.3) {
          context.arc(dot.x, dot.y, dot.size, 0, 6.2832);
        } else {
          const s = Math.min(2.6, 1 + speed * 0.12);
          context.ellipse(dot.x, dot.y, dot.size * s, dot.size / Math.sqrt(s), Math.atan2(dot.vy, dot.vx), 0, 6.2832);
        }
        context.fill();
      }
      context.globalAlpha = 1;

      frame = busy ? requestAnimationFrame(tick) : 0;
    };

    function run() {
      if (still) {
        // No animation: put every dot at home, draw once.
        for (const dot of dots) [dot.x, dot.y] = home(dot);
        if (width) tick(performance.now());
        cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      if (frame || !width) return;
      prev = 0;
      frame = requestAnimationFrame(tick);
    }

    api.current = {
      setProgress: (value) => {
        q = value;
        run();
      },
      setDone: (value) => {
        if (value === done) return;
        done = value;
        waveTime = value ? 0 : -1;
        if (!value) for (const dot of dots) dot.hit = -1;
        run();
      },
    };

    // The pointer (mouse only): dots scatter from it, and a press sends out a shockwave.
    const rect = () => stage.getBoundingClientRect();
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || still) return;
      const box = rect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
      run();
    };
    const leave = () => {
      pointer = null;
      run();
    };
    const press = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || still) return;
      const box = rect();
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      for (const dot of dots) {
        const dx = dot.x - px;
        const dy = dot.y - py;
        const dd = Math.hypot(dx, dy);
        if (dd > 200 || dd < 0.01) continue;
        const f = (1 - dd / 200) * 30 * (0.4 + 0.6 * 1.2);
        dot.vx += (dx / dd) * f;
        dot.vy += (dy / dd) * f;
      }
      run();
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
