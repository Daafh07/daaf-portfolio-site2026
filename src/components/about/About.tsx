import { Reveal } from "@/components/motion/Reveal";

const STORY = [
  "I started by changing things on a page just to see what would happen, and I never really stopped. Curiosity became design, design became code, and now I do both in the same week.",
  "HBO ICT taught me how things work under the hood. On my own I added the other half: how it looks, and whether the person on the other side actually understands it.",
  "Now I build front and back end at MijnLabtest, with a few products of my own running next to it. Next I want bigger projects where I do both halves, from first sketch to live.",
];

// Each fact is a small label and a value; a value can run over two lines.
const FACTS: { label: string; value: string[] }[] = [
  { label: "Based in", value: ["The Netherlands"] },
  { label: "Works in", value: ["Design and code"] },
  { label: "Studying", value: ["ICT, HBO bachelor"] },
  { label: "Now", value: ["Full-stack developer at MijnLabtest"] },
  { label: "Next to that", value: ["Teamleader PLUS supermarket,", "Founder Internetneeds"] },
];

// "How I got here": the story in three short paragraphs, and the facts next to it (under it on a
// phone). This is where "More" in the introduction and "About" in the menu lead.
export function About() {
  return (
    <section id="about" className="mx-auto w-full max-w-[1032px] px-6 pb-24">
      <Reveal>
        <div className="mx-auto w-full max-w-[443px]">
          <h2 className="text-[22px] font-bold text-fg">How I got here</h2>
          <p className="mt-4 text-[15px] font-bold text-sub md:mt-5">The short version, for people who like context.</p>
        </div>
      </Reveal>

      <Reveal className="mt-[14px] md:mt-[59px]">
        <div className="flex flex-col gap-9 md:flex-row md:gap-[94px]">
          <div className="flex flex-col gap-5 text-[15px] leading-[25px] font-medium text-sub md:w-[530px] md:shrink-0">
            {STORY.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="md:w-[360px] md:shrink-0">
            {FACTS.map((fact, index) => (
              <div key={fact.label} className={`flex flex-col gap-[6px] ${index === 0 ? "pb-[18px]" : "py-[18px]"} ${index < FACTS.length - 1 ? "border-b border-[#363636]" : ""}`}>
                <dt className="text-[13px] font-medium text-[#8c8c8c]">{fact.label}</dt>
                <dd className="text-[15px] leading-[22px] font-bold text-fg">
                  {fact.value.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}
