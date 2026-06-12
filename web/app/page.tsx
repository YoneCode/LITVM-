import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/sections/Hero";
import { Narrative } from "@/components/sections/Narrative";
import { Features } from "@/components/sections/Features";
import { Preview } from "@/components/sections/Preview";
import { Trust } from "@/components/sections/Trust";
import { UseCases } from "@/components/sections/UseCases";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Narrative />
        <Features />
        <Preview />
        <Trust />
        <UseCases />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
