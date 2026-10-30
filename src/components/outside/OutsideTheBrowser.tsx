import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

// "Outside the browser": a bento of five tiles. On desktop two rows (a photo and two tiles on the
// right, then two tiles); on a phone they are stacked. Each tile is placed as in the design.
const DARK = "border-[1.5px] border-[#363636] bg-[#161616]";

export function OutsideTheBrowser() {
  return (
    <section className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">Outside the browser</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">The parts that do not fit in a project card.</p>
        </div>
      </Reveal>

      <Reveal className="mt-[14px] md:mt-[47px]">
        <div className="flex flex-col gap-4 pt-3 md:gap-5 md:pt-0">
          <div className="grid gap-4 md:grid-cols-[608fr_356fr] md:gap-5">
            <div className="relative h-[203px] overflow-hidden rounded-[23px] md:h-[360px]">
              <Image src="/outside/photo.jpg" alt="Daaf, outside, in black and white" fill sizes="(min-width: 768px) 608px, 100vw" className="object-cover object-[50%_30%]" />
            </div>

            <div className="flex flex-col gap-4 md:gap-5">
              <div className="relative h-[170px] overflow-hidden rounded-[23px] bg-[#d1ff00] font-bold text-bg">
                <p className="absolute top-[26px] left-7 text-[64px] leading-none">6</p>
                <p className="absolute top-[116px] left-7 w-[290px] text-[15px] leading-[22px]">projects shipped so far</p>
              </div>

              {/* The icons lie loose on the desk, each tilted a little. */}
              <div className={`relative h-[170px] overflow-hidden rounded-[23px] ${DARK}`}>
                {/* eslint-disable @next/next/no-img-element -- small decorative artwork at its own size */}
                <img src="/outside/vs-code.svg" alt="" aria-hidden width={48} height={49} className="absolute top-[21.9px] left-[19.5px] w-[47px] -rotate-[9deg] md:left-[20.7px] md:w-[48.3px] md:-rotate-[8.83deg]" />
                <img src="/outside/code-box.svg" alt="" aria-hidden width={54} height={48} className="absolute top-[57.4px] left-[117px] w-[53.9px] -rotate-[3.5deg] md:top-[16.5px] md:left-[176.5px] md:rotate-0" />
                <img src="/outside/figma.svg" alt="" aria-hidden width={38} height={52} className="absolute top-[42.7px] left-[232.5px] w-[37.3px] rotate-[9.35deg] md:top-[65.7px] md:left-[252.6px] md:w-[38.2px] md:rotate-[8.98deg]" />
                {/* eslint-enable @next/next/no-img-element */}
                <p className="absolute top-[122.5px] left-[26.5px] w-[290px] text-[15px] leading-[22px] font-bold text-fg">Always open on my desk</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[484fr_480fr] md:gap-5">
            <div className="relative h-[240px] overflow-hidden rounded-[23px] bg-[#e19fff] text-bg">
              <p className="absolute top-[46px] left-9 w-[263px] font-blur text-[32px] leading-[42px] md:w-[400px]">If it is boring to build, it will be boring to use.</p>
              <p className="absolute top-[182px] left-9 text-[14px] font-medium md:top-[176px]">Something I keep telling myself</p>
            </div>

            <div className={`relative h-[240px] overflow-hidden rounded-[23px] ${DARK}`}>
              <p className="absolute top-[30.5px] left-[30.5px] text-[15px] font-bold text-[#8c8c8c]">Right now</p>
              <p className="absolute top-[73.9px] left-[30.5px] w-[227px] text-[17px] leading-[26px] font-medium text-fg md:top-[64.5px] md:w-[416px]">
                Building a planning and management tool for <br className="hidden md:block" />
                Intermezzo Tilburg
              </p>
              <p className="absolute top-[178.5px] left-[30.5px] text-[13px] font-medium text-[#8c8c8c]">October 2026</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
