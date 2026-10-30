import type { CSSProperties } from "react";
import { BlobButton } from "@/components/BlobButton";
import { Reveal } from "@/components/motion/Reveal";
import { getProjects } from "@/data/getProjects";
import { GRID } from "@/data/projects";
import { ProjectTile } from "./ProjectTile";

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

// "Selected Projects": six blob tiles. On a phone they are stacked; from md up they sit in the
// staggered grid of the design (984 x 760), placed in percentages so the grid scales as one piece.
export async function SelectedProjects() {
  const projects = await getProjects();
  return (
    <section id="work" className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <div className="mx-auto w-full max-w-[443px]">
        <h2 className="text-[22px] font-bold text-fg">Selected Projects</h2>
        <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">
          A small selection of projects, collaborations and experiments.
        </p>
      </div>

      <ul className="mx-auto mt-8 flex max-w-[342px] flex-col gap-7 md:relative md:mt-[42px] md:block md:aspect-[984/760] md:max-w-[984px]">
        {projects.map((project, index) => (
          <li
            key={project.slug}
            className="md:absolute md:top-[var(--y)] md:left-[var(--x)] md:w-[var(--w)]"
            style={
              {
                "--x": pct(project.grid.x, GRID.w),
                "--y": pct(project.grid.y, GRID.h),
                "--w": pct(project.size.w, GRID.w),
              } as CSSProperties
            }
          >
            <Reveal delay={index * 0.08}>
              <ProjectTile project={project} />
            </Reveal>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex justify-center md:mt-16">
        {/* Text and icon sit as one group in the middle of the blob, with the same space on both sides. */}
        <BlobButton href="/#contact" className="px-5!">
          Your project could be here next
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
          <img src="/ui/arrow-badge.svg?v=2" alt="" aria-hidden width={22} height={22} className="relative block" />
        </BlobButton>
      </div>
    </section>
  );
}
