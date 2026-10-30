import { Reveal } from "@/components/motion/Reveal";
import { EXPERIENCE } from "@/data/experience";

// "Work experience": a timeline of rows. On desktop the period sits left of the details (150px, then
// a gap of 40px) in a column of 612px; on a phone the period is above them. This is where
// "Experience" in the menu and "Work experience" in the introduction lead.
export function WorkExperience() {
  return (
    <section id="experience" className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">Work experience</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">Where I have worked, and what I was actually doing there.</p>
        </div>
      </Reveal>

      <ol className="mx-auto mt-[14px] w-full max-w-[612px] md:mt-[70px]">
        {EXPERIENCE.map((entry, index) => (
          <li key={entry.title} className={`border-[#363636] ${index === 0 ? "pb-8" : "py-8"} ${index === EXPERIENCE.length - 1 ? "pb-0" : "border-b"}`}>
            <Reveal>
              <div className="flex flex-col gap-[10px] md:flex-row md:gap-10">
                <p className={`text-[13px] leading-5 font-bold md:w-[150px] md:shrink-0 ${entry.current ? "text-fg" : "text-[#8c8c8c]"}`}>{entry.period}</p>
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
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
