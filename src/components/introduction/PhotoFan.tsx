"use client";

import { MotionConfig, motion, useInView } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useIntroDone } from "@/components/intro/useIntroDone";
import { FAN_MOTION, SLOTS, fanPose, stackedPose } from "./fanMotion";
import { FAN, FAN_PHOTOS } from "./photos";

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

// Five photos fanned out like a hand of cards. The box keeps the proportions of the design and
// everything inside is a percentage of it, so the fan scales as one piece: edge to edge on a
// phone, 865px at most on a desktop. Decorative, so hidden from screen readers.
//
// When it scrolls into view (and the intro is over) the cards are dealt out of a stack into the
// fan. After that, the card under the cursor lifts and the others turn away from it.
export function PhotoFan() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: FAN_MOTION.reveal.enterAt });
  const introDone = useIntroDone();
  const revealed = inView && introDone;
  const [dealt, setDealt] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  // Hovering only starts once the last card has landed.
  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setDealt(true), FAN_MOTION.reveal.settle * 1000);
    return () => clearTimeout(timer);
  }, [revealed]);

  return (
    // "user": people who asked for less motion get the cards in place without the movement.
    <MotionConfig reducedMotion="user">
      <div
        ref={ref}
        aria-hidden
        className="relative mx-auto w-full max-w-[865px] [container-type:inline-size]"
        style={{ aspectRatio: `${FAN.width} / ${FAN.height}` }}
      >
        {FAN_PHOTOS.map((photo, i) => {
          const slot = SLOTS[i];
          // Dealt from the right to the left.
          const delay = (FAN_PHOTOS.length - 1 - slot) * FAN_MOTION.reveal.stagger;
          return (
            // The wrapper only places the card (and does the hovering): it never moves, so the
            // card cannot slip away from under the cursor.
            <div
              key={photo.src}
              className="absolute"
              style={{
                left: pct(photo.x, FAN.width),
                top: pct(photo.y, FAN.height),
                width: pct(photo.w, FAN.width),
                aspectRatio: `${photo.w} / ${photo.h}`,
                transform: "translate(-50%, -50%)",
                zIndex: hovered === slot ? 10 : undefined,
              }}
              onPointerEnter={(event) => dealt && event.pointerType === "mouse" && setHovered(slot)}
              onPointerLeave={() => setHovered(null)}
            >
              <motion.div
                className="relative h-full w-full overflow-hidden"
                // cqw: a percentage of the fan's width, so the corners scale with it.
                style={{ borderRadius: `${(FAN.radius / FAN.width) * 100}cqw` }}
                initial={stackedPose(photo)}
                animate={
                  revealed
                    ? { ...fanPose(photo, slot, hovered), ...(dealt ? {} : { transition: { ...FAN_MOTION.reveal.spring, delay } }) }
                    : stackedPose(photo)
                }
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 865px) 250px, 30vw"
                  className="object-cover"
                  style={{ objectPosition: photo.focus }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>
    </MotionConfig>
  );
}
