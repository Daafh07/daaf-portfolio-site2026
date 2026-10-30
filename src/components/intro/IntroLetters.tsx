"use client";

import { motion, type Variants } from "motion/react";
import { INTRO } from "./introConfig";
import type { IntroGeometry, LetterGeometry } from "./measureIntro";
import type { ImpactPoint } from "./slingshot/Slingshot";

export type LetterPhase = "hidden" | "handoff" | "intro" | "fly" | "land";

type LetterCustom = LetterGeometry & { fontSize: number; impact: ImpactPoint | null };

const hiddenState = ({ small }: LetterCustom) => ({
  x: small.x,
  y: small.y + INTRO.intro.fromY,
  scale: INTRO.intro.scale,
  opacity: 0,
  filter: `blur(${INTRO.intro.fromBlur}px)`,
});

// One state per phase. Each letter gets its own geometry through `custom`,
// so all letters share these definitions but end up in different places.
const letterVariants: Variants = {
  hidden: hiddenState,
  // The D jumps (instantly) to where the slingshot D hit the canvas, at the same size.
  handoff: (letter: LetterCustom) => {
    const { impact, index, left, top, width, height, fontSize } = letter;
    if (index !== 0 || !impact) return hiddenState(letter);
    const scale = impact.fontSize / fontSize;
    return {
      x: impact.x - left - (width * scale) / 2,
      y: impact.y - top - (height * scale) / 2,
      scale,
      opacity: 1,
      filter: "blur(0px)",
      transition: { duration: 0 },
    };
  },
  intro: ({ small, index }: LetterCustom) => ({
    x: small.x,
    y: small.y,
    scale: INTRO.intro.scale,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: INTRO.intro.duration, ease: INTRO.intro.ease, delay: index * INTRO.intro.stagger },
  }),
  fly: ({ overshootY, index, count }: LetterCustom) => ({
    x: 0,
    y: overshootY,
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: INTRO.fly.duration,
      ease: INTRO.fly.ease,
      delay: (count - 1 - index) * INTRO.fly.stagger,
    },
  }),
  land: ({ index }: LetterCustom) => ({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    scaleX: [1, 1.055, 0.985, 1],
    scaleY: [1, 0.92, 1.025, 1],
    transition: {
      ...INTRO.land.transition,
      delay: index * INTRO.land.stagger,
      scaleX: { type: "tween", duration: INTRO.land.transition.duration, delay: index * INTRO.land.stagger, times: [0, INTRO.land.contact, 0.6, 1], ease: "easeOut" },
      scaleY: { type: "tween", duration: INTRO.land.transition.duration, delay: index * INTRO.land.stagger, times: [0, INTRO.land.contact, 0.6, 1], ease: "easeOut" },
    },
  }),
};

type IntroLettersProps = {
  geometry: IntroGeometry;
  phase: LetterPhase;
  /** Set when the slingshot D hit the canvas: the first letter continues from there. */
  impact: ImpactPoint | null;
  className: string;
};

// The intro renders this twice: black letters on the white curtain, white letters underneath.
// Both copies move identically, so as the curtain clips away the word seems to change colour.
export function IntroLetters({ geometry, phase, impact, className }: IntroLettersProps) {
  return geometry.letters.map((letter) => (
    <motion.span
      key={letter.index}
      custom={{ ...letter, fontSize: geometry.fontSize, impact }}
      variants={letterVariants}
      initial="hidden"
      animate={phase}
      className={`absolute inline-block font-blur whitespace-pre will-change-transform ${className}`}
      style={{
        left: letter.left,
        top: letter.top,
        fontSize: geometry.fontSize,
        lineHeight: geometry.lineHeight,
        originX: 0,
        originY: 0,
      }}
    >
      {letter.char}
    </motion.span>
  ));
}
