import { Hero } from "@/components/hero/Hero";
import { Introduction } from "@/components/introduction/Introduction";
import { IntroSequence } from "@/components/intro/IntroSequence";

export default function Home() {
  return (
    <>
      <IntroSequence />
      <main>
        <Hero />
        <Introduction />
      </main>
    </>
  );
}
