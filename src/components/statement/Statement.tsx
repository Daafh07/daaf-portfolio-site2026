import { Reveal } from "@/components/motion/Reveal";

// The one sentence that says what I stand for, in the heading font, with the last words in the
// pink of the first project. 984px wide on desktop (the same column as the sections around it).
export function Statement() {
  return (
    <section aria-label="Statement" className="mx-auto w-full max-w-[1032px] px-6 pb-24 md:pt-24 md:pb-48">
      <Reveal>
        <p className="font-blur text-[26px] leading-[34px] text-fg md:text-[36px] md:leading-[48px]">
          Most websites look like the template they came from. I would rather spend the extra week and make yours{" "}
          <span className="text-[#f9007e]">look like you.</span>
        </p>
      </Reveal>
    </section>
  );
}
