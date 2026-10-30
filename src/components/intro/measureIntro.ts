import { STICKERS, WORDMARK, type Sticker } from "@/components/hero/stickers";
import { INTRO } from "./introConfig";

export type LetterGeometry = {
  char: string;
  index: number;
  count: number;
  /** Final position in the viewport: exactly where the hero letter sits. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Offset from the final position to the small word at the bottom (frame 19). */
  small: { x: number; y: number };
  /** Vertical overshoot while flying (frame 18). */
  overshootY: number;
};

export type StickerGeometry = Sticker & {
  /** Final box in the viewport, matching the hero sticker. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Offset from the final position to the scattered intro position. */
  scatterOffset: { x: number; y: number; rotate: number };
};

export type IntroGeometry = {
  fontSize: number;
  lineHeight: string;
  letters: LetterGeometry[];
  stickers: StickerGeometry[];
};

// FLIP: we read where the real hero elements are (First/Last), then the intro copies are drawn
// at that final spot and only animated with transforms (Invert/Play). That way the copies land
// pixel-perfect on the real heading and the hand-off is invisible.
export function measureIntro(): IntroGeometry | null {
  const wordmark = document.querySelector<HTMLElement>("[data-hero-wordmark]");
  const letterEls = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-letter]"));
  if (!wordmark || letterEls.length === 0) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const style = getComputedStyle(letterEls[0]);
  const fontSize = parseFloat(style.fontSize);

  // Final letter boxes, and the small word scaled down around its own top-left corner.
  const rects = letterEls.map((el) => el.getBoundingClientRect());
  const wordLeft = rects[0].left;
  const wordTop = Math.min(...rects.map((r) => r.top));
  const wordWidth = rects[rects.length - 1].right - wordLeft;
  const wordHeight = Math.max(...rects.map((r) => r.bottom)) - wordTop;
  const s = INTRO.intro.scale;
  const smallLeft = vw / 2 - (wordWidth * s) / 2;
  const smallTop = vh * (1 - INTRO.intro.bottom) - wordHeight * s;

  const letters = rects.map((r, index) => ({
    char: letterEls[index].textContent ?? "",
    index,
    count: rects.length,
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
    small: {
      x: smallLeft + (r.left - wordLeft) * s - r.left,
      y: smallTop + (r.top - wordTop) * s - r.top,
    },
    overshootY: fontSize * INTRO.fly.overshoot,
  }));

  return { fontSize, lineHeight: style.lineHeight, letters, stickers: measureStickers(wordmark) };
}

// Stickers are placed from the wordmark box, the same way the hero places them.
export function measureStickers(wordmark: HTMLElement): StickerGeometry[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const box = wordmark.getBoundingClientRect();
  const unit = box.width / WORDMARK.width;
  const portrait = vw < vh;

  return STICKERS.map((sticker) => {
    const cx = box.left + sticker.home.x * unit;
    const cy = box.top + sticker.home.y * unit;
    const scatter = portrait ? sticker.scatterPortrait : sticker.scatter;
    return {
      ...sticker,
      left: cx - (sticker.w * unit) / 2,
      top: cy - (sticker.h * unit) / 2,
      width: sticker.w * unit,
      height: sticker.h * unit,
      scatterOffset: {
        x: scatter.x * vw - cx,
        y: scatter.y * vh - cy,
        rotate: sticker.scatter.rotate,
      },
    };
  });
}
