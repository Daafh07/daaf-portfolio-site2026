"use client";

import { useId, useState } from "react";
import { STEPS } from "@/data/services";

// The four steps of how I work. One is open at a time (the first one at the start); a click on
// the open one closes it. The panel opens by animating its height from 0 to its own height
// (grid rows 0fr to 1fr), so it needs no measuring.
export function ProcessAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <div className="mx-auto flex w-full max-w-[529px] flex-col">
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
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex h-[46px] w-full cursor-pointer items-center rounded-[43px] bg-fg px-[18px] pb-px text-left text-[15px] font-bold text-bg outline-offset-4 focus-visible:outline-2 focus-visible:outline-fg"
              >
                <span className="whitespace-pre">{step.title}</span>
              </button>
              {index === 0 && (
                // A sticky note on the first step, as in the design; it sits half over the panel, so it
                // is only there while that panel is open.
                // eslint-disable-next-line @next/next/no-img-element -- decorative svg
                <img src="/ui/sticker-idea.svg" alt="" aria-hidden width={56} height={59} className={`pointer-events-none absolute top-[16px] right-[11px] transition-opacity duration-300 md:top-[23px] md:right-[14px] ${isOpen ? "opacity-100" : "opacity-0"}`} />
              )}
              {index === 0 && (
                <span aria-hidden className={`pointer-events-none absolute top-[33px] right-[44px] -rotate-[24deg] text-[6px] text-[#282828] transition-opacity duration-300 md:top-[40px] md:right-[47px] ${isOpen ? "opacity-100" : "opacity-0"}`}>
                  Idea
                </span>
              )}
            </h3>
            <div
              id={panel}
              role="region"
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="mt-[17px] flex flex-col gap-[18px] rounded-[23px] bg-fg px-6 pt-[19px] pb-6">
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
  );
}
