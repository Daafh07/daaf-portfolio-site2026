import { WorkExperience } from "@/components/experience/WorkExperience";
import { Contact } from "@/components/contact/Contact";
import { Hero } from "@/components/hero/Hero";
import { Introduction } from "@/components/introduction/Introduction";
import { IntroSequence } from "@/components/intro/IntroSequence";
import { HowICanHelp } from "@/components/services/HowICanHelp";
import { Statement } from "@/components/statement/Statement";
import { WhatIBuildWith } from "@/components/tools/WhatIBuildWith";
import { OutsideTheBrowser } from "@/components/outside/OutsideTheBrowser";
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
        <WorkExperience />
        <WhatIBuildWith />
        <OutsideTheBrowser />
        <Contact />
      </main>
    </>
  );
}
