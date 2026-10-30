import { isCustomProject, type AnyProject } from "./types";

// The desktop grid of "Selected Projects" in design px: three columns that start at different
// heights (the staggered look of the design), row after row. Where a tile sits follows from its
// number in the list, so projects can be added without placing them by hand.
export const GRID_WIDTH = 984;
const COLUMNS = [
  { x: 0, top: 25, pitch: 347 },
  { x: 337.5, top: 106, pitch: 341 },
  { x: 658.5, top: 0, pitch: 341 },
];

/** Size of a standard tile (a new project): about that of the hand-fitted ones. */
export const SIMPLE_SIZE = { w: 324, h: 316 };

export const tileSize = (project: AnyProject) => (isCustomProject(project) ? project.size : SIMPLE_SIZE);

export function placeTiles(projects: AnyProject[]) {
  const tiles = projects.map((project, index) => {
    const column = COLUMNS[index % COLUMNS.length];
    const size = tileSize(project);
    return { project, size, x: column.x, y: column.top + Math.floor(index / COLUMNS.length) * column.pitch };
  });
  const height = Math.max(0, ...tiles.map(({ y, size }) => y + size.h));
  return { tiles, height };
}
