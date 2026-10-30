import { SOUNDS, type SoundName, type SoundSpec, type Voice } from "./sounds";

// A small sound engine on the Web Audio API. There are no audio files: every sound is built
// from oscillators and filtered noise at the moment it plays, so there is nothing to load.
//
// Browsers only allow sound after a click, tap or key press, and phones are stricter: a finger
// going down does not count, only the finger coming up (or a tap) does. So the engine wakes the
// audio on every gesture (see the listeners at the bottom). Until the audio runs, `play()` stays
// silent instead of queueing, otherwise everything would sound at once when it finally starts.
//
// The same sounds also drive the vibration on phones that support it (see `haptic` in sounds.ts).

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

// Resuming before the visitor has done anything only makes the browser log a warning.
const canResume = () => typeof navigator === "undefined" || (navigator.userActivation?.hasBeenActive ?? true);

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
  // Not only "suspended": iOS Safari also uses "interrupted" (after a call, or switching apps).
  if (context.state !== "running" && canResume()) void context.resume().catch(() => {});
  return context;
}

// Phones that cannot vibrate (all iPhones) simply ignore this.
function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  // Chrome blocks vibration, with a warning, until the visitor has tapped the page once.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  navigator.vibrate(pattern);
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
  /**
   * Call from a click, tap or key press. Creates and wakes the audio context. The promise
   * resolves once the audio runs (or after a short wait if the browser does not allow it yet),
   * so a sound that must not be lost can wait for it.
   */
  unlock(): Promise<void> {
    if (!enabled) return Promise.resolve();
    const ctx = getContext();
    if (!ctx || ctx.state === "running") return Promise.resolve();
    const patience = new Promise<void>((resolve) => setTimeout(resolve, 250));
    return Promise.race([ctx.resume().then(() => undefined), patience]).catch(() => undefined);
  },

  /** Play a sound and its vibration. `level` (0 to 1) is how strongly it is triggered. */
  play(name: SoundName, level = 0.5) {
    if (!enabled) return;
    const spec: SoundSpec = SOUNDS[name];
    const now = performance.now();
    if (now - (lastPlayed.get(name) ?? -Infinity) < spec.gap * 1000) return;
    const strength = Number.isFinite(level) ? Math.min(1, Math.max(0, level)) : 0.5;
    // Only play while the audio runs. Scheduling on a sleeping context would queue the sound and
    // release it all at once later. The vibration does not depend on the audio.
    const ctx = context;
    const out = output;
    const audible = ctx !== null && out !== null && ctx.state === "running";
    const haptic = document.visibilityState === "visible" ? spec.haptic : undefined;
    if (!audible && !haptic) return;
    lastPlayed.set(name, now);
    if (haptic) vibrate(haptic(strength));
    if (audible) spec.play(createVoice(ctx, out), strength);
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

// Phones only start audio from the end of a touch, not from the start of it, and iOS also wants
// a (silent) sound started inside that gesture before it lets later sounds through.
// So every real gesture wakes the audio if it is not running yet. Cheap once it runs.
function wakeOnGesture(event: Event) {
  if (!event.isTrusted || !enabled || context?.state === "running") return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    const silence = ctx.createBufferSource();
    silence.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    silence.connect(ctx.destination);
    silence.start(0);
  } catch {}
}

if (typeof window !== "undefined") {
  for (const type of ["pointerdown", "pointerup", "touchend", "click", "keydown"]) {
    window.addEventListener(type, wakeOnGesture, { capture: true, passive: true });
  }
}
