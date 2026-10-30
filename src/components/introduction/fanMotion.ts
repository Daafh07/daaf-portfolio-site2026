import type { TargetAndTransition } from "motion/react";
import { FAN_PHOTOS, type FanPhoto } from "./photos";

// All the motion of the photo fan, in one place. Modelled on the card fan above the footer of
// landonorris.com: measured there, written here from scratch. Durations are in seconds.
export const FAN_MOTION = {
  reveal: {
    // The cards start as a stack below the fan and are dealt out into it.
    drop: 0.4, // how far below the fan's middle the stack sits, as a fraction of a card's height
    startScale: 0.88,
    spring: { type: "spring", duration: 0.9, bounce: 0.3 }, // the bounce is the overshoot
    stagger: 0.06, // between two cards, dealt from the right to the left
    settle: 1.3, // after this long the last card has landed and hovering can take over
    enterAt: "0px 0px -8% 0px", // starts when the fan is this far into the screen
  },
  hover: {
    lift: 0.08, // the card under the cursor moves up by this fraction of its own height
    scale: 1.08,
    // How the other cards react, by how many places they are from the hovered card (1, 2, 3...).
    push: [1.5, 1, 0.8, 0.6], // degrees they turn away
    bump: [0.03, 0.018, 0.012, 0.01], // how much bigger they get
    spring: { type: "spring", stiffness: 380, damping: 30 },
  },
} as const;

/** Place in the fan from left to right: 0 is the left-most card. */
export const SLOTS = FAN_PHOTOS.map((photo) => FAN_PHOTOS.filter((other) => other.x < photo.x).length);

const middle = FAN_PHOTOS[SLOTS.indexOf(Math.floor((FAN_PHOTOS.length - 1) / 2))];

/**
 * Where a card starts: on the stack. Offsets are percentages of the card itself, so the whole
 * thing scales with the fan. (The card's own position is set on its wrapper.)
 */
export function stackedPose(photo: FanPhoto): TargetAndTransition {
  return {
    x: `${((middle.x - photo.x) / photo.w) * 100}%`,
    y: `${((middle.y + FAN_MOTION.reveal.drop * middle.h - photo.y) / photo.h) * 100}%`,
    rotate: 0,
    scale: FAN_MOTION.reveal.startScale,
  };
}

/** Where a card rests: in the fan, reacting to the card that is hovered (a slot, or null). */
export function fanPose(photo: FanPhoto, slot: number, hovered: number | null): TargetAndTransition {
  const { hover } = FAN_MOTION;
  if (hovered === null) return { x: "0%", y: "0%", rotate: photo.rotate, scale: 1, transition: hover.spring };
  if (hovered === slot) {
    return { x: "0%", y: `${-hover.lift * 100}%`, rotate: photo.rotate, scale: hover.scale, transition: hover.spring };
  }
  const distance = Math.abs(slot - hovered);
  const away = Math.sign(slot - hovered); // turn away from the hovered card
  const index = Math.min(distance, hover.push.length) - 1;
  return {
    x: "0%",
    y: "0%",
    rotate: photo.rotate + away * hover.push[index],
    scale: 1 + hover.bump[index],
    transition: hover.spring,
  };
}
