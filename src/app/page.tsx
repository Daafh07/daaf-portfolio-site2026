import { About } from "@/components/about/About";
import { Hero } from "@/components/hero/Hero";
import { Introduction } from "@/components/introduction/Introduction";
import { IntroSequence } from "@/components/intro/IntroSequence";
import { HowICanHelp } from "@/components/services/HowICanHelp";
import { Statement } from "@/components/statement/Statement";
import { SelectedProjects } from "@/components/projects/SelectedProjects";

export default function Home() {
  return (
    <>
      <IntroSequence />
      <main>
        <Hero />
        <Introduction />
        <SelectedProjects />
        <HowICanHelp />
        <Statement />
        <About />
      </main>
    </>
  );
}
