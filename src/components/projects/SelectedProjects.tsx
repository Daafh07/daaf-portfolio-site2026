import type { CSSProperties } from "react";
import { BlobButton } from "@/components/BlobButton";
import { ParallaxGrid, ParallaxTile } from "@/components/motion/ParallaxGrid";
import { getProjects } from "@/data/getProjects";
import { GRID_WIDTH, placeTiles } from "@/data/layout";
import { isCustomProject } from "@/data/projects";
import { GenericTile } from "./GenericTile";
import { ProjectTile } from "./ProjectTile";

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

// "Selected Projects": six blob tiles. On a phone they are stacked; from md up they sit in the
// staggered grid of the design (984 x 760), placed in percentages so the grid scales as one piece.
export async function SelectedProjects() {
  const { tiles, height } = placeTiles(await getProjects());
  return (
    <section id="work" className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <div className="mx-auto w-full max-w-[443px]">
        <h2 className="text-[22px] font-bold text-fg">Selected Projects</h2>
        <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">
          A small selection of projects, collaborations and experiments.
        </p>
      </div>

      <ParallaxGrid
        style={{ "--ratio": `${GRID_WIDTH} / ${height}` } as CSSProperties}
        className="mx-auto mt-8 flex max-w-[342px] flex-col gap-7 md:relative md:mt-[42px] md:block md:[aspect-ratio:var(--ratio)] md:max-w-[984px]">
        {tiles.map(({ project, size, x, y }, index) => (
          <li
            key={project.slug}
            className="md:absolute md:top-[var(--y)] md:left-[var(--x)] md:w-[var(--w)]"
            style={
              {
                "--x": pct(x, GRID_WIDTH),
                "--y": pct(y, height),
                "--w": pct(size.w, GRID_WIDTH),
              } as CSSProperties
            }
          >
            <ParallaxTile column={index % 3} delay={index * 0.08}>
              {isCustomProject(project) ? <ProjectTile project={project} /> : <GenericTile project={project} index={index} />}
            </ParallaxTile>
          </li>
        ))}
      </ParallaxGrid>

      <div className="relative z-10 mt-10 flex justify-center md:mt-24">
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
