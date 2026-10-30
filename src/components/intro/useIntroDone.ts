"use client";

import { useSyncExternalStore } from "react";

// True once the intro is over (or when it does not play at all). The gate script in the <head>
// marks <html data-intro="playing"> while it runs, and IntroSequence sets "done" at the end.
// Use it to hold back animations that would otherwise run unseen behind the intro curtain.
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-intro"] });
  return () => observer.disconnect();
};
const isDone = () => document.documentElement.dataset.intro !== "playing";

// The server cannot know, so it says "not yet"; the first client render corrects it.
export const useIntroDone = () => useSyncExternalStore(subscribe, isDone, () => false);
