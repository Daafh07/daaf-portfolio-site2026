/** A small dot with a ring that pulses outward: "this is happening now" / "open". Still for reduced motion. */
export function LiveDot({ color = "#d1ff00" }: { color?: string }) {
  return (
    <span aria-hidden className="relative inline-flex size-2 shrink-0">
      <span className="absolute inline-flex size-full animate-ping rounded-full opacity-70 motion-reduce:hidden" style={{ backgroundColor: color }} />
      <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}
