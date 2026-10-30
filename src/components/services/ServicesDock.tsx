"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { SERVICES, type Service } from "@/data/services";
import { insetStyle } from "@/components/projects/tileStyle";
import { sound } from "@/lib/sound/engine";

// The five things I make, as in the design: blobs in a row. On desktop they work like a dock:
// the one under the pointer grows (142px to 187px in Figma) and lifts, and its neighbours follow
// a little. Every item keeps a fixed place in the row, so the distance to the pointer stays
// steady while the blobs grow around it. On a phone it is a row that scrolls sideways, with the
// name under each blob.
const GROW = 187 / 142 - 1; // 31.7% bigger under the pointer
const LIFT = -32.5; // and this far up (the blob's centre goes from 129px to 96.5px)
const REACH = 240; // how far from the pointer a blob still reacts (px)

const PICKED = 0.65; // a picked blob stays this far grown, so a hover on another one still stands out

type DockProps = { picked: number | null; onPick: (index: number) => void };

function DockItem({ service, index, pointer, picked, onPick }: { service: Service; index: number; pointer: MotionValue<number> } & DockProps) {
  const slot = useRef<HTMLLIElement>(null);
  // 0 at rest, 1 right under the pointer; the closer the pointer, the bigger.
  const near = useTransform(pointer, (x) => {
    const box = slot.current?.getBoundingClientRect();
    if (!box) return 0;
    return Math.max(0, 1 - Math.abs(x - (box.left + box.width / 2)) / REACH) ** 1.3;
  });
  const chosen = useMotionValue(0);
  useEffect(() => chosen.set(picked === index ? PICKED : 0), [picked, index, chosen]);
  const reach = useTransform([near, chosen], ([a, b]: number[]) => Math.max(a, b));
  // A small bubble when the pointer arrives on this blob (each blob its own note).
  const arrived = useRef(false);
  useMotionValueEvent(near, "change", (value) => {
    const on = value > 0.7;
    if (on && !arrived.current) sound.play("dockHover", index / (SERVICES.length - 1));
    arrived.current = on;
  });
  const t = useSpring(reach, { stiffness: 320, damping: 28, mass: 0.7 });
  const scale = useTransform(t, (v) => 1 + GROW * v);
  const y = useTransform(t, (v) => LIFT * v);
  const [first, second] = service.lines;

  return (
    <li ref={slot} className="relative h-[250px] w-[142px] shrink-0">
      <button
        type="button"
        aria-pressed={picked === index}
        aria-label={service.name}
        data-glass-lens
        onClick={() => onPick(index)}
        className="absolute inset-0 cursor-pointer outline-offset-[-6px] focus-visible:outline-2 focus-visible:outline-fg"
      />
      <motion.div className="pointer-events-none absolute inset-x-0 top-[58px] h-[142px]" style={{ scale, y }}>
        <span className="absolute" style={insetStyle(service.inset)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative svg, sized by its box */}
          <img src={service.src} alt="" aria-hidden draggable={false} className="block size-full max-w-none select-none" />
        </span>
        <span
          className="absolute inset-0 flex flex-col items-center justify-center text-center font-blur leading-[0.92] text-bg"
          style={{ fontSize: service.size }}
        >
          <span>{first}</span>
          <span>{second}</span>
        </span>
      </motion.div>
    </li>
  );
}

export function ServicesDock({ picked, onPick }: DockProps) {
  const pointer = useMotionValue(-9999);
  return (
    <>
      <ul
        aria-label="What I make"
        className="mx-auto hidden w-fit items-start gap-[26px] md:flex"
        onPointerMove={(event) => event.pointerType === "mouse" && pointer.set(event.clientX)}
        onPointerLeave={() => pointer.set(-9999)}
      >
        {SERVICES.map((service, index) => (
          <DockItem key={service.name} service={service} index={index} pointer={pointer} picked={picked} onPick={onPick} />
        ))}
      </ul>

      <ul aria-label="What I make" className="-mx-6 flex snap-x gap-[14px] overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {SERVICES.map((service, index) => (
          <li key={service.name} className="w-[112px] shrink-0 snap-start">
            <button type="button" aria-pressed={picked === index} onClick={() => onPick(index)} className="block w-full cursor-pointer text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-fg">
            <div className={`relative h-[112px] transition-transform duration-300 ease-out ${picked === index ? "[transform:scale(1.08)]" : ""}`}>
              <span className="absolute" style={insetStyle(service.inset)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative svg, sized by its box */}
                <img src={service.src} alt="" aria-hidden draggable={false} className="block size-full max-w-none select-none" />
              </span>
              <span className="absolute inset-0 flex items-center justify-center font-blur text-[29px] leading-none text-bg">{service.word}</span>
            </div>
            <p className={`mt-[14px] text-center text-[13px] font-bold transition-colors duration-300 ${picked === index ? "text-fg" : "text-[#828282]"}`}>{service.name}</p>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
