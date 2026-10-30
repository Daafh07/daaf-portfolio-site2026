"use client";

import { useInView } from "motion/react";
import type { RefObject } from "react";
import { useIntroDone } from "@/components/intro/useIntroDone";

/** True once the element has scrolled into view (once) and the intro is over, so nothing plays unseen. */
export function useEnter(ref: RefObject<Element | null>, margin = "0px 0px -12% 0px") {
  const inView = useInView(ref, { once: true, margin: margin as `${number}px` });
  const introDone = useIntroDone();
  return inView && introDone;
}
