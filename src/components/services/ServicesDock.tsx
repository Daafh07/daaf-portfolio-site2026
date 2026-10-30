"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { SERVICES, type Service } from "@/data/services";
import { insetStyle } from "@/components/projects/tileStyle";

// The five things I make, as in the design: blobs in a row. On desktop they work like a dock:
// the one under the pointer grows (142px to 187px in Figma) and lifts, and its neighbours follow
// a little. Every item keeps a fixed place in the row, so the distance to the pointer stays
// steady while the blobs grow around it. On a phone it is a row that scrolls sideways, with the
// name under each blob.
const GROW = 187 / 142 - 1; // 31.7% bigger under the pointer
const LIFT = -32.5; // and this far up (the blob's centre goes from 129px to 96.5px)
const REACH = 240; // how far from the pointer a blob still reacts (px)

function DockItem({ service, pointer }: { service: Service; pointer: MotionValue<number> }) {
  const slot = useRef<HTMLLIElement>(null);
  // 0 at rest, 1 right under the pointer; the closer the pointer, the bigger.
  const near = useTransform(pointer, (x) => {
    const box = slot.current?.getBoundingClientRect();
    if (!box) return 0;
    return Math.max(0, 1 - Math.abs(x - (box.left + box.width / 2)) / REACH) ** 1.3;
  });
  const t = useSpring(near, { stiffness: 320, damping: 28, mass: 0.7 });
  const scale = useTransform(t, (v) => 1 + GROW * v);
  const y = useTransform(t, (v) => LIFT * v);
  const [first, second] = service.lines;

  return (
    <li ref={slot} className="relative h-[250px] w-[142px] shrink-0">
      <motion.div className="absolute inset-x-0 top-[58px] h-[142px]" style={{ scale, y }}>
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

export function ServicesDock() {
  const pointer = useMotionValue(-9999);
  return (
    <>
      <ul
        aria-label="What I make"
        className="mx-auto hidden w-fit items-start gap-[26px] md:flex"
        onPointerMove={(event) => event.pointerType === "mouse" && pointer.set(event.clientX)}
        onPointerLeave={() => pointer.set(-9999)}
      >
        {SERVICES.map((service) => (
          <DockItem key={service.name} service={service} pointer={pointer} />
        ))}
      </ul>

      <ul aria-label="What I make" className="-mx-6 flex snap-x gap-[14px] overflow-x-auto px-6 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {SERVICES.map((service) => (
          <li key={service.name} className="w-[112px] shrink-0 snap-start">
            <div className="relative h-[112px]">
              <span className="absolute" style={insetStyle(service.inset)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- decorative svg, sized by its box */}
                <img src={service.src} alt="" aria-hidden draggable={false} className="block size-full max-w-none select-none" />
              </span>
              <span className="absolute inset-0 flex items-center justify-center font-blur text-[29px] leading-none text-bg">{service.word}</span>
            </div>
            <p className="mt-[14px] text-center text-[13px] font-bold text-[#828282]">{service.name}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
