"use client";

import { useEffect } from "react";
import { sound } from "@/lib/sound/engine";
import type { SoundName } from "@/lib/sound/sounds";
import { INTRO } from "./introConfig";
import type { LetterPhase } from "./IntroLetters";
import type { StickerPhase } from "./IntroStickers";
import type { IntroGeometry } from "./measureIntro";

// Schedule from committed animation phases, once for both copies of the letters.
// All accents use the same stagger and contact times as the visual movement.
export function useIntroSound(letters: LetterPhase, stickers: StickerPhase, geometry: IntroGeometry | null) {
  useEffect(() => {
    if (!geometry) return;
    const timers: number[] = [];
    const cue = (delay: number, name: SoundName, level: number) => {
      timers.push(window.setTimeout(() => {
        if (document.visibilityState === "visible") sound.play(name, level);
      }, delay * 1000));
    };
    geometry.letters.forEach(({ index, count }) => {
      const level = index / Math.max(1, count - 1);
      if (letters === "intro") cue(index * INTRO.intro.stagger + INTRO.intro.duration * 0.45, "letterRise", level);
      if (letters === "fly") cue((count - 1 - index) * INTRO.fly.stagger + INTRO.fly.duration * 0.45, "letterFly", 1 - level);
      if (letters === "land") cue(index * INTRO.land.stagger + INTRO.land.transition.duration * INTRO.land.contact, "letterLand", level);
    });
    return () => timers.forEach(clearTimeout);
  }, [letters, geometry]);

  useEffect(() => {
    if (!geometry || stickers === "hidden") return;
    const timers: number[] = [];
    if (stickers === "home" && document.visibilityState === "visible") sound.play("reveal");
    geometry.stickers.forEach(({ order }) => {
      const delay = stickers === "scatter"
        ? order * INTRO.stickers.stagger + INTRO.stickers.pop.duration * INTRO.stickers.contact
        : order * INTRO.stickers.homeStagger + INTRO.stickers.home.duration * 0.75;
      timers.push(window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          sound.play(stickers === "scatter" ? "stickerPop" : "stickerHome", order / Math.max(1, geometry.stickers.length - 1));
        }
      }, delay * 1000));
    });
    return () => timers.forEach(clearTimeout);
  }, [stickers, geometry]);
}
