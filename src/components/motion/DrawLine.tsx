"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useEnter } from "./useEnter";

/** A thin line that draws itself from the left when it scrolls into view. */
export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const enter = useEnter(ref, "0px 0px -2% 0px");
  return (
    <motion.div
      ref={ref}
      aria-hidden
      data-reveal
      className={`origin-left ${className ?? ""}`}
      initial={{ scaleX: 0 }}
      animate={enter ? { scaleX: 1 } : undefined}
      transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
