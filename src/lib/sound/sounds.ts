// The sound designs. Each one is a few short tones and bursts of filtered noise, layered.
// Durations are in seconds, peaks are gains (keep them small: these are UI sounds).
// `level` (0 to 1) is how strongly the sound is triggered, e.g. how far the band is pulled.

export type ToneSpec = {
  wave?: OscillatorType;
  from: number; // Hz at the start
  to?: number; // Hz at the end, glides there exponentially
  duration: number;
  peak: number;
  attack?: number;
  cutoff?: number; // lowpass in Hz, takes the edge off a harsh wave
  delay?: number;
};

export type NoiseSpec = {
  filter?: BiquadFilterType;
  freq: number;
  q?: number;
  duration: number;
  peak: number;
  attack?: number;
  delay?: number;
};

export type Voice = {
  tone(spec: ToneSpec): void;
  noise(spec: NoiseSpec): void;
};

export type SoundSpec = {
  /** Minimum seconds between two plays, so fast repeats cannot pile up. */
  gap: number;
  play: (voice: Voice, level: number) => void;
  /**
   * Vibration that goes with the sound, in milliseconds: one number, or a pattern of
   * vibrate, pause, vibrate... Only phones that can vibrate use it. Kept to the moments you
   * can feel in the hand (the slingshot), not every intro sound, or the phone would buzz through the whole intro.
   */
  haptic?: (level: number) => number | number[];
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Five notes that sound right in any order, so a row of things can each have its own pitch.
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880];
const pentatonic = (level: number) => PENTATONIC[Math.round(Math.min(1, Math.max(0, level)) * 4)];

