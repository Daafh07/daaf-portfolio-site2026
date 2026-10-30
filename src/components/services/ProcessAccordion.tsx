"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useId, useRef, useState } from "react";
import { STEPS } from "@/data/services";
import { sound } from "@/lib/sound/engine";

// The four steps of how I work. The accordion stays in view (sticky) while the page scrolls past
// it, and the steps open one after the other as you go: scrolling is what moves it on. A click on
// a step scrolls to that step, so scrolling and clicking never disagree. The panel opens by
// animating its height from 0 to its own height (grid rows 0fr to 1fr), so it needs no measuring.
const STICKY_TOP = 96; // px from the top of the screen where it stays (under the menu)
const SCROLL_PER_STEP = 70; // svh of scrolling for each step after the first

export function ProcessAccordion() {
  const [open, setOpen] = useState(0);
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: [`start ${STICKY_TOP}px`, "end end"],
  });
  const current = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(progress * STEPS.length)));
    if (next === current.current) return;
    current.current = next;
    setOpen(next);
    sound.play("stepOpen", next / (STEPS.length - 1)); // a note higher with every step
  });

  const goTo = (index: number) => {
    const element = track.current;
    if (!element) return;
    const distance = element.offsetHeight - window.innerHeight; // the scrolling that moves the steps
    const start = window.scrollY + element.getBoundingClientRect().top - STICKY_TOP;
    window.scrollTo({ top: start + ((index + 0.5) / STEPS.length) * distance });
  };

  return (
    <div
      ref={track}
      style={{
        height: `calc(100svh + ${(STEPS.length - 1) * SCROLL_PER_STEP}svh)`,
      }}
    >
      <div className="sticky mx-auto flex w-full max-w-[529px] flex-col" style={{ top: STICKY_TOP }}>
        {STEPS.map((step, index) => {
          const isOpen = open === index;
          const panel = `${id}-panel-${index}`;
          return (
            <div key={step.title} className={index ? "mt-[17px]" : ""}>
              <h3 className="relative">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => goTo(index)}
                  className="flex h-[46px] w-full cursor-pointer items-center rounded-[43px] bg-fg px-[18px] pb-px text-left text-[15px] font-bold text-bg outline-offset-4 focus-visible:outline-2 focus-visible:outline-fg"
                >
                  <span className="whitespace-pre">{step.title}</span>
                </button>
                {index === 0 && (
                  // A sticky note on the first step, as in the design; it sits half over the panel, so it
                  // is only there while that panel is open.
                  // eslint-disable-next-line @next/next/no-img-element -- decorative svg
                  <img
                    src="/ui/sticker-idea.svg"
                    alt=""
                    aria-hidden
                    width={56}
                    height={59}
                    className={`pointer-events-none absolute z-10 top-[16px] right-[11px] transition-opacity duration-700 md:top-[23px] md:right-[14px] ${isOpen ? "opacity-100" : "opacity-0"}`}
                  />
                )}
                {index === 0 && (
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute z-10 top-[33px] right-[44px] -rotate-[24deg] text-[6px] text-[#282828] transition-opacity duration-700 md:top-[40px] md:right-[47px] ${isOpen ? "opacity-100" : "opacity-0"}`}
                  >
                    Idea
                  </span>
                )}
              </h3>
              <div
                id={panel}
                role="region"
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-[900ms] ease-[cubic-bezier(0.45,0,0.15,1)] motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`mt-[17px] flex flex-col gap-[18px] rounded-[23px] bg-fg px-6 pt-[19px] pb-6 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${isOpen ? "translate-y-0 opacity-100 delay-200" : "-translate-y-2 opacity-0"}`}
                  >
                    <p className="text-[15px] leading-[23px] font-bold text-bg">{step.lead}</p>
                    <p className="text-[14px] leading-[22px] font-medium text-[#3c3c3c]">{step.body}</p>
                    <div className="h-px w-full bg-[#e0e0e0]" />
                    <div className="flex flex-col gap-[10px]">
                      <p className="text-[13px] font-bold text-bg">You get</p>
                      <div className="grid grid-cols-2 gap-x-4 text-[14px] leading-5 font-medium text-[#3c3c3c]">
                        {step.gets.map((column, columnIndex) => (
                          <ul key={columnIndex} className="flex flex-col gap-2">
                            {column.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ))}
                      </div>
                    </div>
                    <p className="text-[13px] font-bold text-[#6e6e6e]">{step.time}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
