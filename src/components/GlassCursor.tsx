"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion";
import { sound } from "@/lib/sound/engine";
import { createGlassLens, LENS_MINI, LENS_SIZE, GLASS_CANVAS_SIZE } from "@/lib/glass/lens";
import { findSnapTarget, isMagneticIcon, magneticOffsets, restingBox, snapBox } from "@/lib/glass/magnet";

// The cursor point: a small dot exactly on the pointer, so you can see where the lens is heading.
// Over something that can be pressed (a link, a button, a project tile) the dot becomes a ring with a
// small point in it, so you see it is pressable even where the lens itself does not change (the big
// tiles, the long buttons).
const DOT_SIZE = 10;
const RING_SIZE = 38;
const PRESSABLE = 'a[href], button, summary, [role="button"], [data-glass-snap], [data-glass-lens]';
const isPressable = (target: Element) => {
  const element = target.closest(PRESSABLE);
  return !!element && !element.matches(':disabled, [aria-disabled="true"]') && !element.closest("[inert]");
};

// Over the hero the lens is the big round one with full refraction. Everywhere else it is a mini
// ball that bends the page a little less, so text stays readable. Near a button or link either
// one grows to fit it. `blend` is how much the refraction is toned down (0 = full, 1 = least).
const HERO = { size: LENS_SIZE, blend: 0 };
const PAGE = { size: LENS_MINI, blend: 0.55 };
// Over a project tile (marked data-glass-lens) the lens grows into a big round one that follows
// the pointer, so the tile is seen through it. It is not snapped to the tile.
const PROJECT = { size: 240, blend: 0.15 };
// On the hero the lens floats this far above the pointer (as on the reference). The mini ball is
// centred on it, so the dot sits in its middle.
const LIFT = 6;
// After the last move or scroll the lens keeps redrawing for this long (in ms), so things that
// move under it on their own, like a card lifting or the fan being dealt, show up.
const ACTIVE_MS = 1200;

