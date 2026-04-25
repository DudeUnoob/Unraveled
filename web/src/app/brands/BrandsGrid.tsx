"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BrandProfile, RatingTier } from "@/types/user";
import { Footer } from "@/components/layout/Footer";

const ASSETS = {
  imgMainBackground: "https://www.figma.com/api/mcp/asset/664fdd5e-c61e-44b8-a11b-29258aac1273",
  imgVector46: "https://www.figma.com/api/mcp/asset/062d9222-9772-4c4d-9d72-79d6687c59d6",
  imgImageBadge: "https://www.figma.com/api/mcp/asset/543d7ebd-b15f-409f-a360-25ac6834a738",
  imgStitchedBadge: "https://www.figma.com/api/mcp/asset/f44e6157-4c66-4183-8f16-e75eb92e382e",
  imgMainBadge: "https://www.figma.com/api/mcp/asset/c1036459-1e60-41d9-9efa-55cb0716966a",
  imgBrandLogo: "https://www.figma.com/api/mcp/asset/d136affe-e40e-44dc-9046-9f793ed25a99",
  imgBrandIcon: "https://www.figma.com/api/mcp/asset/908065be-2e9d-4d23-ac82-e5178258d2bf",
  imgBrandLogo1: "https://www.figma.com/api/mcp/asset/eeece263-adf2-4ac7-ae67-280deb5c1e22",
  imgBrandLogo2: "https://www.figma.com/api/mcp/asset/9980dddf-93a8-4e57-91fd-93fff49beeae",
  imgBrandIcon1: "https://www.figma.com/api/mcp/asset/00894b63-d0b7-4150-bcb5-ca9dce753bc8",
  imgBrandLogo3: "https://www.figma.com/api/mcp/asset/00102358-0bf5-4de6-b0ac-9ab8a0cb3490",
};

const BRAND_CATEGORIES: Record<string, string> = {
  patagonia: "OUTDOOR & PERFORMANCE",
  reformation: "FEMININE & SUSTAINABLE",
  everlane: "BASICS & TRANSPARENCY",
  "eileen-fisher": "LUXURY & CIRCULARITY",
  veja: "FOOTWEAR & ETHICS",
  "eco-step": "FOOTWEAR & SUSTAINABILITY",
  green: "FOOTWEAR & INNOVATION",
};

function ratingToScore(tier: RatingTier | null): string {
  switch (tier) {
    case "Great": return "5/5";
    case "Good": return "4/5";
    case "It's a Start": return "3/5";
    case "Not Good Enough": return "2/5";
    case "We Avoid": return "1/5";
    default: return "0/5";
  }
}

function scoreToGradeLabel(score: number): { grade: string; label: string; color: string } {
  const s = Math.round(score * 100);
  if (s >= 90) return { grade: "A", label: "Great", color: "bg-[#5c614d] text-[#f6fae1]" };
  if (s >= 75) return { grade: "B", label: "Good", color: "bg-[rgba(92,97,77,0.9)] text-[#f6fae1]" };
  if (s >= 50) return { grade: "C", label: "Average", color: "bg-[#9e422c] text-[#fff7f6]" };
  if (s >= 25) return { grade: "D", label: "Poor", color: "bg-[#9e422c] text-[#fff7f6]" };
  return { grade: "F", label: "Avoid", color: "bg-[#9e422c] text-[#fff7f6]" };
}

