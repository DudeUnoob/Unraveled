import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandsSection } from "@/components/home/BrandsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TelemetrySection } from "@/components/home/TelemetrySection";
import { FooterSection } from "@/components/home/FooterSection";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-between w-full overflow-hidden bg-cream text-charcoal selection:bg-rust/30">
      <Navbar />
      <HeroSection />
      <BrandsSection />
      <FeaturesSection />
      <TelemetrySection />
      <FooterSection />
    </main>
  );
}
