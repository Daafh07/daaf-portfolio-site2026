import type { ReactNode } from "react";

// A button of the contact section: a hand-drawn blob (one picture each, stretched to the label) with
// the name on it. The email is the filled one; the others are outlines. Without an `href` it is a
// plain label, not a link (see data/contact.ts).
const STYLES = {
  email: { src: "/ui/contact-email.svg", inset: "top-[3.7%] bottom-0", text: "px-4 text-bg" },
  linkedin: { src: "/ui/contact-linkedin.svg", inset: "top-[7.7%] bottom-[2.03%]", text: "px-7 text-sub hover:text-fg" },
  instagram: { src: "/ui/contact-instagram.svg", inset: "top-[7.15%] bottom-[1.65%]", text: "px-7 text-sub hover:text-fg" },
} as const;

export function ContactButton({ kind, href, children }: { kind: keyof typeof STYLES; href?: string; children: ReactNode }) {
  const style = STYLES[kind];
  const className = `group relative inline-flex h-[38px] items-center justify-center font-blur text-[15px] leading-none transition-[transform,color] duration-150 ease-out ${style.text} ${href ? "active:scale-[0.97]" : ""}`;
  const inside = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative stretched SVG */}
      <img src={style.src} alt="" aria-hidden className={`pointer-events-none absolute inset-x-0 h-auto w-full ${style.inset}`} style={{ height: "auto" }} />
      <span className="relative top-[1.5px]">{children}</span>
    </>
  );
  if (!href) return <span className={className}>{inside}</span>;
  return (
    <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
      {inside}
    </a>
  );
}
