import { BlobButton } from "@/components/BlobButton";
import { PhotoFan } from "./PhotoFan";

// The section right after the hero: the photo fan and a short introduction.
// "More" and "Work experience" point at sections that are not built yet.
export function Introduction() {
  return (
    <section id="introduction" className="overflow-x-clip pb-24">
      <PhotoFan />
      <div className="mx-auto mt-14 w-full max-w-[443px] px-6 md:mt-[78px] md:px-0">
        <h2 className="text-[22px] font-bold text-fg">Hi, I’m Daaf.</h2>
        <p className="mt-4 text-[15px] font-bold text-sub">
          I’m a creative developer and designer who enjoys building digital experiences with a strong visual
          identity.
        </p>
        <p className="mt-[1.5em] text-[15px] font-bold text-sub">
          I combine design, interaction and code to create websites that feel personal, clear and a little
          unexpected.
        </p>
        <div className="mt-[18px] flex flex-wrap gap-3 md:mt-7">
          <BlobButton href="#about" className="min-w-[100px]">
            More
          </BlobButton>
          <BlobButton href="#experience">Work experience</BlobButton>
        </div>
      </div>
    </section>
  );
}