export function BrandsGrid({ brands }: { brands: BrandProfile[] }) {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Denim Background */}
      <div className="absolute top-[188px] left-1/2 -translate-x-1/2 w-[1417px] h-[2520px] pointer-events-none z-0">
        <img src={ASSETS.imgMainBackground} alt="" className="w-full h-full object-cover" />
      </div>

      <main className="relative z-10 pt-32 pb-20 max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-stix text-[48px] font-bold text-[#5c6c47] mb-4"
          >
            Brand Profiles
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-adamina text-[24px] text-[#5c6c47] max-w-4xl mx-auto leading-relaxed"
          >
            Data-backed sustainability ratings for major fashion brands. Aggregated from Good On You, B Corp, Fashion Transparency Index, and more.
          </motion.p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {brands.map((brand, i) => {
            const displayScore = 0.75 + brand.brand_score * 0.25;
            const { grade, label, color } = scoreToGradeLabel(displayScore);
            const category = BRAND_CATEGORIES[brand.slug] ?? "FASHION & APPAREL";
            
            return (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group block relative bg-[#f1e9c1] rounded-[20px] p-8 shadow-sm hover:shadow-md transition-all h-full"
                >
                  {/* Grade Badge */}
                  <div className={`absolute top-2.5 right-2.5 px-4 py-2 rounded-full font-stix font-bold text-[18px] z-10 ${color} shadow-sm`}>
                    {grade} - {label}
                  </div>

                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-6">
                      <h2 className="font-stix font-bold text-[30px] text-[#373313] tracking-tight leading-tight">
                        {brand.name}
                      </h2>
                      <p className="font-stix font-semibold text-[14px] text-[#65603c] tracking-[0.7px] uppercase mt-1">
                        {category}
                      </p>
                    </div>

                    {/* Ratings */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="bg-white/40 rounded-[16px] p-3 text-center">
                        <p className="font-manrope font-bold text-[10px] text-[#827b55] uppercase mb-1">ENV</p>
                        <p className="font-epilogue font-extrabold text-[20px] text-[#5c614d]">{ratingToScore(brand.environment_rating)}</p>
                      </div>
                      <div className="bg-white/40 rounded-[16px] p-3 text-center">
                        <p className="font-manrope font-bold text-[10px] text-[#827b55] uppercase mb-1">LABOR</p>
                        <p className="font-epilogue font-extrabold text-[20px] text-[#5c614d]">{ratingToScore(brand.labor_rating)}</p>
                      </div>
                      <div className="bg-white/40 rounded-[16px] p-3 text-center">
                        <p className="font-manrope font-bold text-[10px] text-[#827b55] uppercase mb-1">ANIMAL</p>
                        <p className="font-epilogue font-extrabold text-[20px] text-[#5c614d]">{ratingToScore(brand.animal_rating)}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {brand.bcorp_certified && (
                        <span className="bg-[#e5e4ca] px-3 py-1 rounded-full font-manrope font-bold text-[12px] text-[#52533f]">
                          B Corp
                        </span>
                      )}
                      {brand.certifications.slice(0, 3).map((cert) => (
                        <span key={cert} className="bg-[#e5e4ca] px-3 py-1 rounded-full font-manrope font-bold text-[12px] text-[#52533f]">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Decorative Assets */}
        <div className="absolute left-[-19px] top-[-26px] w-[120px] h-[120px] pointer-events-none rotate-[-22deg]">
          {/* Main Logo Icon or similar */}
        </div>
      </main>

      {/* CTA Section (Figma style) */}
      <section className="relative w-full mt-24">
        {/* Wavy Separator */}
        <div className="absolute top-0 left-0 right-0 w-full z-20 pointer-events-none -translate-y-[95%]">
          <img src={ASSETS.imgVector46} alt="" className="w-full h-auto" />
        </div>

        <div className="bg-[#5c6c47] pt-24 pb-32 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Badge Assets */}
          <div className="absolute left-[11px] top-[40px] w-[164px] h-[164px] opacity-40">
            <img src={ASSETS.imgImageBadge} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute left-[123px] top-[98px] w-[150px] h-[150px] opacity-30">
            <img src={ASSETS.imgStitchedBadge} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute left-[133px] top-0 w-[130px] h-[131px] opacity-40">
            <img src={ASSETS.imgMainBadge} alt="" className="w-full h-full object-contain" />
          </div>

          <div className="relative z-10 text-center px-4">
            <h2 className="font-serif font-semibold text-[80px] text-white tracking-wide mb-8">
              UNRAVELED
            </h2>
            <div className="font-serif font-bold text-[23px] text-white max-w-xl mx-auto mb-12 flex flex-col gap-1">
              <p>Empowering consumers with material truth.</p>
              <p>End the cycle of fast fashion.</p>
            </div>
            <Link 
              href="/extension-redirect" 
              className="inline-block bg-white text-[#5f6642] rounded-[30px] px-12 py-4 font-serif font-bold text-[24px] hover:bg-[#f6f5f1] transition-all"
            >
              Get Extension Now
            </Link>
          </div>

          {/* Right side badges */}
          <div className="absolute right-[42px] top-[157px] w-[230px] h-[230px] rotate-[57deg] opacity-20">
            <img src={ASSETS.imgImageBadge} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute right-[13px] bottom-[40px] w-[210px] h-[210px] rotate-[57deg] opacity-20">
            <img src={ASSETS.imgStitchedBadge} alt="" className="w-full h-full object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
}
