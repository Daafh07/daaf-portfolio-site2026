"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ReactNode } from "react";

// Pulls what it holds a little toward the pointer while the pointer is near it, and lets it spring
// back when it leaves. The area round it is a bit larger than the thing itself, so it starts to follow
// before you are on it. Mouse only, and not for people who asked for less motion.
export function Magnetic({ children, strength = 0.35, reach = 14 }: { children: ReactNode; strength?: number; reach?: number }) {
  const reduced = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.5 });
  return (
    <div
      className="inline-block"
      style={{ padding: reach, margin: -reach }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType !== "mouse") return;
        const box = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - (box.left + box.width / 2)) * strength);
        y.set((event.clientY - (box.top + box.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div style={{ x, y }}>{children}</motion.div>
    </div>
  );
}