export function GlassCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    if (!canvas || !dot) return;
    const mouse = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let lens: ReturnType<typeof createGlassLens> = null;
    let frame = 0, last = 0, pointerX = 0, pointerY = 0;
    let x = 0, y = 0, vx = 0, vy = 0, visible = false;
    let snapped: HTMLElement | null = null;
    // Where the snapped element was when the lens last aimed at it, to see whether it has moved.
    const follow: number[] = [];
    let base = HERO, activeUntil = 0;
    // Width/height, attachment amount, attachment position, optical control blend.
    const shape = [LENS_SIZE, LENS_SIZE, 0, 0, 0, 0];
    // The lens only floats above the pointer when it is big: the mini ball sits right on it.
    const lift = () => LIFT * Math.min(1, Math.max(0, (shape[0] - LENS_MINI) / (LENS_SIZE - LENS_MINI)));
    const animations = new Map<number, ReturnType<typeof animate>>();
    const icons = new Map<HTMLElement, { x: number; y: number; vx: number; vy: number; original: string }>();
    const resetIcons = () => {
      icons.forEach((state, icon) => { icon.style.translate = state.original; magneticOffsets.delete(icon); });
      icons.clear();
    };
    const hide = () => {
      visible = false;
      snapped?.removeAttribute("data-glass-attached");
      snapped = null;
      animations.forEach((animation) => animation.stop());
      animations.clear();
      resetIcons();
      canvas.style.opacity = "0";
      dot.style.opacity = "0";
      dot.removeAttribute("data-pressable");
      document.documentElement.removeAttribute("data-glass-cursor");
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.documentElement.dataset.intro === "playing") { hide(); return; }
      if (snapped && !snapped.isConnected) { hide(); return; }
      // The snapped element may still be moving (a card lifting in, the page scrolling): keep the lens on it.
      if (snapped) {
        const box = snapBox(snapped);
        const padding = (isMagneticIcon(snapped) ? 8.3 : 10) * .95;
        const goal = [box.width + padding * 2, box.height + padding * 2, 1, box.left + box.width / 2, box.top + box.height / 2];
        for (const index of [0, 1, 3, 4]) if (Math.abs(goal[index] - (follow[index] ?? goal[index])) > .5) spring(index, goal[index]);
        for (const index of [0, 1, 3, 4]) follow[index] = goal[index];
      }
      const dt = Math.min((now - last) / 1000, .04);
      last = now;
      const aimY = pointerY - lift();
      if (reduced.matches) { x = pointerX; y = aimY; vx = vy = 0; }
      else for (let step = 0; step < 4; step++) {
        vx += ((pointerX - x) * 500 - vx * 60) * dt / 4;
        vy += ((aimY - y) * 500 - vy * 60) * dt / 4;
        x += vx * dt / 4;
        y += vy * dt / 4;
      }
      let moving = Math.hypot(pointerX - x, aimY - y) > .02 || Math.hypot(vx, vy) > .1;
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
      // On whole screen pixels: the lens is painted and placed at the same spot, and a fractional
      // place would let the browser shift the canvas half a pixel against what was painted in it.
      const dpr = window.devicePixelRatio || 1;
      const cx = Math.round((x + (shape[3] - x) * amount) * dpr) / dpr;
      const cy = Math.round((y + (shape[4] - y) * amount) * dpr) / dpr;
      const width = Math.max(1, shape[0]), height = Math.max(1, shape[1]);
      // The smaller the lens, the more it needs a glass edge: none on the big hero lens, full on the mini ball.
      const rim = Math.max(0, Math.min(1, 1 - (Math.min(width, height) - LENS_MINI) / (LENS_SIZE - LENS_MINI)));
      // Diagnostic: <html data-glass-raw> shows what was painted under the lens, without bending it,
      // so the painter (scene.ts) can be compared with the real page.
      const raw = document.documentElement.hasAttribute("data-glass-raw") ? 1 : 0;
      try { lens?.draw(cx, cy, width, height, Math.min(width, height) / 2, Math.max(0, Math.min(1, shape[5])), rim, raw); }
      catch { hide(); return; }
      const canvasWidth = lens?.canvasWidth ?? GLASS_CANVAS_SIZE;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.transform = `translate3d(${cx - canvasWidth / 2}px, ${cy - GLASS_CANVAS_SIZE / 2}px, 0)`;
      canvas.style.opacity = "1";
      document.documentElement.setAttribute("data-glass-cursor", "");
      if (moving || animations.size || now < activeUntil) frame = requestAnimationFrame(draw);
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
    // Decides what the lens does for a pointer at (clientX, clientY) over `target`.
    const update = (clientX: number, clientY: number, target: Element | null) => {
      if (!mouse.matches || document.documentElement.dataset.intro === "playing") { hide(); return; }
      if (!target || target.closest('input, textarea, select, [contenteditable], [data-glass-ignore]')) { hide(); return; }
      const next = findSnapTarget(clientX, clientY, snapped);
      lens ??= createGlassLens(canvas);
      if (!lens) return;
      pointerX = clientX;
      pointerY = clientY;
      // The big lens belongs to the hero (and to what is snapped inside it), the mini ball to the rest.
      const wanted = (next ?? target).closest("#top") ? HERO : (next ?? target).closest("[data-glass-lens]") ? PROJECT : PAGE;
      if (!visible) {
        base = wanted;
        x = pointerX; y = pointerY - LIFT * (base === HERO ? 1 : 0); vx = vy = 0;
        shape.splice(0, shape.length, base.size, base.size, 0, x, y, base.blend);
      }
      visible = true;
      activeUntil = performance.now() + ACTIVE_MS;
      // The dot follows the pointer directly (no spring), and the native arrow gives way to it.
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      dot.style.opacity = "1";
      dot.toggleAttribute("data-pressable", isPressable(target));
      document.documentElement.setAttribute("data-glass-cursor", "");
      const baseChanged = wanted !== base;
      base = wanted;
      if (next !== snapped) {
        snapped?.removeAttribute("data-glass-attached");
        snapped = next;
        snapped?.setAttribute("data-glass-attached", "");
        if (snapped) {
          const box = snapBox(snapped);
          const icon = isMagneticIcon(snapped);
          sound.play("glassSnap", icon ? 1 : 0.3);
          // Hero variant's padding parses to 8.3px in the reference, base cursor to 10px.
          const padding = (icon ? 8.3 : 10) * .95;
          spring(0, box.width + padding * 2);
          spring(1, box.height + padding * 2);
          spring(2, 1);
          spring(3, box.left + box.width / 2);
          spring(4, box.top + box.height / 2);
          follow.length = 0;
          follow.push(box.width + padding * 2, box.height + padding * 2, 1, box.left + box.width / 2, box.top + box.height / 2);
          spring(5, icon ? 0 : 1);
          if (icon && !icons.has(snapped)) icons.set(snapped, { x: 0, y: 0, vx: 0, vy: 0, original: snapped.style.translate });
        } else {
          spring(0, base.size); spring(1, base.size); spring(2, 0); spring(5, base.blend);
        }
      } else if (baseChanged && !snapped) {
        // Crossing from the hero to the page (or back): the lens shrinks to the mini ball (or grows).
        spring(0, base.size); spring(1, base.size); spring(5, base.blend);
      }
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { hide(); return; }
      update(event.clientX, event.clientY, event.target instanceof Element ? event.target : null);
    };
    // The page moves under a resting pointer: look again at what is there, and redraw.
    const scrolled = () => {
      if (visible) update(pointerX, pointerY, document.elementFromPoint(pointerX, pointerY));
    };
    const click = (event: MouseEvent) => {
      if (document.documentElement.dataset.intro === "playing" || !(event.target instanceof Element)) return;
      const control = event.target.closest('a[href], button, [role="button"], [data-glass-snap], [data-intro-target="sticker"]');
      if (!control || control.closest('[disabled], [aria-disabled="true"], [inert], [data-sound-toggle]')) return;
      void sound.unlock().then(() => sound.play("glassClick"));
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const contextLost = (event: Event) => { event.preventDefault(); hide(); };
    const restored = () => { lens?.dispose(); lens = null; };
    window.addEventListener("click", click);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointercancel", hide);
    document.addEventListener("pointerout", leave);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", scrolled, { passive: true, capture: true });
    window.addEventListener("resize", hide);
    document.addEventListener("visibilitychange", hide);
    mouse.addEventListener("change", hide);
    canvas.addEventListener("webglcontextlost", contextLost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      hide(); lens?.dispose();
      window.removeEventListener("click", click);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointercancel", hide);
      document.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", scrolled, true);
      window.removeEventListener("resize", hide);
      document.removeEventListener("visibilitychange", hide);
      mouse.removeEventListener("change", hide);
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, []);

  return <>
    <style>{`html[data-glass-cursor], html[data-glass-cursor] * { cursor: none !important; }
      [data-glass-dot] span { position: absolute; top: 0; left: 0; border-radius: 50%; translate: -50% -50%; }
      .glass-dot-point { background: #fff; transition: transform .22s cubic-bezier(.22,1,.36,1); }
      .glass-dot-ring { border: 1.5px solid #fff; opacity: 0; transform: scale(.35); transition: transform .26s cubic-bezier(.22,1,.36,1), opacity .2s; }
      [data-glass-dot][data-pressable] .glass-dot-point { transform: scale(.6); }
      [data-glass-dot][data-pressable] .glass-dot-ring { opacity: 1; transform: scale(1); }
      @media (prefers-reduced-motion: reduce) { .glass-dot-point, .glass-dot-ring { transition: none; } }`}</style>
    <canvas ref={canvasRef} aria-hidden data-glass-ignore style={{ position: "fixed", top: 0, left: 0,
      width: GLASS_CANVAS_SIZE, height: GLASS_CANVAS_SIZE, zIndex: 45, pointerEvents: "none", opacity: 0 }} />
    {/* White with "difference": reads as white on the dark page and as black on the white letters.
        The outer box sits on the pointer; inside it the point, and a ring that opens over a pressable thing. */}
    <div ref={dotRef} aria-hidden data-glass-ignore data-glass-dot style={{ position: "fixed", top: 0, left: 0, width: 0, height: 0,
      mixBlendMode: "difference", zIndex: 46, pointerEvents: "none", opacity: 0, transition: "opacity .15s", willChange: "transform" }}>
      <span className="glass-dot-point" style={{ width: DOT_SIZE, height: DOT_SIZE }} />
      <span className="glass-dot-ring" style={{ width: RING_SIZE, height: RING_SIZE }} />
    </div>
  </>;
}
