"use client";

import { MotionConfig, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { sound } from "@/lib/sound/engine";
import { useEnter } from "./useEnter";

// A tile that drops in: from below, tilted a little, and settles with a small overshoot; the next one
// follows a moment later. It has a soft card-deal sound for each tile, and lifts when the pointer is on it.
// Without JavaScript it is simply shown (see the <noscript> rule in the root layout).
export function Pop({ children, className, delay = 0, tilt = 0, index = 0 }: { children: ReactNode; className?: string; delay?: number; tilt?: number; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const enter = useEnter(ref);
  useEffect(() => {
    if (!enter) return;
    const timer = window.setTimeout(() => sound.play("cardDeal", Math.min(1, index / 4)), delay * 1000 + 140);
    return () => window.clearTimeout(timer);
  }, [enter, delay, index]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={ref}
        data-reveal
        className={className}
        initial={{ opacity: 0, y: 70, rotate: tilt, scale: 0.92 }}
        animate={enter ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined}
        whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } }}
        transition={{ default: { type: "spring", stiffness: 120, damping: 15, delay }, opacity: { duration: 0.5, delay } }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
