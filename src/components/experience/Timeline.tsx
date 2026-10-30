"use client";

import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Entry } from "@/data/experience";

// The timeline, with a line that draws itself as you scroll: it is at the height of the 60% line of
// the screen, fills every row it has passed, and the row it is in is the one that is lit (white,
// full strength, a pink dot); the others step back. The line is cut into one piece per row, each
// filled by one number (--f, 0 to 1) that is set on scroll, so no row re-renders while it moves.
// On desktop the line runs in the gap between the period and the details; on a phone it runs at the
// left and the rows are indented to make room.
const LINE = 0.6; // where on the screen the line is (0 top, 1 bottom)
const DOT = 7; // px from the top of a row to the top of its dot (the middle of the title line)

export function Timeline({ entries }: { entries: Entry[] }) {
  const list = useRef<HTMLOListElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: list, offset: [`start ${LINE}`, `end ${LINE}`] });

  const follow = (progress: number) => {
    const element = list.current;
    if (!element) return;
    const y = reduced ? Infinity : progress * element.offsetHeight; // how far down the list the line is
    let current = 0;
    rows.current.forEach((row, index) => {
      if (!row) return;
      const from = row.offsetTop + DOT;
      const to = index < entries.length - 1 ? (rows.current[index + 1]?.offsetTop ?? from) + DOT : from;
      row.style.setProperty("--f", String(Math.min(1, Math.max(0, (y - from) / Math.max(1, to - from)))));
      if (row.offsetTop <= y) current = index;
    });
    setActive((previous) => (previous === current ? previous : current));
  };
  useMotionValueEvent(scrollYProgress, "change", follow);
  // Where the page already is when it loads, and when the rows change size.
  useEffect(() => {
    follow(scrollYProgress.get());
    const observer = new ResizeObserver(() => follow(scrollYProgress.get()));
    if (list.current) observer.observe(list.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- follow reads refs and the entries only
  }, []);

  return (
    <ol ref={list} className="relative mx-auto mt-[14px] w-full max-w-[612px] md:mt-[70px]">
      {entries.map((entry, index) => {
        const lit = reduced || index <= active;
        const here = reduced || index === active;
        const last = index === entries.length - 1;
        return (
          <li
            key={entry.title}
            ref={(element) => {
              rows.current[index] = element;
            }}
            style={{ "--f": 0 } as React.CSSProperties}
            className={`relative pl-8 transition-opacity duration-500 md:pl-0 ${index === 0 ? "" : "pt-8"} ${last ? "" : "pb-8"} ${here ? "opacity-100" : "opacity-60"}`}
          >
            {/* The dot, and the piece of line from it to the next dot. */}
            <span
              aria-hidden
              style={{ top: index === 0 ? DOT : 32 + DOT }}
              className={`absolute left-[-1px] size-[11px] rounded-full border transition-[background-color,border-color,transform] duration-500 md:left-[165px] ${lit ? "scale-100 border-[#f9007e] bg-[#f9007e]" : "scale-75 border-[#363636] bg-bg"}`}
            />
            {!last && (
              <span aria-hidden style={{ top: (index === 0 ? 0 : 32) + DOT + 5, bottom: -(32 + DOT) + 5 }} className="absolute left-[4px] w-px bg-[#363636] md:left-[170px]">
                <span className="absolute inset-0 origin-top bg-[#f9007e] [transform:scaleY(var(--f))]" />
              </span>
            )}

            <div className="flex flex-col gap-[10px] md:flex-row md:gap-10">
              <p className={`text-[13px] leading-5 font-bold transition-colors duration-500 md:w-[150px] md:shrink-0 ${here ? "text-fg" : "text-[#8c8c8c]"}`}>{entry.period}</p>
              <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <h3 className="text-[17px] leading-6 font-bold text-fg">{entry.title}</h3>
                <p className="text-[15px] leading-[22px] font-medium text-sub">{entry.place}</p>
                <p className="mt-[6px] text-[14px] leading-[22px] font-medium text-sub">{entry.body}</p>
                <ul className="flex flex-wrap gap-2 pt-[10px]">
                  {entry.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-[#363636] px-3 py-[5px] text-[12px] font-medium text-sub">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {!last && <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-[#363636] md:left-0" />}
          </li>
        );
      })}
    </ol>
  );
}
