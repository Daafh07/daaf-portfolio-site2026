"use client";

import { useSyncExternalStore } from "react";
import { sound } from "@/lib/sound/engine";

// The server cannot know the visitor's choice, so it renders "on"; React corrects it after hydrating.
const enabledOnServer = () => true;

export function SoundToggle({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const enabled = useSyncExternalStore(sound.subscribe, sound.isEnabled, enabledOnServer);

  return (
    <button
      type="button"
      data-sound-toggle
      aria-label="Sound effects"
      aria-pressed={enabled}
      onClick={() => sound.toggle()}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 ${dark ? "text-fg/60 hover:text-fg" : "text-bg/55 hover:text-bg"} ${className}`}
    >
      Sound {enabled ? "on" : "off"}
    </button>
  );
}
