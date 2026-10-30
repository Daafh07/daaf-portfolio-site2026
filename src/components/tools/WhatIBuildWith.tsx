import { Reveal } from "@/components/motion/Reveal";
import { ToolWall } from "./ToolWall";

// "What I build with": every tool is a name on an outlined blob. The blobs are sized in em, so the
// whole wall grows from the phone's 13.6px type to the 17px of the desktop as one piece. The wall is
// wider than the text column on desktop (two rows of eight), as in the design. The blobs are loose:
// see ToolWall.
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
        <ToolWall />
      </Reveal>
    </section>
  );
}
