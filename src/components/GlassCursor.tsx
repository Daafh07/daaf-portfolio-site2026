"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion";
import { createGlassLens, LENS_SIZE, GLASS_CANVAS_SIZE } from "@/lib/glass/lens";
import { findSnapTarget, isMagneticIcon, magneticOffsets, restingBox, snapBox } from "@/lib/glass/magnet";

// The cursor point: a small dot exactly on the pointer, so you can see where the lens is heading.
const DOT_SIZE = 10;

export function GlassCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    const hero = document.querySelector<HTMLElement>("[data-hero-wordmark]");
    if (!canvas || !dot || !hero) return;
    const mouse = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let lens: ReturnType<typeof createGlassLens> = null;
    let frame = 0, last = 0, pointerX = 0, pointerY = 0;
    let x = 0, y = 0, vx = 0, vy = 0, visible = false;
    let snapped: HTMLElement | null = null;
    let sceneControl: HTMLElement | null = null;
    // Width/height, attachment amount, attachment position, optical control blend.
    const shape = [LENS_SIZE, LENS_SIZE, 0, 0, 0, 0];
    const animations = new Map<number, ReturnType<typeof animate>>();
    const icons = new Map<HTMLElement, { x: number; y: number; vx: number; vy: number; original: string }>();
    const resetIcons = () => {
      icons.forEach((state, icon) => { icon.style.translate = state.original; magneticOffsets.delete(icon); });
      icons.clear();
    };
    const hide = () => {
      visible = false;
      snapped?.removeAttribute("data-glass-attached");
      snapped = sceneControl = null;
      animations.forEach((animation) => animation.stop());
      animations.clear();
      resetIcons();
      canvas.style.opacity = "0";
      dot.style.opacity = "0";
      document.documentElement.removeAttribute("data-glass-cursor");
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.documentElement.dataset.intro === "playing") { hide(); return; }
      if (snapped && !snapped.isConnected) { hide(); return; }
      const dt = Math.min((now - last) / 1000, .04);
      last = now;
      if (reduced.matches) { x = pointerX; y = pointerY - 6; vx = vy = 0; }
      else for (let step = 0; step < 4; step++) {
        vx += ((pointerX - x) * 500 - vx * 60) * dt / 4;
        vy += ((pointerY - 6 - y) * 500 - vy * 60) * dt / 4;
        x += vx * dt / 4;
        y += vy * dt / 4;
      }
      let moving = Math.hypot(pointerX - x, pointerY - 6 - y) > .02 || Math.hypot(vx, vy) > .1;
      icons.forEach((state, icon) => {
        const box = restingBox(icon);
        const inHover = !reduced.matches && pointerX >= box.left - 10 && pointerX <= box.right + 10 && pointerY >= box.top - 10 && pointerY <= box.bottom + 10;
        // Reference: 53px magnetic distance, smoothing 60 => stiffness 830/damping 100.
        // Measure against the moving image, while keeping the Snapme box stationary.
        const tx = inHover ? (pointerX - (box.left + box.width / 2 + state.x)) / (box.width / 2) * 53 * .95 : 0;
        const ty = inHover ? (pointerY - (box.top + box.height / 2 + state.y)) / (box.height / 2) * 53 * .95 : 0;
        for (let step = 0; step < 4; step++) {
          state.vx += ((tx - state.x) * 830 - state.vx * 100) * dt / 4;
          state.vy += ((ty - state.y) * 830 - state.vy * 100) * dt / 4;
          state.x += state.vx * dt / 4;
          state.y += state.vy * dt / 4;
        }
        icon.style.translate = `${state.x}px ${state.y}px`;
        magneticOffsets.set(icon, state);
        if (Math.hypot(tx - state.x, ty - state.y) > .02 || Math.hypot(state.vx, state.vy) > .1) moving = true;
      });
      const amount = shape[2];
      const cx = x + (shape[3] - x) * amount;
      const cy = y + (shape[4] - y) * amount;
      const width = Math.max(1, shape[0]), height = Math.max(1, shape[1]);
      try { lens?.draw(cx, cy, hero, width, height, Math.min(width, height) / 2, Math.max(0, Math.min(1, shape[5])), sceneControl); }
      catch { hide(); return; }
      canvas.style.transform = `translate3d(${cx - GLASS_CANVAS_SIZE / 2}px, ${cy - GLASS_CANVAS_SIZE / 2}px, 0)`;
      canvas.style.opacity = "1";
      document.documentElement.setAttribute("data-glass-cursor", "");
      if (moving || animations.size) frame = requestAnimationFrame(draw);
    };
    const schedule = () => { if (!frame) { last = performance.now(); frame = requestAnimationFrame(draw); } };
    const spring = (index: number, to: number) => {
      animations.get(index)?.stop();
      if (reduced.matches) { shape[index] = to; animations.delete(index); return; }
      animations.set(index, animate(shape[index], to, {
        type: "spring", duration: .6, bounce: .4,
        onUpdate: (value) => { shape[index] = value; },
        onComplete: () => { animations.delete(index); },
      }));
    };
    const move = (event: PointerEvent) => {
      if (!mouse.matches || event.pointerType !== "mouse" || document.documentElement.dataset.intro === "playing") { hide(); return; }
      const target = event.target;
      if (!(target instanceof Element) || target.closest('input, textarea, select, [contenteditable], [data-glass-ignore]')) { hide(); return; }
      const next = findSnapTarget(event.clientX, event.clientY, snapped);
      if (!next && !target.closest("#top")) { hide(); return; }
      lens ??= createGlassLens(canvas);
      if (!lens) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!visible) {
        x = pointerX; y = pointerY - 6; vx = vy = 0;
        shape.splice(0, shape.length, LENS_SIZE, LENS_SIZE, 0, x, y, 0);
      }
      visible = true;
      // The dot follows the pointer directly (no spring), and the native arrow gives way to it.
      dot.style.transform = `translate3d(${pointerX - DOT_SIZE / 2}px, ${pointerY - DOT_SIZE / 2}px, 0)`;
      dot.style.opacity = "1";
      document.documentElement.setAttribute("data-glass-cursor", "");
      if (next !== snapped) {
        snapped?.removeAttribute("data-glass-attached");
        snapped = next;
        snapped?.setAttribute("data-glass-attached", "");
        if (snapped) {
          const box = snapBox(snapped);
          const icon = isMagneticIcon(snapped);
          // Hero variant's padding parses to 8.3px in the reference, base cursor to 10px.
          const padding = (icon ? 8.3 : 10) * .95;
          spring(0, box.width + padding * 2);
          spring(1, box.height + padding * 2);
          spring(2, 1);
          spring(3, box.left + box.width / 2);
          spring(4, box.top + box.height / 2);
          spring(5, icon ? 0 : 1);
          sceneControl = hero.contains(snapped) ? null : snapped;
          if (icon && !icons.has(snapped)) icons.set(snapped, { x: 0, y: 0, vx: 0, vy: 0, original: snapped.style.translate });
        } else {
          spring(0, LENS_SIZE); spring(1, LENS_SIZE); spring(2, 0); spring(5, 0);
        }
      }
      schedule();
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const contextLost = (event: Event) => { event.preventDefault(); hide(); };
    const restored = () => { lens?.dispose(); lens = null; };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointercancel", hide);
    document.addEventListener("pointerout", leave);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    window.addEventListener("resize", hide);
    document.addEventListener("visibilitychange", hide);
    mouse.addEventListener("change", hide);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      hide(); lens?.dispose();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointercancel", hide);
      document.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("visibilitychange", hide);
      mouse.removeEventListener("change", hide);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, []);

  return <>
    <style>{`html[data-glass-cursor], html[data-glass-cursor] * { cursor: none !important; }`}</style>
    <canvas ref={canvasRef} aria-hidden style={{ position: "fixed", top: 0, left: 0,
      width: GLASS_CANVAS_SIZE, height: GLASS_CANVAS_SIZE, zIndex: 45, pointerEvents: "none", opacity: 0 }} />
    {/* White with "difference": reads as white on the dark page and as black on the white letters. */}
    <div ref={dotRef} aria-hidden style={{ position: "fixed", top: 0, left: 0, width: DOT_SIZE, height: DOT_SIZE,
      borderRadius: "50%", background: "#fff", mixBlendMode: "difference", zIndex: 46, pointerEvents: "none",
      opacity: 0, transition: "opacity .15s", willChange: "transform" }} />
  </>;
}
