import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustedBySection } from "@/components/sections/TrustedBySection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ProductJourney } from "@/components/sections/ProductJourney";
import { SecondaryBanner } from "@/components/sections/SecondaryBanner";
import { SafeAndSecureSection } from "@/components/sections/SafeAndSecureSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-between w-full overflow-hidden bg-[#f6f5f1] text-charcoal selection:bg-rust/30">
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <StatsSection />
      <ProductJourney />
      <SecondaryBanner />
      <SafeAndSecureSection />
      <NewsSection />
      <Footer />
    </main>
  );
}
