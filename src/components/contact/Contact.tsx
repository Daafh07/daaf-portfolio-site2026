import { LiveDot } from "@/components/motion/LiveDot";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { RiseWords } from "@/components/motion/RiseWords";
import { CONTACT } from "@/data/contact";
import { ClosingWordmark } from "./ClosingWordmark";
import { ContactButton } from "./ContactButton";

// "Let's build something": when I am free, what to send, and three ways to reach me. Under it the
// closing wordmark. This is where "Contact" in the menu and the button under the projects lead.
export function Contact() {
  return (
    <section id="contact" className="mx-auto w-full max-w-[1032px] px-6">
      <Reveal>
        <div className="mx-auto w-full max-w-[530px]">
          <p className="flex items-center gap-2 text-[14px] font-medium text-[#969696]">
            <LiveDot />
            Open for new projects from December
          </p>
          <h2 className="mt-[14px] text-[22px] font-bold text-fg md:mt-[13px]">
            <RiseWords text="Let’s build something" delay={0.1} />
          </h2>
          <p className="mt-[14px] text-[15px] font-bold text-sub md:mt-5">Tell me what you have in mind, even if it is still a mess.</p>
          <p className="mt-[14px] text-[15px] leading-[25px] font-medium text-sub md:mt-[27px]">
            I take on a few projects at a time, next to my job and my own products. Send me a short message with what you want to make and who it is for, and I will tell you honestly whether I am the right person for it.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-[10px] md:mt-9">
            <Magnetic>
              <ContactButton kind="email" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </ContactButton>
            </Magnetic>
            <Magnetic>
              <ContactButton kind="linkedin" href={CONTACT.linkedin || undefined}>
                LinkedIn
              </ContactButton>
            </Magnetic>
            <Magnetic>
              <ContactButton kind="instagram" href={CONTACT.instagram || undefined}>
                Instagram
              </ContactButton>
            </Magnetic>
          </div>
        </div>
      </Reveal>

      {/* The closing wordmark, as big as the design has it (200px; on a phone it fills the width). */}
      <div className="pt-16 pb-16 [container-type:inline-size] md:pt-[155px] md:pb-[138px]">
        <ClosingWordmark />
      </div>
    </section>
  );
}
