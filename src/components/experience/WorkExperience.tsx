import { Reveal } from "@/components/motion/Reveal";
import { EXPERIENCE } from "@/data/experience";
import { Timeline } from "./Timeline";

// "Work experience": the timeline of rows, with a line that draws itself as you scroll (Timeline).
// This is where "Experience" in the menu and "Work experience" in the introduction lead.
export function WorkExperience() {
  return (
    <section id="experience" className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">Work experience</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">Where I have worked, and what I was actually doing there.</p>
        </div>
      </Reveal>
      <Timeline entries={EXPERIENCE} />
    </section>
  );
}
