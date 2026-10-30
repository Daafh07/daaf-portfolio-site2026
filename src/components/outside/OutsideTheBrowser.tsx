"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { LiveDot } from "@/components/motion/LiveDot";
import { Pop } from "@/components/motion/Pop";
import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { useEnter } from "@/components/motion/useEnter";

// "Outside the browser": a bento of five tiles. On desktop two rows (a photo and two tiles on the
// right, then two tiles); on a phone they are stacked. Each tile is placed as in the design, and each
// has its own way in: the tiles drop in one after the other (Pop); inside them the photo settles from a
// zoom, the number rolls up to 6, the icons land and keep swaying a little, the quote rises word by
// word, and the "now" tile has a pulsing dot.
const DARK = "border-[1.5px] border-[#363636] bg-[#161616]";
const ROW = 64; // px: the height of one digit in the rolling number

/** The digit rolls up from 0 to `to`, like a counter, when it scrolls into view. */
function RollingDigit({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const enter = useEnter(ref);
  return (
    <span ref={ref} aria-label={String(to)} className="block overflow-hidden" style={{ height: ROW, fontSize: ROW, lineHeight: `${ROW}px` }}>
      <motion.span
        aria-hidden
        className="block"
        initial={{ y: -to * ROW }} // shows the final digit until it plays (also without JavaScript)
        animate={enter ? { y: [0, -to * ROW] } : undefined}
        transition={{ duration: 1.5, ease: [0.22, 0.8, 0.3, 1], delay: 0.5 }}
      >
        {Array.from({ length: to + 1 }, (_, digit) => (
          <span key={digit} className="block" style={{ height: ROW }}>
            {digit}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** A small icon on the desk: it drops in, then sways a little for as long as you look at it. `enter` comes
    from the tile it lies on: the icon itself starts above the tile (and is cut off there), so it cannot
    tell by itself that it has come into view. */
function Icon({ src, className, size, delay, sway, enter }: { src: string; className: string; size: [number, number]; delay: number; sway: number; enter: boolean }) {
  const reduced = useReducedMotion();
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden
      width={size[0]}
      height={size[1]}
      className={`absolute ${className}`}
      initial={{ y: -80, opacity: 0 }}
      animate={enter ? { y: 0, opacity: 1, rotate: reduced ? 0 : [0, 3, -2.5, 0] } : undefined}
      transition={{
        y: { type: "spring", stiffness: 140, damping: 9, delay },
        opacity: { duration: 0.3, delay },
        rotate: { duration: sway, repeat: Infinity, ease: "easeInOut", delay: delay + 1 },
      }}
    />
  );
}

/** The tile with the icons on it. */
function Desk() {
  const tile = useRef<HTMLDivElement>(null);
  const enter = useEnter(tile);
  return (
    <div ref={tile} className={`relative h-[170px] overflow-hidden rounded-[23px] ${DARK}`}>
      <Icon enter={enter} src="/outside/vs-code.svg" size={[48, 49]} delay={0.7} sway={5.2} className="top-[21.9px] left-[19.5px] w-[47px] -rotate-[9deg] md:left-[20.7px] md:w-[48.3px] md:-rotate-[8.83deg]" />
      <Icon enter={enter} src="/outside/code-box.svg" size={[54, 48]} delay={0.85} sway={6.4} className="top-[57.4px] left-[117px] w-[53.9px] -rotate-[3.5deg] md:top-[16.5px] md:left-[176.5px] md:rotate-0" />
      <Icon enter={enter} src="/outside/figma.svg" size={[38, 52]} delay={1} sway={4.6} className="top-[42.7px] left-[232.5px] w-[37.3px] rotate-[9.35deg] md:top-[65.7px] md:left-[252.6px] md:w-[38.2px] md:rotate-[8.98deg]" />
      <p className="absolute top-[122.5px] left-[26.5px] w-[290px] text-[15px] leading-[22px] font-bold text-fg">Always open on my desk</p>
    </div>
  );
}

export function OutsideTheBrowser() {
  const photo = useRef<HTMLDivElement>(null);
  const photoIn = useEnter(photo);

  return (
    <section className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">Outside the browser</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">The parts that do not fit in a project card.</p>
        </div>
      </Reveal>

      <div className="mt-[14px] flex flex-col gap-4 pt-3 md:mt-[47px] md:gap-5 md:pt-0">
        <div className="grid gap-4 md:grid-cols-[608fr_356fr] md:gap-5">
          <Pop tilt={-3} index={0}>
            <div ref={photo} className="relative h-[203px] overflow-hidden rounded-[23px] md:h-[360px]">
              <motion.div className="absolute inset-0" initial={{ scale: 1.22 }} animate={photoIn ? { scale: 1 } : undefined} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
                <Image src="/outside/photo.jpg" alt="Daaf, outside, in black and white" fill sizes="(min-width: 768px) 608px, 100vw" className="object-cover object-[50%_30%]" />
              </motion.div>
            </div>
          </Pop>

          <div className="flex flex-col gap-4 md:gap-5">
            <Pop tilt={4} delay={0.12} index={1}>
              <div className="relative h-[170px] overflow-hidden rounded-[23px] bg-[#d1ff00] font-bold text-bg">
                <div className="absolute top-[26px] left-7">
                  <RollingDigit to={6} />
                </div>
                <p className="absolute top-[116px] left-7 w-[290px] text-[15px] leading-[22px]">projects shipped so far</p>
              </div>
            </Pop>

            {/* The icons lie loose on the desk, each tilted a little. */}
            <Pop tilt={-4} delay={0.24} index={2}>
              <Desk />
            </Pop>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[484fr_480fr] md:gap-5">
          <Pop tilt={3} delay={0.1} index={3}>
            <div className="relative h-[240px] overflow-hidden rounded-[23px] bg-[#e19fff] text-bg">
              <p className="absolute top-[46px] left-9 w-[263px] font-blur text-[32px] leading-[42px] md:w-[400px]">
                <RiseWords text="If it is boring to build, it will be boring to use." delay={0.5} stagger={0.07} />
              </p>
              <p className="absolute top-[182px] left-9 text-[14px] font-medium md:top-[176px]">Something I keep telling myself</p>
            </div>
          </Pop>

          <Pop tilt={-3} delay={0.2} index={4}>
            <div className={`relative h-[240px] overflow-hidden rounded-[23px] ${DARK}`}>
              <p className="absolute top-[30.5px] left-[30.5px] flex items-center gap-2 text-[15px] font-bold text-[#8c8c8c]">
                <LiveDot />
                Right now
              </p>
              <p className="absolute top-[73.9px] left-[30.5px] w-[227px] text-[17px] leading-[26px] font-medium text-fg md:top-[64.5px] md:w-[416px]">
                Building a planning and management tool for <br className="hidden md:block" />
                Intermezzo Tilburg
              </p>
              <p className="absolute top-[178.5px] left-[30.5px] text-[13px] font-medium text-[#8c8c8c]">October 2026</p>
            </div>
          </Pop>
        </div>
      </div>
    </section>
  );
}
