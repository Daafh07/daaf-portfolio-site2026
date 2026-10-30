import { About } from "@/components/about/About";
import { WorkExperience } from "@/components/experience/WorkExperience";
import { Hero } from "@/components/hero/Hero";
import { Introduction } from "@/components/introduction/Introduction";
import { IntroSequence } from "@/components/intro/IntroSequence";
import { HowICanHelp } from "@/components/services/HowICanHelp";
import { Statement } from "@/components/statement/Statement";
import { WhatIBuildWith } from "@/components/tools/WhatIBuildWith";
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
        <WorkExperience />
        <WhatIBuildWith />
      </main>
    </>
  );
}
