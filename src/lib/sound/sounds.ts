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

type SoundSpec = {
  /** Minimum seconds between two plays, so fast repeats cannot pile up. */
  gap: number;
  play: (voice: Voice, level: number) => void;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

  // The D is picked up: a soft pop with a tiny click on top.
  grab: {
    gap: 0.06,
    play: (v) => {
      v.tone({ from: 520, to: 340, duration: 0.07, peak: 0.055 });
      v.noise({ freq: 1800, q: 1, duration: 0.02, peak: 0.02 });
    },
  },

  // One tick for every step of the pull. Climbs in pitch as the band gets tighter.
  stretch: {
    gap: 0.035,
    play: (v, level) => {
      v.tone({ wave: "triangle", from: lerp(230, 620, level), to: lerp(200, 540, level), duration: 0.04, peak: 0.032, cutoff: 1600 });
      v.noise({ freq: 2600, q: 2, duration: 0.01, peak: 0.008 });
    },
  },

  // The band at its limit: a low, strained groan.
  strain: {
    gap: 0.2,
    play: (v) => {
      v.tone({ wave: "sawtooth", from: 150, to: 136, duration: 0.18, peak: 0.028, attack: 0.02, cutoff: 520 });
      v.tone({ from: 300, to: 286, duration: 0.18, peak: 0.011, attack: 0.02 });
    },
  },

  // Let go: the rubber snaps. A crack, then a fast falling twang. Harder pull, louder snap.
  release: {
    gap: 0.06,
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
    play: (v, level) => {
      const power = lerp(0.6, 1, level);
      v.tone({ from: 130, to: 48, duration: 0.16, peak: 0.09 * power });
      v.noise({ filter: "lowpass", freq: 600, q: 0.7, duration: 0.05, peak: 0.04 * power });
    },
  },
} satisfies Record<string, SoundSpec>;

export type SoundName = keyof typeof SOUNDS;
