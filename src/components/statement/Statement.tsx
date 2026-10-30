"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Fragment, useEffect, useRef } from "react";

// The one sentence that says what I stand for, in the heading font, with the last words in the
// pink of the first project. The screen stays put (sticky) while you scroll through it, and the
// sentence types itself out, letter by letter, with a pink cursor. Behind it, pink circle lines
// draw themselves one ring after the other; when the sentence is complete, a pink wave runs out
// from the middle.
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

// The circle lines, deliberately not tidy: each has its own size, centre (a little off), place where
// it starts, direction and moment, so they cross and tangle. `start` and `span` are fractions of the
// typing; `rot` is where on the circle it starts (degrees); `dir` is 1 clockwise, -1 the other way.
const RINGS = [
  { r: 70, dx: 0, dy: 0, rot: 40, dir: 1, start: 0.0, span: 0.4 },
  { r: 135, dx: -45, dy: 30, rot: 200, dir: -1, start: 0.1, span: 0.45 },
  { r: 195, dx: 55, dy: -40, rot: 310, dir: 1, start: 0.04, span: 0.5 },
  { r: 255, dx: -65, dy: -25, rot: 120, dir: -1, start: 0.22, span: 0.4 },
  { r: 325, dx: 35, dy: 65, rot: 250, dir: 1, start: 0.16, span: 0.5 },
  { r: 395, dx: -30, dy: -55, rot: 20, dir: -1, start: 0.36, span: 0.4 },
  { r: 465, dx: 75, dy: 20, rot: 160, dir: 1, start: 0.3, span: 0.5 },
  { r: 545, dx: -55, dy: 65, rot: 280, dir: -1, start: 0.46, span: 0.44 },
  { r: 625, dx: 20, dy: -35, rot: 90, dir: 1, start: 0.5, span: 0.5 },
];
const SCROLL = 150; // svh of scrolling that the screen stays still for
const TYPED_BY = 0.72; // the sentence is complete this far into that scroll; the rest is a pause

export function Statement() {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  // Everything reads one number from CSS, --q (0 to 1: how much of the sentence is typed, and how
  // many ring lines are drawn): no re-render per letter. `data-done` starts the wave.
  const show = (progress: number) => {
    const element = stage.current;
    if (!element) return;
    const q = reduced ? 1 : Math.min(1, progress / TYPED_BY);
    const typed = q * TOTAL;
    element.style.setProperty("--typed", String(typed));
    element.style.setProperty("--q", String(q));
    if (q >= 1 && !reduced) element.setAttribute("data-done", "");
    else element.removeAttribute("data-done");
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
        {/* The circle lines: each draws itself as you scroll, fading along its length. They go away
            again once the wave has passed (data-done). */}
        <svg aria-hidden viewBox="0 0 1000 1000" className="statement-rings pointer-events-none absolute top-1/2 left-1/2 size-[130vmax] -translate-x-1/2 -translate-y-1/2">
          <defs>
            <linearGradient id="statement-fade-a" x1="0" y1="0" x2="1" y2="0.2">
              <stop offset="0" stopColor="#f9007e" stopOpacity="0.05" />
              <stop offset="0.55" stopColor="#f9007e" stopOpacity="0.95" />
              <stop offset="1" stopColor="#f9007e" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="statement-fade-b" x1="1" y1="0.1" x2="0" y2="1">
              <stop offset="0" stopColor="#f9007e" stopOpacity="0.1" />
              <stop offset="0.45" stopColor="#f9007e" stopOpacity="0.85" />
              <stop offset="1" stopColor="#f9007e" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {RINGS.map((ring, k) => (
            <circle
              key={k}
              cx={500 + ring.dx}
              cy={500 + ring.dy}
              r={ring.r}
              pathLength={1}
              stroke={`url(#statement-fade-${k % 2 ? "b" : "a"})`}
              className="statement-ring"
              style={{ "--start": ring.start, "--span": ring.span, "--rot": ring.rot, "--dir": ring.dir } as React.CSSProperties}
            />
          ))}
        </svg>
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
