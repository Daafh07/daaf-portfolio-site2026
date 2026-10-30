"use client";

import { motion, type Variants } from "motion/react";
import { INTRO } from "./introConfig";
import type { StickerGeometry } from "./measureIntro";

export type StickerPhase = "hidden" | "scatter" | "home";

const stickerVariants: Variants = {
  hidden: ({ scatterOffset }: StickerGeometry) => ({
    x: scatterOffset.x,
    y: scatterOffset.y + INTRO.stickers.fromY,
    rotate: scatterOffset.rotate,
    scale: INTRO.stickers.fromScale,
    opacity: 0,
  }),
  // Pop in at the scattered spot from frame 18.
  scatter: ({ scatterOffset, order }: StickerGeometry) => ({
    x: scatterOffset.x,
    y: scatterOffset.y,
    rotate: scatterOffset.rotate,
    scale: [INTRO.stickers.fromScale, 1.14, 0.97, 1],
    opacity: 1,
    transition: {
      ...INTRO.stickers.pop,
      delay: order * INTRO.stickers.stagger,
      scale: {
        type: "tween", duration: INTRO.stickers.pop.duration,
        delay: order * INTRO.stickers.stagger,
        times: [0, INTRO.stickers.contact, 0.65, 1], ease: "easeOut",
      },
    },
  }),
  // Glide to the resting place around the wordmark from frame 17.
  home: ({ home, order }: StickerGeometry) => ({
    x: 0,
    y: 0,
    rotate: home.rotate,
    scale: 1,
    opacity: 1,
    transition: { ...INTRO.stickers.home, delay: order * INTRO.stickers.homeStagger },
  }),
};

export function IntroStickers({ stickers, phase }: { stickers: StickerGeometry[]; phase: StickerPhase }) {
  return stickers.map((sticker) => (
    <motion.img
      key={sticker.id}
      src={sticker.src}
      alt=""
      custom={sticker}
      variants={stickerVariants}
      initial="hidden"
      animate={phase}
      className="absolute will-change-transform"
      style={{ left: sticker.left, top: sticker.top, width: sticker.width, height: sticker.height }}
    />
  ));
}
