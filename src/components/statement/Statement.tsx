"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Fragment, useEffect, useRef } from "react";

// The one sentence that says what I stand for, in the heading font, with the last words in the
// pink of the first project. It types itself out while you scroll: letter by letter, with a pink
// cursor at the end of what is typed.
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

export function Statement() {
  const text = useRef<HTMLParagraphElement>(null);
  const cursor = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  // Starts when the sentence reaches 90% of the screen height, done when its end reaches 40%.
  const { scrollYProgress } = useScroll({ target: text, offset: ["start 0.9", "end 0.4"] });

  // The letters read one number, --typed (how many are typed, fractions included), from CSS: no
  // re-render per letter. The cursor sits on the last letter that has begun, until all are typed.
  const show = (progress: number) => {
    const element = text.current;
    if (!element) return;
    const typed = reduced ? TOTAL : progress * TOTAL;
    element.style.setProperty("--typed", String(typed));
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
    <section aria-label="Statement" className="mx-auto w-full max-w-[1032px] px-6 pb-24 md:pt-24 md:pb-48">
      <p
        ref={text}
        data-typing
        aria-label={PARTS.map((part) => part.text).join("")}
        style={{ "--typed": 0 } as React.CSSProperties}
        className="font-blur text-[26px] leading-[34px] text-fg md:text-[36px] md:leading-[48px]"
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
    </section>
  );
}