export const SOUNDS = {
  // A short rising chord: one soft note per letter, then a brighter flight accent.
  letterRise: {
    gap: 0.025,
    play: (v, level) => {
      const note = lerp(260, 390, level);
      v.tone({ from: note * 0.7, to: note, duration: 0.16, peak: 0.028, attack: 0.018 });
    },
  },
  letterFly: {
    gap: 0.025,
    play: (v, level) => {
      v.noise({ freq: lerp(900, 1800, level), q: 0.6, duration: 0.18, peak: 0.018, attack: 0.025 });
      v.tone({ from: lerp(300, 450, level), to: lerp(500, 750, level), duration: 0.2, peak: 0.023, attack: 0.01 });
    },
  },
  stickerPop: {
    gap: 0.025,
    play: (v, level) => {
      const note = [523.25, 659.25, 783.99, 1046.5, 1174.66][Math.round(level * 4)];
      v.tone({ from: note * 1.6, to: note, duration: 0.12, peak: 0.045, attack: 0.003 });
      v.tone({ wave: "triangle", from: note * 0.5, duration: 0.09, peak: 0.012, cutoff: 1800 });
    },
  },
  stickerHome: {
    gap: 0.02,
    play: (v, level) => {
      v.tone({ from: lerp(660, 990, level), to: lerp(440, 660, level), duration: 0.08, peak: 0.015 });
    },
  },
  letterLand: {
    gap: 0.02,
    play: (v, level) => {
      v.tone({ from: lerp(170, 220, level), to: lerp(65, 95, level), duration: 0.16, peak: 0.05 });
      v.noise({ filter: "lowpass", freq: 900, duration: 0.035, peak: 0.019 });
      v.tone({ from: lerp(330, 490, level), to: lerp(280, 420, level), delay: 0.1, duration: 0.09, peak: 0.012 });
    },
  },
  reveal: {
    gap: 0.3,
    play: (v) => {
      v.noise({ filter: "lowpass", freq: 1600, duration: 0.65, peak: 0.025, attack: 0.16 });
    },
  },

  // Air under incoming content; quiet enough for staggered rows.
  contentIn: {
    gap: 0.04,
    play: (v, level) => {
      v.noise({ freq: lerp(1100, 1700, level), q: 0.5, duration: 0.23, peak: 0.014, attack: 0.035 });
      v.tone({ from: 330, to: 440, duration: 0.18, peak: 0.009, attack: 0.025 });
    },
  },
  cardDeal: {
    gap: 0.025,
    play: (v, level) => {
      v.noise({ freq: lerp(1400, 2400, level), q: 0.7, duration: 0.09, peak: 0.018, attack: 0.008 });
      v.tone({ from: lerp(440, 660, level), to: lerp(330, 495, level), duration: 0.08, peak: 0.012 });
    },
  },
  glassSnap: {
    gap: 0.12,
    play: (v, level) => {
      // A muted bubble: a short downward glide, without the ringing overtone.
      const note = lerp(300, 360, level);
      v.tone({ from: note, to: note * 0.55, duration: 0.095, peak: 0.023, attack: 0.008 });
      v.noise({ filter: "lowpass", freq: 650, q: 0.5, duration: 0.035, peak: 0.006, attack: 0.006 });
    },
  },
  glassClick: {
    gap: 0.07,
    play: (v) => {
      v.tone({ from: 980, to: 620, duration: 0.065, peak: 0.032, attack: 0.002 });
      v.noise({ freq: 2600, q: 1.2, duration: 0.018, peak: 0.009 });
    },
  },

  // The D is picked up: a soft pop with a tiny click on top.
  grab: {
    gap: 0.06,
    haptic: () => 12,
    play: (v) => {
      v.tone({ from: 520, to: 340, duration: 0.07, peak: 0.055 });
      v.noise({ freq: 1800, q: 1, duration: 0.02, peak: 0.02 });
    },
  },

  // One tick for every step of the pull. Climbs in pitch as the band gets tighter.
  stretch: {
    gap: 0.035,
    haptic: (level) => 6 + Math.round(level * 6), // firmer as the band gets tighter
    play: (v, level) => {
      v.tone({ wave: "triangle", from: lerp(230, 620, level), to: lerp(200, 540, level), duration: 0.04, peak: 0.032, cutoff: 1600 });
      v.noise({ freq: 2600, q: 2, duration: 0.01, peak: 0.008 });
    },
  },

  // The band at its limit: a low, strained groan.
  strain: {
    gap: 0.2,
    haptic: () => [18, 24, 18, 24, 18], // a tremble
    play: (v) => {
      v.tone({ wave: "sawtooth", from: 150, to: 136, duration: 0.18, peak: 0.028, attack: 0.02, cutoff: 520 });
      v.tone({ from: 300, to: 286, duration: 0.18, peak: 0.011, attack: 0.02 });
    },
  },

  // Let go: the rubber snaps. A crack, then a fast falling twang. Harder pull, louder snap.
  release: {
    gap: 0.06,
    haptic: (level) => 24 + Math.round(level * 16),
    play: (v, level) => {
      const power = lerp(0.6, 1, level);
      v.noise({ freq: 2200, q: 1.5, duration: 0.03, peak: 0.05 * power });
      v.tone({ wave: "triangle", from: 380, to: 95, duration: 0.2, peak: 0.07 * power });
      v.tone({ from: 760, to: 190, duration: 0.09, peak: 0.02 * power });
    },
  },

  // The D hits the canvas: a low thump with a bit of body.
  impact: {
    gap: 0.06,
    haptic: (level) => 30 + Math.round(level * 20),
    play: (v, level) => {
      const power = lerp(0.6, 1, level);
      v.tone({ from: 130, to: 48, duration: 0.16, peak: 0.09 * power });
      v.noise({ filter: "lowpass", freq: 600, q: 0.7, duration: 0.05, peak: 0.04 * power });
    },
  },

  // ── How I can help ──────────────────────────────────────────
  // The pointer arrives on a blob in the dock: a small bubble, each blob its own note.
  dockHover: {
    gap: 0.05,
    play: (v, level) => {
      const note = pentatonic(level);
      v.tone({ from: note * 1.3, to: note, duration: 0.11, peak: 0.02, attack: 0.006 });
      v.tone({ wave: "triangle", from: note * 0.5, duration: 0.08, peak: 0.006, cutoff: 1500 });
    },
  },
  // A blob is picked: two notes up, with a tick on top. Put away again: one note down.
  dockPick: {
    gap: 0.1,
    play: (v, level) => {
      const note = pentatonic(level);
      v.tone({ from: note, to: note * 1.01, duration: 0.15, peak: 0.038, attack: 0.004 });
      v.tone({ from: note * 1.5, delay: 0.07, duration: 0.2, peak: 0.028, attack: 0.004 });
      v.noise({ freq: 2400, q: 1, duration: 0.015, peak: 0.01 });
    },
  },
  dockPut: {
    gap: 0.1,
    play: (v, level) => {
      const note = pentatonic(level);
      v.tone({ from: note * 1.2, to: note * 0.7, duration: 0.13, peak: 0.028, attack: 0.004 });
    },
  },
  // The next step opens while you scroll: a note that climbs a little with every step, and some air.
  stepOpen: {
    gap: 0.25,
    play: (v, level) => {
      const note = lerp(300, 520, level);
      v.tone({ from: note * 0.8, to: note, duration: 0.18, peak: 0.03, attack: 0.012 });
      v.tone({ wave: "triangle", from: note * 1.5, delay: 0.05, duration: 0.14, peak: 0.012, cutoff: 2200 });
      v.noise({ filter: "lowpass", freq: 1400, duration: 0.22, peak: 0.012, attack: 0.05 });
    },
  },

  // ── The statement ───────────────────────────────────────────
  // A letter is typed: a small dry key click, a little different every time. Soft, as there are many.
  typeKey: {
    gap: 0.03,
    play: (v, level) => {
      v.noise({ freq: lerp(2200, 3400, level), q: 1.4, duration: 0.014, peak: 0.016, attack: 0.001 });
      v.tone({ wave: "triangle", from: lerp(900, 1300, level), to: lerp(540, 780, level), duration: 0.03, peak: 0.008, cutoff: 2400 });
    },
  },
  // The sentence is complete and the wave runs out: a deep swell, a rush of air, and the dots landing.
  statementWave: {
    gap: 1,
    play: (v) => {
      v.tone({ from: 150, to: 38, duration: 0.9, peak: 0.06, attack: 0.01 });
      v.noise({ filter: "lowpass", freq: 700, duration: 1.1, peak: 0.035, attack: 0.08 });
      v.noise({ freq: 2400, q: 0.7, duration: 0.6, peak: 0.015, attack: 0.05, delay: 0.05 });
      [0.25, 0.4, 0.58].forEach((delay, i) => v.tone({ from: 1568 - i * 120, to: 1318 - i * 100, delay, duration: 0.08, peak: 0.008 }));
    },
  },
  // Dots (or blobs) are thrown out by a click: a whoosh with a thump under it.
  scatter: {
    gap: 0.25,
    play: (v, level) => {
      const power = lerp(0.6, 1, level);
      v.noise({ freq: 1800, q: 0.8, duration: 0.35, peak: 0.03 * power, attack: 0.01 });
      v.tone({ from: 300, to: 120, duration: 0.22, peak: 0.035 * power });
      v.noise({ filter: "lowpass", freq: 500, duration: 0.1, peak: 0.02 * power });
    },
  },

  // ── Work experience ─────────────────────────────────────────
  // The line reaches the next row: a soft pluck, a note higher for every row, and a tick.
  timelineStep: {
    gap: 0.2,
    play: (v, level) => {
      const note = pentatonic(level);
      v.tone({ wave: "triangle", from: note * 0.5, duration: 0.25, peak: 0.028, attack: 0.004, cutoff: 1800 });
      v.tone({ from: note * 2, duration: 0.12, peak: 0.01 });
      v.noise({ freq: 3000, q: 1.5, duration: 0.01, peak: 0.006 });
    },
  },

  // ── What I build with ───────────────────────────────────────
  // The pointer sets a blob moving: a short, wooden knock, each blob its own pitch.
  toolNudge: {
    gap: 0.06,
    play: (v, level) => {
      v.tone({ wave: "triangle", from: lerp(190, 330, level), to: lerp(190, 330, level) * 0.7, duration: 0.09, peak: 0.02, cutoff: 1500 });
      v.noise({ filter: "lowpass", freq: 900, duration: 0.02, peak: 0.006 });
    },
  },
  // Two blobs meet: a click, louder the harder they hit.
  toolClack: {
    gap: 0.045,
    play: (v, level) => {
      v.tone({ wave: "triangle", from: lerp(420, 760, level), to: lerp(420, 760, level) * 0.6, duration: 0.05, peak: lerp(0.008, 0.022, level), cutoff: 2400 });
      v.noise({ freq: 2600, q: 2, duration: 0.012, peak: 0.008 });
    },
  },
  // The blobs have found their places again after being thrown: a soft chord.
  toolGather: {
    gap: 1,
    play: (v) => {
      [392, 493.88, 587.33].forEach((note, i) => v.tone({ from: note, delay: i * 0.05, duration: 0.35, peak: 0.012, attack: 0.03 }));
    },
  },
} satisfies Record<string, SoundSpec>;

export type SoundName = keyof typeof SOUNDS;
