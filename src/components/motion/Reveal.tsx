"use client";

import { MotionConfig, motion, useInView } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { sound } from "@/lib/sound/engine";
import { useIntroDone } from "@/components/intro/useIntroDone";

// Lifts its content in, once, the first time it scrolls into view (and not before the intro is
// over, or it would play unseen behind the curtain). `delay` staggers a row of them.
// Without JavaScript the content is simply shown: see the <noscript> rule in the root layout.
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const introDone = useIntroDone();
  const sounded = useRef(false);
  useEffect(() => {
    if (!inView || !introDone || sounded.current) return;
    const timer = window.setTimeout(() => {
      sounded.current = true;
      sound.play("contentIn");
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [inView, introDone, delay]);

  return (
    // "user": people who asked for less motion get a plain fade, without the lift.
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={ref}
        data-reveal
        className={className}
        initial={{ opacity: 0, y: 40 }}
        animate={inView && introDone ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
