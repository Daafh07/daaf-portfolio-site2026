"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { sound } from "@/lib/sound/engine";
import { INTRO } from "../introConfig";
import { bandPath, clamp, demoPull, launchVelocity, softPull, strainOf } from "./slingshotPhysics";

const SLING = INTRO.slingshot;
const DUST = SLING.dust;
const MAX_SPECKS = DUST.max;
const BAND_END_RADIUS = SLING.ballRadius * 0.85; // the band wraps a little inside the D

/** Where the D hit the canvas: its center in the viewport and its rendered font size. */
export type ImpactPoint = { x: number; y: number; fontSize: number };

type Phase = "rest" | "held" | "fly" | "gone";
type Speck = { x: number; y: number; vx: number; vy: number; t: number; life: number; width: number };

type SlingshotProps = {
  /** First time the D is grabbed (or fired with the keyboard). */
  onGrab: () => void;
  /** The D hit the canvas. From here the intro takes over the letter. */
  onImpact: (point: ImpactPoint) => void;
};

// The D in an elastic band. Everything moves in one requestAnimationFrame loop that writes
// transforms straight to the DOM: physics needs a new position every frame, which would be
// far too many React renders.
export function Slingshot({ onGrab, onImpact }: SlingshotProps) {
  const ballRef = useRef<HTMLButtonElement>(null);
  const bandRef = useRef<SVGPathElement>(null);
  const dustRef = useRef<SVGGElement>(null);
  const callbacks = useRef({ onGrab, onImpact });
  const sim = useRef({
    phase: "rest" as Phase,
    // socket (anchor) and ball
    ax: 0,
    ay: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    // where the band holds the ball; springs back to the socket after firing
    bx: 0,
    by: 0,
    bvx: 0,
    bvy: 0,
    grip: null as { id: number; dx: number; dy: number } | null,
    strain: 0,
    pull: 0, // how far the D was pulled when it was released (0 to 1)
    notch: 0, // pull step that last played a tick
    taut: false, // the band is at its limit (the groan has played)
    grabbed: false,
    clock: 0, // seconds since the game appeared, drives the idle demo
    hover: false,
    hoverAmount: 0, // eases 0 → 1 while hovered
    specks: [] as Speck[],
  });

  useEffect(() => {
    callbacks.current = { onGrab, onImpact };
  });

  useEffect(() => {
    const s = sim.current;

    const place = () => {
      s.ax = window.innerWidth / 2;
      s.ay = window.innerHeight * SLING.anchorY;
      if (s.phase === "rest") {
        s.x = s.bx = s.ax;
        s.y = s.by = s.ay;
      }
    };
    place();

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      for (let i = 0; i < 3; i++) step(dt / 3);
      render(now / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (e.defaultPrevented || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      if (target instanceof Element && target !== ballRef.current &&
          target.closest("button, a, input, textarea, select, [contenteditable], [role=button]")) return;
      if ((e.key === " " || e.key === "Enter") && s.phase === "rest") {
        e.preventDefault();
        sound.unlock();
        grab();
        fire(0, SLING.keyboardPull * SLING.maxPull);
      }
    };

    window.addEventListener("resize", place);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("keydown", onKey);
    };
    // step/render/fire only touch the sim ref, so the loop is set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function grab() {
    const s = sim.current;
    if (s.grabbed) return;
    s.grabbed = true;
    callbacks.current.onGrab();
  }

  function burst(x: number, y: number, angle: number, spread: number, count: number, speed: number) {
    const s = sim.current;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * (0.5 + Math.random() * 0.8);
      s.specks.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        t: 0,
        life: DUST.life[0] + Math.random() * (DUST.life[1] - DUST.life[0]),
        width: 1 + Math.random() * 1.2,
      });
    }
    if (s.specks.length > MAX_SPECKS) s.specks.splice(0, s.specks.length - MAX_SPECKS);
  }

  /** Release with the ball pulled (dx, dy) away from the socket. */
  function fire(dx: number, dy: number) {
    const s = sim.current;
    const { vx, vy } = launchVelocity(dx, dy, SLING.maxPull, window.innerWidth);
    s.x = s.ax + dx;
    s.y = s.ay + dy;
    s.vx = vx;
    s.vy = vy;
    s.phase = "fly";
    s.strain = 0;
    const pull = clamp(Math.hypot(dx, dy) / SLING.maxPull, 0, 1);
    s.pull = pull;
    // The release is the first moment a phone lets audio start, so wait for it to wake up.
    void sound.unlock().then(() => sound.play("release", pull));
    const puff = DUST.launch;
    burst(
      s.ax,
      s.ay,
      Math.atan2(vy, vx),
      puff.spread,
      Math.round(puff.count + pull * puff.perPull),
      puff.speed + pull * puff.speedPerPull,
    );
  }

  // The D hides here and the intro shows its own D in the exact same spot, so it seems to fly on.
  function impact() {
    const s = sim.current;
    s.phase = "gone";
    sound.play("impact", s.pull);
    burst(s.x, s.y, 0, Math.PI * 2, DUST.impact.count, DUST.impact.speed);
    const band = bandRef.current;
    if (band) {
      band.style.transition = `opacity ${SLING.bandFadeOut}s ease-out`;
      band.style.opacity = "0";
    }
    const fontSize = ballRef.current ? parseFloat(getComputedStyle(ballRef.current).fontSize) : SLING.fontSize;
    callbacks.current.onImpact({ x: s.x, y: s.y, fontSize });
  }

  function step(dt: number) {
    const s = sim.current;
    s.clock += dt;
    s.hoverAmount += ((s.hover ? 1 : 0) - s.hoverAmount) * (1 - Math.exp(-12 * dt));

    // Until someone grabs it, the D demonstrates the pull straight down.
    if (s.phase === "rest" && !s.grabbed) {
      s.x = s.ax;
      s.y = s.ay + demoPull(s.clock);
    }

    // Band: follows the ball while held, otherwise a damped spring back to the socket.
    if (s.phase === "held" || s.phase === "rest") {
      s.bx = s.x;
      s.by = s.y;
      s.bvx = s.bvy = 0;
    } else {
      const { stiffness, damping } = SLING.band;
      s.bvx += (-stiffness * (s.bx - s.ax) - damping * s.bvx) * dt;
      s.bvy += (-stiffness * (s.by - s.ay) - damping * s.bvy) * dt;
      s.bx += s.bvx * dt;
      s.by += s.bvy * dt;
    }

    // Dust: drag slows the specks, a little gravity pulls them down.
    const drag = Math.exp(-DUST.drag * dt);
    for (const p of s.specks) {
      p.t += dt;
      p.vx *= drag;
      p.vy = p.vy * drag + DUST.fall * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    s.specks = s.specks.filter((p) => p.t < p.life);

    if (s.phase === "fly") {
      const wasRising = s.vy < 0;
      s.vy += SLING.gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // The D hits the canvas at the top of its arc, or earlier when it reaches an edge.
      const r = SLING.ballRadius;
      const atEdge = s.x < r || s.x > window.innerWidth - r || s.y < r || s.y > window.innerHeight - r;
      if (atEdge || (wasRising && s.vy >= 0)) {
        s.x = clamp(s.x, r, window.innerWidth - r);
        s.y = clamp(s.y, r, window.innerHeight - r);
        impact();
      }
    }
  }

  function render(time: number) {
    const s = sim.current;
    const r = SLING.ballRadius;

    // Tremble at the pull limit.
    const shake = s.phase === "held" ? s.strain * SLING.tremble : 0;
    const jx = shake * Math.sin(time * 57);
    const jy = shake * Math.cos(time * 44);

    const ball = ballRef.current;
    if (ball) {
      // Squash and stretch along the direction of flight.
      const { speed, max, squash } = SLING.stretch;
      const stretch = s.phase === "fly" ? max * clamp(Math.hypot(s.vx, s.vy) / speed, 0, 1) : 0;
      const angle = Math.atan2(s.vy, s.vx);
      const grow = 1 + (SLING.hoverScale - 1) * s.hoverAmount;
      ball.style.transform =
        `translate(${(s.x + jx - r).toFixed(2)}px, ${(s.y + jy - r).toFixed(2)}px) ` +
        `rotate(${angle}rad) scale(${(1 + stretch) * grow}, ${(1 - stretch * squash) * grow}) rotate(${-angle}rad)`;
      ball.style.opacity = s.phase === "gone" ? "0" : "1";
    }

    const band = bandRef.current;
    if (band) {
      const hold = s.phase === "held" ? { x: s.bx + jx, y: s.by + jy } : { x: s.bx, y: s.by };
      band.setAttribute("d", bandPath(s.ax, s.ay, SLING.socketRadius, hold.x, hold.y, BAND_END_RADIUS));
    }

    const dust = dustRef.current;
    if (dust) {
      for (let i = 0; i < dust.children.length; i++) {
        const line = dust.children[i];
        const p = s.specks[i];
        if (!p) {
          line.setAttribute("opacity", "0");
          continue;
        }
        const speed = Math.hypot(p.vx, p.vy) || 1;
        const length = clamp(speed * 0.03, 2, 10);
        line.setAttribute("x1", p.x.toFixed(1));
        line.setAttribute("y1", p.y.toFixed(1));
        line.setAttribute("x2", (p.x - (p.vx / speed) * length).toFixed(1));
        line.setAttribute("y2", (p.y - (p.vy / speed) * length).toFixed(1));
        line.setAttribute("stroke-width", p.width.toFixed(2));
        line.setAttribute("opacity", (0.55 * (1 - p.t / p.life) ** 1.6).toFixed(3));
      }
    }
  }

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    const s = sim.current;
    if (s.phase !== "rest" || e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    s.grip = { id: e.pointerId, dx: s.x - e.clientX, dy: s.y - e.clientY };
    s.phase = "held";
    sound.unlock();
    sound.play("grab");
    grab();
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const s = sim.current;
    if (!s.grip || e.pointerId !== s.grip.id) return;
    let dx = e.clientX + s.grip.dx - s.ax;
    let dy = e.clientY + s.grip.dy - s.ay;
    const dist = Math.hypot(dx, dy);
    const pull = softPull(dist / SLING.maxPull);
    if (dist > 0) {
      dx *= (pull * SLING.maxPull) / dist;
      dy *= (pull * SLING.maxPull) / dist;
    }
    s.x = s.ax + dx;
    s.y = s.ay + dy;
    s.strain = strainOf(pull);

    // A tick for every step further, and a groan when the band reaches its limit.
    const notch = Math.floor(pull * SLING.sound.notches);
    if (notch > s.notch) sound.play("stretch", pull);
    s.notch = notch;
    const taut = s.strain > SLING.sound.strainAt;
    if (taut && !s.taut) sound.play("strain");
    s.taut = taut;
  };

  const onPointerCancel = (e: PointerEvent<HTMLButtonElement>) => {
    const s = sim.current;
    if (s.grip?.id !== e.pointerId) return;
    s.grip = null;
    s.phase = "rest";
    s.x = s.ax;
    s.y = s.ay;
    s.strain = s.notch = 0;
    s.taut = false;
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const s = sim.current;
    if (!s.grip || e.pointerId !== s.grip.id) return;
    s.grip = null;
    s.notch = 0;
    s.taut = false;
    const dx = s.x - s.ax;
    const dy = s.y - s.ay;
    if (Math.hypot(dx, dy) < SLING.minPull) {
      s.phase = "rest";
      s.x = s.ax;
      s.y = s.ay;
      s.strain = 0;
      return;
    }
    fire(dx, dy);
  };

  return (
    <>
      <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
        <path ref={bandRef} className="fill-bg/8" />
        <g ref={dustRef} className="stroke-bg" strokeLinecap="round">
          {Array.from({ length: MAX_SPECKS }, (_, i) => (
            <line key={i} opacity="0" />
          ))}
        </g>
      </svg>
      <button
        ref={ballRef}
        type="button"
        aria-label="Shoot the D to open the page"
        onPointerEnter={(e) => e.pointerType === "mouse" && (sim.current.hover = true)}
        onPointerLeave={() => (sim.current.hover = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onPointerCancel}
        className="pointer-events-auto absolute top-0 left-0 flex cursor-grab touch-none items-center justify-center rounded-full font-blur leading-none text-bg select-none will-change-transform active:cursor-grabbing"
        style={{
          width: SLING.ballRadius * 2,
          height: SLING.ballRadius * 2,
          fontSize: `min(${SLING.fontSize}px, 20vw)`,
          transform: "translate(-200vw, 0)",
        }}
      >
        D
      </button>
    </>
  );
}
