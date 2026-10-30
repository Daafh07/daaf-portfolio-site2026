import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SIMPLE_SIZE } from "@/data/layout";
import type { Inset, SimpleProject } from "@/data/types";
import { insetStyle } from "./tileStyle";

// The standard tile for a project that has no hand-fitted one: the same parts and the same hover
// as ProjectTile (blob, logo, name, arrow badge, preview), but made from the project colour with
// CSS masks, so a new project only needs a colour, a name and, if it has them, a logo and a preview.
// The shapes are the blobs of three of the hand-fitted tiles, taken in turn.
const SHAPES = ["/projects/internetneeds", "/projects/livewall", "/projects/npulse-pave"];
const BLOB: Inset = [1.44, 1.23, 1.06, 0.64];
const LABEL: Inset = [91.37, 17.2, 1.92, 46.78];
const BADGE: Inset = [90.42, 6.75, 1.44, 85.05];
const BADGE_PICTURE: Inset = [3.36, 3.64, 0.75, 0.93];

const mask = (url: string, color: string): CSSProperties => ({
  backgroundColor: color,
  maskImage: `url(${url})`,
  WebkitMaskImage: `url(${url})`,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
});

/** Perceived brightness, 0 (black) to 1 (white). */
function brightness(hex: string) {
  const value = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function GenericTile({ project, index }: { project: SimpleProject; index: number }) {
  const { slug, name, color, logoUrl, previewUrl } = project;
  const shape = SHAPES[index % SHAPES.length];
  const light = brightness(color) > 0.6;
  const onBlob = light ? "#080808" : "#fafafa"; // text and arrow that sit on the project colour
  // A project colour that is too dark to read as a name on the page makes way for a light one.
  const hover = project.hoverLabelColor ?? (brightness(color) < 0.25 ? "#f4f4ed" : color);
  const type = `max(12px, ${(14 / SIMPLE_SIZE.w) * 100}cqw)`;

  return (
    <Link
      href={`/projects/${slug}`}
      data-glass-lens
      aria-label={name}
      className="group relative block [container-type:inline-size] outline-offset-8 focus-visible:outline-2 focus-visible:outline-fg"
      style={{ aspectRatio: `${SIMPLE_SIZE.w} / ${SIMPLE_SIZE.h}` }}
    >
      <span className="absolute" style={{ ...insetStyle(BLOB), ...mask(`${shape}/blob.svg`, color) }} />

      {/* Default: the logo, or else the name, in the middle of the blob. */}
      <span className="absolute flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0" style={insetStyle([23, 25, 27, 25])}>
        {logoUrl ? (
          <Image src={logoUrl} alt="" fill sizes="(min-width: 768px) 20vw, 60vw" className="object-contain" />
        ) : (
          <span className="text-center font-blur leading-none" style={{ color: onBlob, fontSize: `${(38 / SIMPLE_SIZE.w) * 100}cqw` }}>
            {name}
          </span>
        )}
      </span>

      {/* Hover: a preview in the shape of the blob. */}
      {previewUrl && (
        <span className="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" style={{ ...insetStyle(BLOB), ...mask(`${shape}/blob.svg`, "transparent") }}>
          <Image src={previewUrl} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        </span>
      )}

      <span
        className="absolute flex items-center justify-end whitespace-nowrap text-right font-bold text-sub transition-colors duration-300 group-hover:[color:var(--hover)] group-focus-visible:[color:var(--hover)]"
        style={{ ...insetStyle(LABEL), fontSize: type, "--hover": hover } as CSSProperties}
      >
        {name}
      </span>
      <span className="absolute" style={insetStyle(BADGE)}>
        <span className="absolute" style={{ ...insetStyle(BADGE_PICTURE), ...mask("/projects/internetneeds/badge.svg", color) }} />
        <span
          className="absolute transition-transform duration-300 ease-out [transform:translate(-50%,-50%)_rotate(-90deg)] group-hover:[transform:translate(-50%,-50%)_rotate(0deg)] group-focus-visible:[transform:translate(-50%,-50%)_rotate(0deg)]"
          style={{ left: "48.65%", top: "51.6%", width: "35.3%", aspectRatio: "9 / 12", ...mask("/projects/internetneeds/arrow.svg", onBlob) }}
        />
      </span>
    </Link>
  );
}
