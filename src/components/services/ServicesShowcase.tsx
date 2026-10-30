"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SERVICES } from "@/data/services";
import { sound } from "@/lib/sound/engine";
import { ServicePanel } from "./ServicePanel";
import { ServicesDock } from "./ServicesDock";

// The dock and, under it, the panel of the blob that was picked. A second click on the same blob
// puts it away again. The panel keeps showing the last pick while it closes, so it never empties.
export function ServicesShowcase() {
  const [picked, setPicked] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const pick = (index: number) => {
    const next = picked === index ? null : index;
    setPicked(next);
    sound.play(next === null ? "dockPut" : "dockPick", index / (SERVICES.length - 1));
    if (next !== null) setShown(next);
  };

  return (
    <>
      <ServicesDock picked={picked} onPick={pick} />
      <div
        className={`grid transition-[grid-template-rows] duration-[800ms] ease-[cubic-bezier(0.45,0,0.15,1)] motion-reduce:transition-none ${picked === null ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
      >
        <div className="overflow-hidden" inert={picked === null}>
          <motion.div
            key={shown}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="pt-6 md:pt-0"
          >
            <ServicePanel service={SERVICES[shown]} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
