import { Reveal } from "@/components/motion/Reveal";
import { insetStyle } from "@/components/projects/tileStyle";
import { TOOL_HEIGHT, TOOLS } from "@/data/tools";

// "What I build with": every tool is a name on an outlined blob. The blobs are sized in em, so the
// whole wall grows from the phone's 13.6px type to the 17px of the desktop as one piece. The wall is
// wider than the text column on desktop (two rows of eight), as in the design.
export function WhatIBuildWith() {
  return (
    <section className="mx-auto w-full max-w-[1208px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">What I build with</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">The tools I reach for, and a few I am still getting better at.</p>
        </div>
      </Reveal>

      <Reveal className="mt-[14px] md:mt-[84px]">
        <ul className="mx-auto flex max-w-[1160px] flex-wrap gap-[10px] pt-3 text-[13.6px] md:justify-center md:gap-3 md:pt-0 md:text-[17px]">
          {TOOLS.map((tool) => (
            <li key={tool.name} className="relative flex items-center justify-center font-blur leading-none text-sub" style={{ width: `${tool.width}em`, height: `${TOOL_HEIGHT}em` }}>
              <span aria-hidden className="absolute" style={insetStyle(tool.inset)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative outline, sized by its box */}
                <img src={tool.shape} alt="" draggable={false} className="block size-full max-w-none select-none" />
              </span>
              <span className="relative top-[0.04em]">{tool.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
