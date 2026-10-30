// The shape of a project, as stored in Supabase (table "projects", see supabase/projects.sql) and
// shown as a tile in "Selected Projects" and as a page under /projects/[slug].
//
// Where a tile sits on desktop is worked out from its number in the list (see ./layout.ts).
//
// In a hand-fitted tile every position is a percentage of the tile (Figma's "inset": top, right,
// bottom, left), so a tile scales as one piece. The numbers come from the tile components in
// Figma, section "V6 - Na eerste testronde" (Tile/Intermezzo and so on, states Default and Hover).

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

/**
 * A new project only needs these fields. It gets a standard tile (see GenericTile): one of the
 * three blob shapes in the project colour, the logo (or the name) and a hover preview.
 * The six projects below have their own hand-fitted tile instead (see ProjectTile).
 */
export type SimpleProject = {
  slug: string;
  name: string;
  color: string;
  hoverLabelColor?: string;
  /** A logo picture (url). Without one the name is shown on the blob. */
  logoUrl?: string;
  /** A picture shown in the blob on hover (url). */
  previewUrl?: string;
};

export type AnyProject = Project | SimpleProject;
export const isCustomProject = (project: AnyProject): project is Project => "blob" in project;
