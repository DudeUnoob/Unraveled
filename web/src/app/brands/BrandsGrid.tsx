"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import type { BrandProfile, RatingTier } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";

// Figma asset — denim texture background
const DENIM_BG = "https://www.figma.com/api/mcp/asset/623b2d93-690e-4507-a3ad-ea9f0464896b";
const FOOTER_WAVE = "https://www.figma.com/api/mcp/asset/ce120e3b-e6a5-4ae4-aecb-923b28dc08c2";

function tierToScore(tier: RatingTier | null): number | null {
  if (!tier) return null;
  const map: Record<RatingTier, number> = {
    Great: 5,
    Good: 4,
    "It's a Start": 3,
    "Not Good Enough": 2,
    "We Avoid": 1,
  };
  return map[tier] ?? null;
}

function gradeInfo(score: number): { label: string; bg: string } {
  const s = Math.round(score * 100);
  if (s >= 90) return { label: "A - Great", bg: "#5c614d" };
  if (s >= 75) return { label: "B - Good", bg: "#5c614d" };
  if (s >= 60) return { label: "B - Very Good", bg: "#5c614d" };
  if (s >= 50) return { label: "C - Average", bg: "#9e422c" };
  if (s >= 25) return { label: "D - Poor", bg: "#9e422c" };
  return { label: "F - Avoid", bg: "#9e422c" };
}

function scoreColor(score: number): string {
  return score >= 3 ? "#5c614d" : "#9e422c";
}

export function BrandsGrid({ brands }: { brands: BrandProfile[] }) {
  return (
    <main className="flex min-h-[100dvh] flex-col w-full overflow-hidden bg-cream text-charcoal">
      <Navbar />

      {/* Hero — cream background */}
      <section className="w-full pt-32 pb-8 px-8 bg-cream">
        <div className="max-w-[1280px] mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-[48px] leading-tight text-forest-dark tracking-tight"
          >
            Brand Profiles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-drama text-[24px] not-italic text-forest-dark max-w-[965px] mx-auto leading-snug mt-2"
          >
            Data-backed sustainability ratings for major fashion brands. Aggregated from Good On You, B Corp, Fashion Transparency Index, and more.
          </motion.p>
        </div>
      </section>

      {/* Denim background section */}
      <div className="relative w-full flex-1">
        {/* Denim texture fills entire section */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={DENIM_BG}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Card grid */}
        <div className="relative z-10 w-full px-8 md:px-[87px] pt-12 pb-16">
          <div className="max-w-[1200px] mx-auto">
            {brands.length === 0 ? (
              <p className="font-sans text-sm text-white/70 text-center py-20">
                No brand profiles available yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                {brands.map((brand, i) => (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.01, y: -3 }}
                  >
                    <Link href={`/brands/${brand.slug}`} className="block">
                      <BrandCard brand={brand} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer wave + UNRAVELED */}
      <div className="relative w-full">
        <img
          src={FOOTER_WAVE}
          alt=""
          className="w-full h-auto min-h-[60px] object-cover object-top"
        />
        <div className="bg-forest w-full pb-20 pt-8 relative overflow-hidden">
          <div className="max-w-[800px] mx-auto text-center text-white relative z-10">
            <h2 className="font-serif text-5xl md:text-[80px] font-bold mb-4 tracking-wide">
              UNRAVELED
            </h2>
            <p className="font-sans font-bold text-xl md:text-[23px] max-w-[600px] mx-auto leading-tight mb-8">
              Empowering consumers with material truth.
              <br />
              End the cycle of fast fashion.
            </p>
            <a
              href="/extension-redirect"
              className="inline-flex items-center gap-3 bg-white text-forest-dark font-sans font-bold text-[24px] px-10 py-4 rounded-[30px] hover:bg-cream transition-colors"
            >
              Get Extension Now
              <ArrowRight weight="bold" className="w-5 h-5" />
            </a>
          </div>
          <img src="/analyze/star-blue.png" className="absolute bottom-10 right-10 w-32 h-auto hidden md:block opacity-80" alt="" />
          <img src="/analyze/star-green.png" className="absolute bottom-24 right-32 w-24 h-auto hidden md:block opacity-80" alt="" />
          <img src="/analyze/star-orange.png" className="absolute bottom-10 left-10 w-28 h-auto hidden md:block opacity-80" alt="" />
          <img src="/analyze/star-green.png" className="absolute bottom-32 left-32 w-20 h-auto hidden md:block opacity-80" alt="" />
        </div>
      </div>
    </main>
  );
}

function BrandCard({ brand }: { brand: BrandProfile }) {
  const { label: gradeLabel, bg: gradeBg } = gradeInfo(brand.brand_score);
  const envScore = tierToScore(brand.environment_rating);
  const laborScore = tierToScore(brand.labor_rating);
  const animalScore = tierToScore(brand.animal_rating);

  return (
    <div className="bg-[#f1e9c1] rounded-[20px] overflow-hidden relative flex flex-col gap-6 p-8">
      {/* Grade pill — top right */}
      <div
        className="absolute top-[10px] right-[14px] px-4 py-2 rounded-full shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
        style={{ backgroundColor: gradeBg }}
      >
        <span className="font-serif font-bold text-[#f6fae1] text-[18px] leading-7 whitespace-nowrap">
          {gradeLabel}
        </span>
      </div>

      {/* Brand name + category */}
      <div className="flex flex-col pr-28">
        <h2
          className="font-serif font-bold text-[#373313] text-[30px] leading-9 tracking-[-0.75px]"
        >
          {brand.name}
        </h2>
        {brand.description && (
          <span className="font-serif font-semibold text-[#65603c] text-[14px] tracking-[0.7px] uppercase leading-5 mt-0.5">
            {brand.description.length > 30
              ? brand.description.slice(0, 30).toUpperCase()
              : brand.description.toUpperCase()}
          </span>
        )}
      </div>

      {/* ENV / LABOR / ANIMAL score modules */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "ENV", score: envScore },
          { label: "LABOR", score: laborScore },
          { label: "ANIMAL", score: animalScore },
        ].map(({ label, score }) => (
          <div
            key={label}
            className="bg-white/60 rounded-[16px] p-3 flex flex-col items-center gap-[3.5px]"
          >
            <span
              className="font-sans font-bold text-[#827b55] text-[10px] uppercase tracking-wide text-center"
            >
              {label}
            </span>
            <span
              className="font-sans font-extrabold text-[20px] leading-7 text-center"
              style={{ color: score !== null ? scoreColor(score) : "#827b55" }}
            >
              {score !== null ? `${score}/5` : "–"}
            </span>
          </div>
        ))}
      </div>

      {/* Certifications */}
      {brand.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {brand.certifications.slice(0, 4).map((cert) => (
            <span
              key={cert}
              className="bg-[#e5e4ca] text-[#52533f] font-sans font-bold text-[12px] leading-4 px-3 py-1 rounded-full whitespace-nowrap"
            >
              {cert}
            </span>
          ))}
          {brand.bcorp_certified && !brand.certifications.includes("B Corp") && (
            <span className="bg-[#e5e4ca] text-[#52533f] font-sans font-bold text-[12px] leading-4 px-3 py-1 rounded-full whitespace-nowrap">
              B Corp
            </span>
          )}
        </div>
      )}
    </div>
  );
}
