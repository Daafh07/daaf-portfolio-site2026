// Every timing of the intro lives here. Durations and delays are in seconds.
// Values marked "ref" come from the Framer reference site.

type Ease = [number, number, number, number];

const EASE_TRAVEL: Ease = [0.9, 0.06, 0.13, 1]; // ref: slow start, fast middle, soft landing
const EASE_CURTAIN: Ease = [0.77, 0, 0.175, 1]; // ref

export const INTRO = {
  /** sessionStorage key: the intro plays once per session (and again on reload). */
  storageKey: "daaf-intro-played",
  /**
   * sessionStorage key the menu's logo sets (with the time) to ask for the intro, without the game,
   * on the next page load. It only counts for `replayWindow` ms, so a click that never led to a
   * load can't change a later visit.
   */
  replayKey: "daaf-intro-replay",
  /** The event the menu's logo sends to start the intro again on the page that is already open. */
  replayEvent: "daaf:intro-replay",
  replayWindow: 10_000,

  /** Play the slingshot mini game before the letters sequence, or start the sequence right away. */
  game: true,

  /**
   * Slingshot mini game: shoot the D at the white canvas. Where it hits, it hands off to the
   * intro and flies on to its place in the small "Daaf" (frame 19).
   */
  slingshot: {
    hint: {
      text: "Pull back the D and let go",
      keys: "or press Space", // second line, hidden on touch screens
      delay: 0.8,
    },
    // Until the D is grabbed, it demonstrates the move: pulls itself back, holds, springs back.
    demo: {
      start: 1.1, // first demo, seconds after the game appears
      every: 2.8, // repeats this often
      pull: 0.4, // how far, as a fraction of maxPull
      out: 0.7, // seconds to pull back
      hold: 0.2, // seconds held at the back
    },
    hoverScale: 1.06, // the D grows a little under the cursor
    anchorY: 0.56, // socket position, as a fraction of the viewport height
    fontSize: 88, // size of the D in px (shrinks on narrow screens)
    ballRadius: 38,
    socketRadius: 44,
    maxPull: 140, // px
    minPull: 10, // shorter pulls just snap back
    tremble: 1.4, // px of shaking at the pull limit
    // Launch speed = topSpeed × pull^launchCurve, with pull as a fraction of maxPull (0 to 1).
    // Mobile: a pull to the limit launches at ~850 px/s and peaks ~260px above the socket.
    // Desktop: ~1200 px/s, peaks ~520px up on a tall enough screen (height grows with speed²).
    topSpeed: { mobile: 900, desktop: 1300 },
    desktopFrom: 768, // viewport width (px) from which the desktop speed applies (Tailwind md)
    launchCurve: 1.55, // 1 = linear; higher = short pulls launch gently, long pulls hard
    gravity: 1400, // px/s²; higher = the D peaks (and hits the canvas) sooner
    band: { stiffness: 780, damping: 17 }, // how the band snaps back after firing (a bit bouncy)
    stretch: { speed: 1200, max: 0.18, squash: 0.6 }, // the D stretches along its flight: `max` at `speed` px/s
    dust: {
      max: 32, // specks on screen at most
      launch: { count: 8, perPull: 12, speed: 120, speedPerPull: 190, spread: 1.5 }, // puff as the band lets go
      impact: { count: 18, speed: 240 }, // puff when the D hits the canvas
      life: [0.3, 0.7], // seconds a speck lives, random in between
      drag: 3.5, // slows the specks down
      fall: 80, // px/s², a little gravity
    },
    keyboardPull: 0.8, // Space/Enter fires as if pulled 80% straight down
    bandFadeOut: 0.3, // the band disappears once the D has hit the canvas
    sound: {
      notches: 7, // one tick for every 1/7 of the pull
      strainAt: 0.5, // the groan starts once the band is this far into its trembling stretch
    },
  },

  /** Phase 1: small black "Daaf" rises in at the bottom (Figma frame 19). */
  intro: {
    scale: 0.3, // 60px in frame 19 vs 200px in the hero
    bottom: 0.0835, // gap under the small word, as a fraction of the viewport height (82 / 982)
    fromY: 100, // ref: letters start 100px lower...
    fromBlur: 60, // ref: ...and heavily blurred
    duration: 0.84, // ref
    stagger: 0.075, // audible rhythm for each rising letter
    ease: EASE_TRAVEL,
    hold: 0.2, // ref: pause before the letters take off
  },

  /** Phase 2: letters fly to the big wordmark, overshooting upwards (Figma frame 18). */
  fly: {
    overshoot: -1, // in em of the hero font size; ref used -200px at 200px
    duration: 0.84, // ref
    stagger: 0.065, // last letter leaves first
    ease: EASE_TRAVEL,
  },

  /** Icons pop in at their scattered spots while the letters are big. */
  stickers: {
    popAfterFlyStart: 0.55,
    stagger: 0.095,
    contact: 0.3, // scale overshoot and pop accent share this beat
    homeStagger: 0.045,
    fromY: -100, // ref: drop in from above
    fromScale: 0.1, // ref
    pop: { type: "spring", bounce: 0.6, duration: 0.7 }, // ref
    home: { type: "spring", bounce: 0.25, duration: 1 }, // glide into place around the wordmark
  },

  /** How long the full white frame 18 stays readable before the curtain opens. */
  scatterHold: 0.3,

  /** Phase 3: the white curtain clips away top to bottom and reveals the dark hero. */
  curtain: { duration: 0.85, ease: EASE_CURTAIN }, // ref

  /** Phase 4: letters drop from the overshoot onto the real heading. */
  land: {
    delay: 0.25, // after the curtain starts; ref
    stagger: 0.055,
    contact: 0.32, // squash and landing accent share this beat
    transition: { type: "spring", bounce: 0.6, duration: 0.8 }, // ref
  },
} as const;

/** Start time of each phase, derived from the config above. */
export function introTimeline(letterCount: number, stickerCount: number) {
  const fly = INTRO.intro.duration + (letterCount - 1) * INTRO.intro.stagger + INTRO.intro.hold;
  const flyEnd = fly + INTRO.fly.duration + (letterCount - 1) * INTRO.fly.stagger;
  const stickers = fly + INTRO.stickers.popAfterFlyStart;
  // A popping spring looks settled at roughly 70% of its duration.
  const stickersEnd = stickers + (stickerCount - 1) * INTRO.stickers.stagger + INTRO.stickers.pop.duration * 0.7;
  const reveal = Math.max(flyEnd, stickersEnd) + INTRO.scatterHold;
  const land = reveal + INTRO.land.delay;
  const done =
    Math.max(
      reveal + INTRO.curtain.duration,
      reveal + INTRO.stickers.home.duration + (stickerCount - 1) * INTRO.stickers.homeStagger,
      land + INTRO.land.transition.duration + (letterCount - 1) * INTRO.land.stagger,
    ) + 0.05;
  return { fly, stickers, reveal, land, done };
}
