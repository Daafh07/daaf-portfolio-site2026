import Image from "next/image";
import { STICKERS, WORDMARK } from "./stickers";

const NAME = "Daaf";
const pct = (value: number, total: number) => `${(value / total) * 100}%`;

// The real hero. It renders complete without JavaScript; the intro only animates on top of it
// and hides the elements marked data-intro-target while it plays.
export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[75svh] items-center justify-center overflow-hidden px-6 md:min-h-svh">
      <div
        data-hero-wordmark
        className="relative aspect-[531.375/241.236] w-full max-w-[max(531px,35.15vw)] [container-type:inline-size]"
      >
        <h1
          data-intro-target="heading"
          aria-label={NAME}
          className="absolute top-[19.96%] left-[8%] w-[87.13%] text-center font-blur text-[37.64cqw] leading-[0.96] whitespace-nowrap text-fg"
        >
          {Array.from(NAME).map((char, i) => (
            <span key={i} data-hero-letter aria-hidden className="inline-block">
              {char}
            </span>
          ))}
        </h1>

        {STICKERS.map((sticker) => (
          <Image
            key={sticker.id}
            data-intro-target="sticker"
            src={sticker.src}
            alt=""
            width={sticker.w}
            height={sticker.h}
            className="absolute h-auto select-none"
            style={{
              left: pct(sticker.home.x, WORDMARK.width),
              top: pct(sticker.home.y, WORDMARK.height),
              width: pct(sticker.w, WORDMARK.width),
              transform: `translate(-50%, -50%) rotate(${sticker.home.rotate}deg)`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
