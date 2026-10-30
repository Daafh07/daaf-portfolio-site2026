import { Reveal } from "@/components/motion/Reveal";
import { ProcessAccordion } from "./ProcessAccordion";
import { ServicesDock } from "./ServicesDock";

// "How I can help": what I make (the dock) and how I work (the four steps).
export function HowICanHelp() {
  return (
    <section id="services" className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">How I can help</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">Let’s turn an idea into something people remember.</p>
        </div>
      </Reveal>

      <Reveal className="mt-6 md:mt-9">
        <ServicesDock />
      </Reveal>

      <Reveal className="mt-4 md:mt-[60px]">
        <ProcessAccordion />
      </Reveal>
    </section>
  );
}
