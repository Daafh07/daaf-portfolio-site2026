"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useIntroSound } from "./useIntroSound";
import { SoundToggle } from "@/components/SoundToggle";
import { INTRO, introTimeline } from "./introConfig";
import { IntroLetters, type LetterPhase } from "./IntroLetters";
import { IntroStickers, type StickerPhase } from "./IntroStickers";
import { measureIntro, type IntroGeometry } from "./measureIntro";
import { Slingshot, type ImpactPoint } from "./slingshot/Slingshot";

type Phase = "waiting" | "game" | "handoff" | "intro" | "fly" | "reveal" | "land";

const letterPhase: Record<Phase, LetterPhase> = {
  waiting: "hidden",
  game: "hidden",
  handoff: "handoff",
  intro: "intro",
  fly: "fly",
  reveal: "fly",
  land: "land",
};

// The director. It only runs when the inline script in layout.tsx marked the page with
// <html data-intro="playing">; otherwise it stays hidden and the hero is simply there.
//
// Timeline:  game (shoot the D at the canvas) → handoff (the D continues from the impact)
//            → intro (small word, frame 19) → fly (big word + scattered icons, frame 18)
//            → reveal (curtain opens, icons glide home) → land (letters drop) → done (frame 17)
export function IntroSequence() {
  const [active, setActive] = useState(true);
  const [geometry, setGeometry] = useState<IntroGeometry | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [stickerPhase, setStickerPhase] = useState<StickerPhase>("hidden");
  const [impact, setImpact] = useState<ImpactPoint | null>(null);
  const [grabbed, setGrabbed] = useState(false);
  const timers = useRef<number[]>([]);
  const startRef = useRef<(geometry: IntroGeometry) => void>(() => {});

  useIntroSound(letterPhase[phase], stickerPhase, geometry);

  useEffect(() => {
    // Not playing: the CSS already hides the (empty) intro layer.
    const root = document.documentElement;
    if (root.dataset.intro !== "playing") return;

    let cancelled = false;
    const pending = timers.current;
    const at = (seconds: number, fn: () => void) => pending.push(window.setTimeout(fn, seconds * 1000));

    // The letters sequence. Starts right away, or once the slingshot D hits the canvas.
    startRef.current = (measured) => {
      const t = introTimeline(measured.letters.length, measured.stickers.length);
      // Wait two frames, so the letters are painted in their starting state (hidden or handoff) first.
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setPhase("intro")));
      at(t.fly, () => {
        setPhase("fly");
      });
      at(t.stickers, () => setStickerPhase("scatter"));
      at(t.reveal, () => {
        setPhase("reveal");
        setStickerPhase("home");
      });
      at(t.land, () => setPhase("land"));
      at(t.done, () => {
        root.dataset.intro = "done";
        history.scrollRestoration = "auto";
        setActive(false);
      });
    };

    // Measure only once the Blur font is in, otherwise the letter boxes are wrong.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const measured = measureIntro();
      if (!measured) {
        root.dataset.intro = "done";
        return setActive(false);
      }
      setGeometry(measured);
      if (INTRO.game) setPhase("game");
      else startRef.current(measured);
    });

    return () => {
      cancelled = true;
      pending.forEach(clearTimeout);
    };
  }, []);

  const onImpact = (point: ImpactPoint) => {
    if (!geometry) return;
    setImpact(point);
    setPhase("handoff");
    startRef.current(geometry);
  };

  if (!active) return null;

  const curtainOpen = phase === "reveal" || phase === "land";
  // Keep the slingshot mounted until its impact dust has settled.
  const showGame = phase === "game" || phase === "handoff" || phase === "intro";

  return (
    // Hidden by CSS unless <html data-intro="playing">, so it is in the server HTML without flashing.
    <div className="intro pointer-events-none fixed inset-0 z-50">
      {/* White letters on the dark page, revealed as the curtain clips away. */}
      {geometry && (
        <div aria-hidden className="absolute inset-0">
          <IntroLetters geometry={geometry} phase={letterPhase[phase]} impact={impact} className="text-fg" />
        </div>
      )}

      {/* The white curtain with the black letters (frames 19 and 18). */}
      <motion.div
        className="absolute inset-0 bg-fg"
        initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
        animate={{ clipPath: curtainOpen ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 0% 0%)" }}
        transition={INTRO.curtain}
      >
        {showGame && <Slingshot onGrab={() => setGrabbed(true)} onImpact={onImpact} />}

        {phase === "game" && (
          // Sits below the furthest the D can be pulled, so it never covers the band.
          <motion.div
            aria-hidden
            className="absolute inset-x-6 flex flex-col items-center gap-1 text-center"
            style={{ top: `calc(${INTRO.slingshot.anchorY * 100}% + ${INTRO.slingshot.maxPull + 56}px)` }}
            initial={{ opacity: 0, y: 8 }}
            animate={grabbed ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: grabbed ? 0 : INTRO.slingshot.hint.delay }}
          >
            <p className="text-base font-medium text-bg/80">{INTRO.slingshot.hint.text}</p>
            <p className="text-xs text-bg/45 [@media(pointer:coarse)]:hidden">{INTRO.slingshot.hint.keys}</p>
          </motion.div>
        )}
        {geometry && (
          <div aria-hidden className="absolute inset-0">
            <IntroLetters geometry={geometry} phase={letterPhase[phase]} impact={impact} className="text-bg" />
          </div>
        )}
      </motion.div>

      <SoundToggle dark={curtainOpen} className="pointer-events-auto absolute right-4 bottom-4 z-10" />

      {/* Icons sit above the curtain, so they stay visible while it opens. */}
      {geometry && (
        <div aria-hidden className="absolute inset-0">
          <IntroStickers stickers={geometry.stickers} phase={stickerPhase} />
        </div>
      )}
    </div>
  );
}
