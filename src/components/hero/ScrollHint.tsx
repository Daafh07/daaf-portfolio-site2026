"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useIntroDone } from "@/components/intro/useIntroDone";

// A quiet hint for someone who stays on the hero without moving: after a few seconds at the top
// (counted from when the intro is over) a faint "Scroll" with a small arrow fades in under the
// wordmark. It goes as soon as the page is scrolled, and counts again if the visitor comes back to the
// top. Not for people who asked for less motion: the arrow does not bob for them.
const WAIT = 5000; // ms at the top before the hint shows
const AT_TOP = 24; // px: scrolled less than this counts as "at the top"

export function ScrollHint() {
  const introDone = useIntroDone();
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!introDone) return;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      if (window.scrollY < AT_TOP) timer = window.setTimeout(() => setShow(true), WAIT);
    };
    const onScroll = () => {
      if (window.scrollY >= AT_TOP) {
        window.clearTimeout(timer);
        timer = 0;
        setShow(false);
      } else if (!timer) {
        arm();
      }
    };
    arm();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [introDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-1.5 text-[13px] font-medium text-sub/60 md:bottom-10"
        >
          <span>Scroll</span>
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={reduced ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M3.5 6 8 10.5 12.5 6" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
