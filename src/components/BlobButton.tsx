import type { ComponentProps } from "react";

type BlobButtonProps = ComponentProps<"a">;

// Hand-drawn blob from Figma ("Blob", 118x38). The SVG uses preserveAspectRatio="none",
// so it stretches to whatever width the label needs.
export function BlobButton({ className = "", children, ...props }: BlobButtonProps) {
  return (
    <a
      className={`group relative inline-flex h-[38px] items-center justify-center px-7 font-blur text-[15px] leading-none text-bg transition-transform duration-150 ease-out active:scale-[0.97] ${className}`}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative stretched SVG */}
      <img
        src="/ui/blob-button.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[7.68%] bottom-[2.07%] h-[90.25%] w-full"
      />
      <span className="relative">{children}</span>
    </a>
  );
}
