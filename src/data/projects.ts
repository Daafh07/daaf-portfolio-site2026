// The projects shown as tiles in "Selected Projects" and as pages under /projects/[slug].
//
// Every position is a percentage of the tile (Figma's "inset": top, right, bottom, left), so a
// tile scales as one piece. The numbers come from the tile components in Figma, section
// "V6 - Na eerste testronde" (Tile/Intermezzo and so on, states Default and Hover).
// Supabase (table "projects") is the source the site reads; this list is the fallback and the
// seed for supabase/projects.sql.

/** top, right, bottom, left, in percent of the box they are measured against. */
export type Inset = [top: number, right: number, bottom: number, left: number];

export type Project = {
  slug: string;
  name: string;
  /** The project colour: the badge, and the name when the tile is hovered. */
  color: string;
  /** The name's colour on hover when the project colour is too dark to read on the page. */
  hoverLabelColor?: string;
  /** Size of the tile in the design (px). Only its proportions matter. */
  size: { w: number; h: number };
  /** Where the tile sits in the desktop grid of 984 x 760 (design px). */
  grid: { x: number; y: number };
  /** The shape of the tile (a hand-drawn blob). `inset` is how far the blob lies inside its own picture. */
  blob: { inset: Inset };
  /** The logo or picture in the middle of the default state. */
  logo:
    | {
        kind: "image";
        src: string;
        inset: Inset;
        /** Rounded corners, in percent of the tile's width. */
        radius?: number;
        /** The picture is bigger than its box and shifted: the size and place of the picture inside it, in percent. */
        crop?: { h: number; left: number; top: number; w: number };
      }
    | { kind: "text"; text: string; inset: Inset; size: number; lineHeight: number; color: string };
  label: Inset;
  badge: Inset;
  /** Intermezzo has a second blob behind it that slides out on hover, and a "2 projects" tag. */
  stack?: {
    /** Default position of the stack, and of the front blob (in percent of the tile). */
    stackLeft: number;
    frontRight: number;
    frontTop: number;
    /** On hover the front moves down and the stack to the right (in percent of the tile / of the stack). */
    frontShiftY: number;
    stackShiftX: number;
    aspect: number;
  };
  tag?: { text: string; box: Inset; blobInset: Inset; textBox: Inset };
};

export const PROJECTS: Project[] = [
  {
    slug: "intermezzo",
    name: "Intermezzo",
    color: "#f9007e",
    size: { w: 324.5, h: 316 },
    grid: { x: 0, y: 25 },
    blob: { inset: [0.22, 0.33, 0.53, 0.45] },
    logo: { kind: "image", src: "/projects/intermezzo/logo.png", inset: [17.09, 23.88, 24.37, 19.11], radius: 10.79 },
    label: [89.87, 20.7, 3.48, 47.46],
    badge: [89.08, 10.63, 2.85, 81.51],
    stack: { stackLeft: 2.77, frontRight: 2.77, frontTop: 1.9, frontShiftY: 3.16, stackShiftX: 2.86, aspect: 315.5 / 310 },
    tag: { text: "2 projects", box: [8.23, 63.02, 82.91, 8.01], blobInset: [7.39, 0, 2.31, 0], textBox: [11.08, 67.95, 85.13, 12.94] },
  },
  {
    slug: "internetneeds",
    name: "InternetNeeds",
    color: "#2451e8",
    size: { w: 311, h: 313 },
    grid: { x: 337.5, y: 106 },
    blob: { inset: [1.44, 1.23, 1.06, 0.64] },
    logo: { kind: "image", src: "/projects/internetneeds/logo.svg", inset: [23.32, 25.24, 27.16, 24.92] },
    label: [91.37, 17.2, 1.92, 46.78],
    badge: [90.42, 6.75, 1.44, 85.05],
  },
  {
    slug: "npulse-pave",
    name: "Npulse/Pave",
    color: "#355d4c",
    // Figma uses the dark project green for the name on hover, which hardly reads on the dark page.
    hoverLabelColor: "#6fcfa4",
    size: { w: 325.5, h: 319 },
    grid: { x: 658.5, y: 0 },
    blob: { inset: [0.96, 2.03, 0.51, 1.51] },
    logo: { kind: "image", src: "/projects/npulse-pave/logo.svg", inset: [33.23, 21.81, 42.01, 21.66] },
    label: [89.97, 18.13, 3.45, 47.16],
    badge: [89.18, 8.29, 2.82, 83.87],
  },
  {
    slug: "livewall",
    name: "LiveWall",
    color: "#d1ff00",
    size: { w: 315.5, h: 310 },
    grid: { x: 0, y: 372 },
    blob: { inset: [0.22, 0.33, 0.53, 0.45] },
    logo: {
      kind: "image",
      src: "/projects/livewall/logo.png",
      inset: [35.48, 12.52, 41.5, 12.36],
      crop: { h: 276, left: -30.37, top: -91.22, w: 158.27 },
    },
    label: [90, 18.23, 3.23, 46.91],
    badge: [88.87, 8.08, 2.9, 83.84],
  },
  {
    slug: "pitwall",
    name: "PitWall",
    color: "#2c2c2c",
    hoverLabelColor: "#f4f4ed",
    size: { w: 311, h: 313 },
    grid: { x: 337.5, y: 447 },
    blob: { inset: [1.44, 1.23, 1.06, 0.64] },
    logo: { kind: "image", src: "/projects/pitwall/logo.png", inset: [25.24, 24.92, 24.92, 24.92] },
    label: [91.37, 16.88, 1.92, 47.11],
    badge: [90.42, 6.75, 1.44, 85.05],
  },
  {
    slug: "educheck",
    name: "EduCheck",
    color: "#e19fff",
    size: { w: 325.5, h: 319 },
    grid: { x: 658.5, y: 341 },
    blob: { inset: [0.96, 2.03, 0.51, 1.51] },
    logo: { kind: "text", text: "Edu Check", inset: [46.08, 21.51, 45.77, 21.66], size: 37, lineHeight: 22, color: "#222" },
    label: [90.28, 17.82, 3.13, 47.47],
    badge: [89.18, 8.29, 2.82, 83.87],
  },
];

/** The desktop grid the tiles sit in (design px). */
export const GRID = { w: 984, h: 760 };

export const projectBySlug = (slug: string) => PROJECTS.find((project) => project.slug === slug);
