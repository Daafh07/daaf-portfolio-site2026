import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Inset, Project } from "@/data/projects";

const pct = (value: number) => `${value}%`;
const insetStyle = ([top, right, bottom, left]: Inset): CSSProperties => ({
  top: pct(top),
  right: pct(right),
  bottom: pct(bottom),
  left: pct(left),
});

// The badge picture lies a little inside the badge's box, the same for every tile.
const BADGE_PICTURE: Inset = [3.36, 3.64, 0.75, 0.93];

/** Plain images: svgs, and a cropped one. next/image is for the photos. */
function Img({ src, className = "size-full", style }: { src: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element -- decorative svg, sized by its box
  return <img src={src} alt="" aria-hidden draggable={false} className={`block max-w-none select-none ${className}`} style={style} />;
}

// One tile. It shows the logo on a blob; on hover (or keyboard focus) the logo makes way for a
// preview of the project, the name takes the project colour and the arrow turns from up to right.
// Intermezzo has a second blob behind it that slides out. Everything is a percentage of the tile,
// and the type is sized in cqw (a percentage of the tile's width), so the tile scales as one piece.
export function ProjectTile({ project }: { project: Project }) {
  const { slug, name, color, size, blob, logo, label, badge, stack, tag } = project;
  const base = `/projects/${slug}`;
  const hoverColor = project.hoverLabelColor ?? color;
  const type = (px: number) => `max(12px, ${(px / size.w) * 100}cqw)`; // never smaller than 12px
  const frontBox: CSSProperties = stack
    ? { left: 0, right: pct(stack.frontRight), top: pct(stack.frontTop), aspectRatio: stack.aspect }
    : { inset: 0 };
  // Keyboard focus shows the same as hover.
  const on = (hover: string, focus: string) => `${hover} ${focus}`;

  return (
    <Link
      href={base}
      data-glass-lens
      aria-label={tag ? `${name}, ${tag.text}` : name}
      className="group relative block [container-type:inline-size] outline-offset-8 focus-visible:outline-2 focus-visible:outline-fg"
      style={{ aspectRatio: `${size.w} / ${size.h}` }}
    >
      {stack && (
        // The blob behind: slides a little to the right on hover.
        <span
          className={`absolute transition-transform duration-300 ease-out ${on("group-hover:[transform:translateX(2.86%)]", "group-focus-visible:[transform:translateX(2.86%)]")}`}
          style={{ left: pct(stack.stackLeft), right: 0, top: 0, aspectRatio: stack.aspect }}
        >
          <span className="absolute" style={insetStyle(blob.inset)}>
            <Img src={`${base}/stack.svg`} />
          </span>
          <span
            className={`absolute opacity-0 transition-opacity duration-300 ${on("group-hover:opacity-100", "group-focus-visible:opacity-100")}`}
            style={insetStyle(blob.inset)}
          >
            <Img src={`${base}/stack-hover.svg`} />
          </span>
        </span>
      )}

      {/* Everything in front. On Intermezzo the whole front moves down on hover. */}
      <span
        className={`absolute inset-0 transition-transform duration-300 ease-out ${
          stack ? on(`group-hover:[transform:translateY(${stack.frontShiftY}%)]`, `group-focus-visible:[transform:translateY(${stack.frontShiftY}%)]`) : ""
        }`}
      >
        {/* Default: the blob with the logo. */}
        <span className={`absolute inset-0 transition-opacity duration-300 ${on("group-hover:opacity-0", "group-focus-visible:opacity-0")}`}>
          <span className="absolute" style={frontBox}>
            <span className="absolute" style={insetStyle(blob.inset)}>
              <Img src={`${base}/blob.svg`} />
            </span>
          </span>
          {logo.kind === "image" ? (
            <span className="absolute overflow-hidden" style={{ ...insetStyle(logo.inset), borderRadius: logo.radius ? `${logo.radius}cqw` : undefined }}>
              {logo.crop ? (
                <Img
                  src={logo.src}
                  className="absolute"
                  style={{ height: pct(logo.crop.h), left: pct(logo.crop.left), top: pct(logo.crop.top), width: pct(logo.crop.w) }}
                />
              ) : logo.src.endsWith(".svg") ? (
                <Img src={logo.src} />
              ) : (
                <Image src={logo.src} alt="" fill sizes="(min-width: 768px) 25vw, 70vw" className="object-cover" />
              )}
            </span>
          ) : (
            <span
              className="absolute flex items-center justify-center text-center"
              style={{
                ...insetStyle(logo.inset),
                color: logo.color,
                // The design uses SF Pro (semibold); other systems get their own interface font.
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Helvetica Neue", system-ui, sans-serif',
                fontWeight: 600,
                fontSize: `${(logo.size / size.w) * 100}cqw`,
                lineHeight: `${(logo.lineHeight / size.w) * 100}cqw`,
              }}
            >
              {logo.text}
            </span>
          )}
          {tag && (
            <>
              <span className="absolute" style={insetStyle(tag.box)}>
                <span className="absolute" style={insetStyle(tag.blobInset)}>
                  <Img src={`${base}/badge-projects.svg`} />
                </span>
              </span>
              <span
                className="absolute flex items-center whitespace-nowrap font-blur"
                style={{ ...insetStyle(tag.textBox), color, fontSize: type(12) }}
              >
                {tag.text}
              </span>
            </>
          )}
        </span>

        {/* Hover: a preview of the project, in the same blob shape. */}
        <span className={`absolute inset-0 opacity-0 transition-opacity duration-300 ${on("group-hover:opacity-100", "group-focus-visible:opacity-100")}`}>
          <span className="absolute" style={frontBox}>
            <span className="absolute" style={insetStyle(blob.inset)}>
              <Image src={`${base}/preview.png`} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" />
            </span>
          </span>
        </span>

        {/* The name, with an arrow in a small blob. */}
        <span
          className={`absolute flex items-center justify-end whitespace-nowrap text-right font-bold text-sub transition-colors duration-300 ${on("group-hover:[color:var(--hover)]", "group-focus-visible:[color:var(--hover)]")}`}
          style={{ ...insetStyle(label), fontSize: type(14), "--hover": hoverColor } as CSSProperties}
        >
          {name}
        </span>
        <span className="absolute" style={insetStyle(badge)}>
          <span className="absolute" style={insetStyle(BADGE_PICTURE)}>
            <Img src={`${base}/badge.svg`} />
          </span>
          <Img
            src={`${base}/arrow.svg`}
            className={`absolute transition-transform duration-300 ease-out [transform:translate(-50%,-50%)_rotate(-90deg)] ${on("group-hover:[transform:translate(-50%,-50%)_rotate(0deg)]", "group-focus-visible:[transform:translate(-50%,-50%)_rotate(0deg)]")}`}
            style={{ left: "48.65%", top: "51.6%", width: "35.3%", height: "auto" }}
          />
        </span>
      </span>
    </Link>
  );
}
