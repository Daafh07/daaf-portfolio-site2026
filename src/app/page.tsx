import { GlassCursor } from "@/components/GlassCursor";
import { Hero } from "@/components/hero/Hero";
import { IntroSequence } from "@/components/intro/IntroSequence";

export default function Home() {
  return (
    <>
      <IntroSequence />
      <GlassCursor />
      <main>
        <Hero />
      </main>
    </>
  );
}
