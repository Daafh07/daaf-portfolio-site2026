"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Fragment, useEffect, useRef } from "react";
import { StatementParticles, type ParticlesHandle } from "./StatementParticles";

// The one sentence that says what I stand for, in the heading font, with the last words in the
// pink of the first project. The screen stays put (sticky) while you scroll through it, and the
// sentence types itself out, letter by letter, with a pink cursor. Behind it, pink dots on loose
// circles draw and turn as you scroll (StatementParticles); when the sentence is complete, a pink
// wave runs out from the middle and blows the dots away.
const PARTS = [
  { text: "Most websites look like the template they came from. I would rather spend the extra week and make yours ", pink: false },
  { text: "look like you.", pink: true },
];

// Words as groups of letters (so a line breaks between words, never inside one), numbered in order.
// The spaces between words are left out of the groups, so the lines break exactly as in plain text.
let count = 0;
const WORDS = PARTS.flatMap(({ text, pink }) =>
  text
    .split(" ")
    .filter(Boolean)
    .map((word) => ({ pink, letters: [...word].map((letter) => ({ letter, index: count++ })) })),
);
const TOTAL = count;

const SCROLL = 150; // svh of scrolling that the screen stays still for
const TYPED_BY = 0.72; // the sentence is complete this far into that scroll; the rest is a pause

export function Statement() {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLElement | null>(null);
  const particles = useRef<ParticlesHandle>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  // Everything reads one number, --q (0 to 1: how much of the sentence is typed, which the dots follow): no re-render per letter. `data-done` starts the wave.
  const show = (progress: number) => {
    const element = stage.current;
    if (!element) return;
    const q = reduced ? 1 : Math.min(1, progress / TYPED_BY);
    const typed = q * TOTAL;
    element.style.setProperty("--typed", String(typed));
    element.style.setProperty("--q", String(q));
    const complete = q >= 1 && !reduced;
    if (complete) element.setAttribute("data-done", "");
    else element.removeAttribute("data-done");
    particles.current?.setProgress(q);
    particles.current?.setDone(complete);
    // The cursor sits on the last letter that has begun, until all are typed.
    const index = typed > 0 && typed < TOTAL ? Math.min(TOTAL - 1, Math.floor(typed)) : -1;
    const next = index >= 0 ? element.querySelector<HTMLElement>(`[data-i="${index}"]`) : null;
    if (next === cursor.current) return;
    cursor.current?.removeAttribute("data-cursor");
    next?.setAttribute("data-cursor", "");
    cursor.current = next;
  };
  useMotionValueEvent(scrollYProgress, "change", show);
  // Where the page already is when it loads (a link to a later section, a refresh part way down).
  useEffect(() => show(scrollYProgress.get()));

  return (
    <section
      ref={track}
      aria-label="Statement"
      style={{ "--track": `calc(100svh + ${SCROLL}svh)` } as React.CSSProperties}
      className="h-[var(--track)] motion-reduce:h-auto"
    >
      <div
        ref={stage}
        data-typing
        style={{ "--typed": 0, "--q": 0 } as React.CSSProperties}
        className="sticky top-0 flex h-svh items-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:py-24"
      >
        {/* The dots on loose circles: they draw and turn as you scroll, and the wave blows them away. */}
        <StatementParticles ref={particles} still={!!reduced} />
        {/* The wave: rings of light that run out from the middle once the sentence is complete. */}
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-0">
          {[0, 1, 2].map((wave) => (
            <span key={wave} className="statement-wave" style={{ "--wave": wave } as React.CSSProperties} />
          ))}
        </div>

        <p
          aria-label={PARTS.map((part) => part.text).join("")}
          className="relative mx-auto w-full max-w-[1032px] px-6 font-blur text-[26px] leading-[34px] text-fg md:text-[36px] md:leading-[48px]"
        >
          {WORDS.map((word, wordIndex) => (
            <Fragment key={wordIndex}>
              {wordIndex > 0 && " "}
              <span aria-hidden className={`inline-block ${word.pink ? "text-[#f9007e]" : ""}`}>
                {word.letters.map(({ letter, index }) => (
                  <span key={index} data-i={index} style={{ "--i": index } as React.CSSProperties} className="typed-letter">
                    {letter}
                  </span>
                ))}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
