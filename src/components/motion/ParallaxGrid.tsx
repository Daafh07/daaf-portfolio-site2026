"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { createContext, useContext, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { Reveal } from "./Reveal";

// Scroll parallax for a grid of tiles, measured on landonorris.com ("Helmets Hall of Fame"):
// the columns drift at different speeds (1 : 3) and settle into place, the offset shrinking to 0
// in a straight line with the scroll. Landon's runs until the section leaves the screen; here it
// has to be over when the grid's bottom is on screen, or the tiles would still hang over the
// button below. A bit stronger than the original (67 / 200px).
// Only on a wide screen and without "reduce motion"; on a phone the tiles lift in one by one.
const START_OFFSET = [100, 300, 100];

const Progress = createContext<MotionValue<number> | null>(null);

const wide = () => matchMedia("(min-width: 768px)");
const subscribe = (notify: () => void) => {
  const query = wide();
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};

export function ParallaxGrid({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.85"] });
  return (
    <Progress.Provider value={scrollYProgress}>
      <ul ref={ref} className={className} style={style}>
        {children}
      </ul>
    </Progress.Provider>
  );
}

/** One tile of the grid: `column` (0, 1, 2) decides how far it lags behind. */
export function ParallaxTile({ column, delay, children }: { column: number; delay: number; children: ReactNode }) {
  const progress = useContext(Progress);
  const reduced = useReducedMotion();
  const isWide = useSyncExternalStore(subscribe, () => wide().matches, () => false);
  const none = useMotionValue(0);
  const y = useTransform(progress ?? none, [0, 1], [START_OFFSET[column % START_OFFSET.length], 0]);

  if (!isWide || reduced || !progress) return <Reveal delay={delay}>{children}</Reveal>;
  return <motion.div style={{ y }}>{children}</motion.div>;
}
