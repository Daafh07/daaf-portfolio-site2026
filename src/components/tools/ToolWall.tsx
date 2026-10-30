"use client";

import { useEffect, useRef } from "react";
import { insetStyle } from "@/components/projects/tileStyle";
import { TOOL_HEIGHT, TOOLS } from "@/data/tools";

// The tools as loose blobs. Each one lies where the normal layout puts it (so the wall reads, wraps
// and prints like a list), and is moved from there by a spring: the pointer pushes the ones it passes
// and they spring home, they push each other aside when they meet, and a click throws them out, after
// which they gather again. The numbers and the spring are the ones of the statement's dots, which come
// from Bencho's Particles (MIT, bencho.dev/licence): frames, not milliseconds, with the damping
// raised to the number of frames, so a dropped frame costs the same energy as the frames it replaced.
// The blobs are real elements that are moved with a transform, so they stay sharp, selectable and
// readable; the loop runs only while something moves.
const PULL = 0.05; // how hard the spring pulls a blob home (per frame)
const KEEP = 0.84; // how much of its speed it keeps each frame
const REACH = 150; // px: the pointer pushes blobs whose middle is within this
const PUSH = 7;
const SHOCK = 280; // px: a click throws out everything within this
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Body = { x: number; y: number; vx: number; vy: number; hx: number; hy: number; w: number; h: number };

export function ToolWall() {
  const list = useRef<HTMLUListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const element = list.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let bodies: Body[] = [];
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let prev = 0;

    // Where each blob lies in the layout (its middle, in the list's own coordinates).
    const measure = () => {
      bodies = items.current.map((item, index) => {
        const old = bodies[index];
        const w = item?.offsetWidth ?? 0;
        const h = item?.offsetHeight ?? 0;
        const hx = (item?.offsetLeft ?? 0) + w / 2;
        const hy = (item?.offsetTop ?? 0) + h / 2;
        return { x: old ? old.x - old.hx + hx : hx, y: old ? old.y - old.hy + hy : hy, vx: old?.vx ?? 0, vy: old?.vy ?? 0, hx, hy, w, h };
      });
    };

    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      let busy = !!pointer;

      for (const [i, a] of bodies.entries()) {
        if (pointer) {
          const dx = a.x - pointer.x;
          const dy = a.y - pointer.y;
          const dd = Math.hypot(dx, dy);
          if (dd < REACH && dd > 0.01) {
            const f = Math.pow(1 - dd / REACH, 2) * PUSH;
            a.vx += (dx / dd) * f * dt;
            a.vy += (dy / dd) * f * dt;
          }
        }
        // Blobs that meet push each other aside, along the way that overlaps least.
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j];
          const overlapX = (a.w + b.w) / 2 + 6 - Math.abs(a.x - b.x);
          const overlapY = (a.h + b.h) / 2 + 6 - Math.abs(a.y - b.y);
          if (overlapX <= 0 || overlapY <= 0) continue;
          const push = 0.06 * dt;
          if (overlapX < overlapY) {
            const s = Math.sign(a.x - b.x) || 1;
            a.vx += s * overlapX * push;
            b.vx -= s * overlapX * push;
          } else {
            const s = Math.sign(a.y - b.y) || 1;
            a.vy += s * overlapY * push;
            b.vy -= s * overlapY * push;
          }
        }
        a.vx = (a.vx + (a.hx - a.x) * PULL * dt) * Math.pow(KEEP, dt);
        a.vy = (a.vy + (a.hy - a.y) * PULL * dt) * Math.pow(KEEP, dt);
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        if (Math.abs(a.hx - a.x) < 0.05 && Math.abs(a.hy - a.y) < 0.05 && Math.abs(a.vx) < 0.02 && Math.abs(a.vy) < 0.02) {
          a.x = a.hx;
          a.y = a.hy;
          a.vx = 0;
          a.vy = 0;
        } else busy = true;

        // Moved by a transform, with a little lean into the way it is going.
        const item = items.current[i];
        if (item) {
          const moved = a.x !== a.hx || a.y !== a.hy;
          item.style.transform = moved ? `translate3d(${(a.x - a.hx).toFixed(2)}px, ${(a.y - a.hy).toFixed(2)}px, 0) rotate(${clamp(a.vx * 0.9, -14, 14).toFixed(2)}deg)` : "";
        }
      }
      frame = busy ? requestAnimationFrame(tick) : 0;
    };
    const run = () => {
      if (frame) return;
      prev = 0;
      frame = requestAnimationFrame(tick);
    };

    const local = (event: PointerEvent | MouseEvent) => {
      const box = element.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = local(event);
      run();
    };
    const leave = () => {
      pointer = null;
      run();
    };
    // A click (or a tap) throws the blobs near it out, away from the point.
    const press = (event: MouseEvent) => {
      const at = local(event);
      for (const body of bodies) {
        const dx = body.x - at.x;
        const dy = body.y - at.y;
        const dd = Math.hypot(dx, dy);
        if (dd > SHOCK || dd < 0.01) continue;
        const f = (1 - dd / SHOCK) * 30;
        body.vx += (dx / dd) * f;
        body.vy += (dy / dd) * f;
      }
      run();
    };

    measure();
    const observer = new ResizeObserver(() => {
      measure();
      run();
    });
    observer.observe(element);
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    element.addEventListener("click", press);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("click", press);
    };
  }, []);

  return (
    <ul ref={list} className="relative mx-auto flex max-w-[1160px] flex-wrap gap-[10px] pt-3 text-[13.6px] md:justify-center md:gap-3 md:pt-0 md:text-[17px]" style={{ touchAction: "pan-y" }}>
      {TOOLS.map((tool, index) => (
        <li
          key={tool.name}
          ref={(element) => {
            items.current[index] = element;
          }}
          className="relative flex items-center justify-center font-blur leading-none text-sub will-change-transform"
          style={{ width: `${tool.width}em`, height: `${TOOL_HEIGHT}em` }}
        >
          <span aria-hidden className="absolute" style={insetStyle(tool.inset)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative outline, sized by its box */}
            <img src={tool.shape} alt="" draggable={false} className="block size-full max-w-none select-none" />
          </span>
          <span className="relative top-[0.04em]">{tool.name}</span>
        </li>
      ))}
    </ul>
  );
}
