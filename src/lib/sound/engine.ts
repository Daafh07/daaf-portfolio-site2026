import { SOUNDS, type SoundName, type Voice } from "./sounds";

// A small sound engine on the Web Audio API. There are no audio files: every sound is built
// from oscillators and filtered noise at the moment it plays, so there is nothing to load.
//
// Browsers only allow sound after a click, tap or key press. `unlock()` must be called from
// one of those events (the first grab of the D does). Until then `play()` stays silent.

const STORAGE_KEY = "daaf-sound";

let context: AudioContext | null = null;
let output: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled = readPreference();
const listeners = new Set<() => void>();
const lastPlayed = new Map<SoundName, number>();

function readPreference() {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true; // no storage (server, private window): default to on
  }
}

function getContext() {
  if (!context || context.state === "closed") {
    noiseBuffer = null;
    try {
      context = new AudioContext();
    } catch {
      return null;
    }
    output = context.createGain();
    output.gain.value = enabled ? 0.9 : 0;
    output.connect(context.destination);
  }
  if (context.state === "suspended") void context.resume().catch(() => {});
  return context;
}

function getNoise(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// Quick fade in and exponential fade out: no clicks at the start or end of a sound.
function envelope(ctx: AudioContext, start: number, duration: number, peak: number, attack: number) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  return gain;
}

function createVoice(ctx: AudioContext, out: AudioNode): Voice {
  return {
    tone({ wave = "sine", from, to = from, duration, peak, attack = 0.004, cutoff, delay = 0 }) {
      const start = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(from, start);
      if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
      const gain = envelope(ctx, start, duration, peak, attack);
      let lowpass: BiquadFilterNode | undefined;
      if (cutoff) {
        lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = cutoff;
        osc.connect(lowpass).connect(gain);
      } else {
        osc.connect(gain);
      }
      gain.connect(out);
      osc.onended = () => {
        osc.disconnect();
        lowpass?.disconnect();
        gain.disconnect();
      };
      osc.start(start);
      osc.stop(start + duration + 0.02);
    },

    noise({ filter = "bandpass", freq, q = 1, duration, peak, attack = 0.002, delay = 0 }) {
      const start = ctx.currentTime + delay;
      const source = ctx.createBufferSource();
      source.buffer = getNoise(ctx);
      const biquad = ctx.createBiquadFilter();
      biquad.type = filter;
      biquad.frequency.value = freq;
      biquad.Q.value = q;
      const gain = envelope(ctx, start, duration, peak, attack);
      source.connect(biquad).connect(gain).connect(out);
      source.onended = () => {
        source.disconnect();
        biquad.disconnect();
        gain.disconnect();
      };
      // Start at a random point so repeated bursts do not sound identical.
      source.start(start, Math.random() * (source.buffer.duration - duration - 0.05));
      source.stop(start + duration + 0.02);
    },
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const sound = {
  /** Call from a click, tap or key press. Creates and wakes the audio context. */
  unlock() {
    if (enabled) getContext();
  },

  /** Play a sound. `level` (0 to 1) is how strongly it is triggered. */
  play(name: SoundName, level = 0.5) {
    if (!enabled) return;
    const spec = SOUNDS[name];
    const now = performance.now();
    if (now - (lastPlayed.get(name) ?? -Infinity) < spec.gap * 1000) return;
    const ctx = context;
    // A gesture may still be resuming the context; queue the first grab on its audio clock.
    if (!ctx || ctx.state === "closed" || !output) return;
    lastPlayed.set(name, now);
    spec.play(createVoice(ctx, output), Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0.5);
  },

  isEnabled: () => enabled,

  toggle() {
    enabled = !enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {}
    lastPlayed.clear();
    const ctx = enabled ? getContext() : context;
    if (ctx && output) {
      output.gain.cancelScheduledValues(ctx.currentTime);
      output.gain.setTargetAtTime(enabled ? 0.9 : 0, ctx.currentTime, 0.005);
    }
    notify();
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
