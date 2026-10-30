import type { CSSProperties } from "react";
import type { Inset } from "@/data/types";

export const pct = (value: number) => `${value}%`;

/** A box placed with Figma's inset (top, right, bottom, left), all in percent. */
export const insetStyle = ([top, right, bottom, left]: Inset): CSSProperties => ({
  top: pct(top),
  right: pct(right),
  bottom: pct(bottom),
  left: pct(left),
});
