"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { useEnter } from "./useEnter";

// Text whose words rise out of a line one after the other when it scrolls into view. Each word has
// its own mask, so it comes from behind the line. Read as one piece by a screen reader.
export function RiseWords({ text, className, delay = 0, stagger = 0.06 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enter = useEnter(ref, "0px 0px -8% 0px");
  return (
    <span ref={ref} aria-label={text} data-reveal className={className}>
      {text.split(" ").map((word, index) => (
        <span key={index} aria-hidden>
          <span className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "115%" }}
              animate={enter ? { y: 0 } : undefined}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: delay + index * stagger }}
            >
              {word}
            </motion.span>
          </span>{" "}
        </span>
      ))}
    </span>
  );
}
