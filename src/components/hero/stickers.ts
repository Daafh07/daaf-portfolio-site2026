// Geometry of the hero wordmark (Figma "Group 10", node 192:2925).
// All sticker positions below are in these design pixels, so they scale with the wordmark.
export const WORDMARK = { width: 531.375, height: 241.236 };

export type Sticker = {
  id: string;
  src: string;
  /** Intrinsic SVG size in design px. */
  w: number;
  h: number;
  /** Resting place around the wordmark: center in design px + rotation (frame 17). */
  home: { x: number; y: number; rotate: number };
  /** Scattered intro position: center as a fraction of the viewport + rotation (frame 18). */
  scatter: { x: number; y: number; rotate: number };
  /** Scattered position on portrait screens. Not in Figma: keeps icons off the wordmark on phones. */
  scatterPortrait: { x: number; y: number };
  /** Pop-in order during the intro (0 pops first). */
  order: number;
};

export const STICKERS: Sticker[] = [
  {
    id: "vscode",
    src: "/hero/vscode.svg",
    w: 42.007,
    h: 41.9545,
    home: { x: 48.54, y: 51.2, rotate: -8.83 },
    scatter: { x: 0.6867, y: 0.2091, rotate: 6.69 },
    scatterPortrait: { x: 0.76, y: 0.24 },
    order: 5,
  },
  {
    id: "mark",
    src: "/hero/mark.svg",
    w: 57.7688,
    h: 57.8126,
    home: { x: 285.38, y: 75.05, rotate: 6.75 },
    scatter: { x: 0.8505, y: 0.4999, rotate: 0 },
    scatterPortrait: { x: 0.84, y: 0.35 },
    order: 0,
  },
  {
    id: "code",
    src: "/hero/code.svg",
    w: 53.8754,
    h: 47.8952,
    home: { x: 504.44, y: 23.95, rotate: 0 },
    scatter: { x: 0.7321, y: 0.7625, rotate: 0 },
    scatterPortrait: { x: 0.74, y: 0.67 },
    order: 2,
  },
  {
    id: "folder",
    src: "/hero/folder.svg",
    w: 67.0051,
    h: 47.6668,
    home: { x: 37.1, y: 207.5, rotate: 9.89 },
    scatter: { x: 0.3023, y: 0.2237, rotate: -6.86 },
    scatterPortrait: { x: 0.24, y: 0.27 },
    order: 1,
  },
  {
    id: "figma",
    src: "/hero/figma.svg",
    w: 31.0066,
    h: 46.4526,
    home: { x: 221.44, y: 215.5, rotate: 8.98 },
    scatter: { x: 0.3364, y: 0.8027, rotate: 0 },
    scatterPortrait: { x: 0.36, y: 0.71 },
    order: 3,
  },
  {
    id: "sticky-note",
    src: "/hero/sticky-note.svg",
    w: 56,
    h: 59,
    home: { x: 489.5, y: 202.64, rotate: 0 },
    scatter: { x: 0.1812, y: 0.5596, rotate: 0 },
    scatterPortrait: { x: 0.16, y: 0.62 },
    order: 4,
  },
];
