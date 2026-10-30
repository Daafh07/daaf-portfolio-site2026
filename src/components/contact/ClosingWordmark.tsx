"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { useEnter } from "@/components/motion/useEnter";
import { sound } from "@/lib/sound/engine";

// The closing wordmark. The letters fall in one after the other and land with a bounce (with a soft
// thump each); after that, the letter under the pointer lifts and leans, and its neighbours follow a
// little, the way the blobs of the services dock do. Every letter that the pointer reaches gives a
// small knock. Mouse only; not for people who asked for less motion.
const LETTERS = Array.from("Daaf");
const REACH = 170; // px: how far from a letter the pointer still lifts it

function Letter({ char, index, pointer, enter }: { char: string; index: number; pointer: MotionValue<number>; enter: boolean }) {
  const slot = useRef<HTMLSpanElement>(null);
  const near = useTransform(pointer, (x) => {
    const box = slot.current?.getBoundingClientRect();
    if (!box) return 0;
    return Math.max(0, 1 - Math.abs(x - (box.left + box.width / 2)) / REACH) ** 1.4;
  });
  const lift = useSpring(near, { stiffness: 260, damping: 16, mass: 0.6 });
  const y = useTransform(lift, (v) => -0.16 * 200 * v); // up to 0.16 of the type size
  const rotate = useTransform(lift, (v) => v * (index % 2 ? 5 : -5));
  const scale = useTransform(lift, (v) => 1 + 0.08 * v);

  const arrived = useRef(false);
  useMotionValueEvent(near, "change", (value) => {
    const on = value > 0.75;
    if (on && !arrived.current) sound.play("toolNudge", index / (LETTERS.length - 1));
    arrived.current = on;
  });

  // The thump of the letter landing, when it has fallen in.
  useEffect(() => {
    if (!enter) return;
    const timer = window.setTimeout(() => sound.play("letterLand", index / (LETTERS.length - 1)), 260 + index * 120);
    return () => window.clearTimeout(timer);
  }, [enter, index]);

  return (
    <motion.span
      className="inline-block"
      initial={{ y: "-130%", rotate: index % 2 ? 14 : -14, opacity: 0 }}
      animate={enter ? { y: 0, rotate: 0, opacity: 1 } : undefined}
      transition={{ y: { type: "spring", stiffness: 170, damping: 11, delay: index * 0.12 }, rotate: { type: "spring", stiffness: 170, damping: 11, delay: index * 0.12 }, opacity: { duration: 0.2, delay: index * 0.12 } }}
    >
      <motion.span ref={slot} className="inline-block origin-bottom" style={{ y, rotate, scale }}>
        {char}
      </motion.span>
    </motion.span>
  );
}

export function ClosingWordmark() {
  const ref = useRef<HTMLParagraphElement>(null);
  const enter = useEnter(ref, "0px 0px -10% 0px");
  const reduced = useReducedMotion();
  const pointer = useMotionValue(-9999);

  return (
    <p
      ref={ref}
      aria-hidden
      data-reveal
      className="flex justify-center font-blur text-[43.2cqw] leading-[0.96] text-fg select-none md:text-[200px]"
      onPointerMove={(event) => event.pointerType === "mouse" && !reduced && pointer.set(event.clientX)}
      onPointerLeave={() => pointer.set(-9999)}
    >
      {LETTERS.map((char, index) => (
        <Letter key={index} char={char} index={index} pointer={pointer} enter={enter} />
      ))}
    </p>
  );
}
