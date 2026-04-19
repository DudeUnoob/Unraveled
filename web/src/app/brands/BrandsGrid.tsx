"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import type { BrandProfile } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";

function scoreToLabel(score: number): string {
  const s = Math.round(score * 100);
  if (s >= 90) return "Excellent";
  if (s >= 75) return "Good";
  if (s >= 50) return "Average";
  if (s >= 25) return "Poor";
  return "Avoid";
}

function scoreToPillBg(score: number): string {
  const s = Math.round(score * 100);
  if (s >= 75) return "bg-[#5c6c47]";
  if (s >= 50) return "bg-[#8a7c4e]";
  return "bg-[#2e2d2d]";
}

export function BrandsGrid({ brands }: { brands: BrandProfile[] }) {
  return (
    <main className="flex min-h-[100dvh] flex-col w-full overflow-hidden bg-cream text-charcoal selection:bg-forest/30">
      <Navbar />

      {/* Hero header */}
      <section className="w-full pt-32 pb-4 px-8 md:px-16 bg-cream">
        <div className="max-w-[1280px] mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-[48px] leading-tight text-forest-dark mb-3"
          >
            Brand Profiles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-drama text-[24px] not-italic text-forest-dark max-w-[1047px] leading-snug"
          >
            Data-backed sustainability ratings for major fashion brands.
            Aggregated from Good On You, B Corp, Fashion Transparency Index, and more.
          </motion.p>
        </div>
      </section>

      {/* Sky scene */}
      <div className="relative w-full">
        {/* Sky background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/gallery/sky-bg.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Top wave */}
        <img
          src="/gallery/wave-top.png"
          alt=""
          className="relative z-10 w-full pointer-events-none select-none"
          style={{ marginTop: -8 }}
        />

        {/* Brand card grid */}
        <section className="relative z-10 w-full px-8 md:px-[114px] pb-0">
          <div className="max-w-[1280px] mx-auto">
            {brands.length === 0 ? (
              <p className="font-sans text-sm text-white/70 text-center py-20">
                No brand profiles available yet.
              </p>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                style={{ columnGap: 104, rowGap: 51 }}
              >
                {brands.map((brand, i) => (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <Link href={`/brands/${brand.slug}`} className="block">
                      <BrandCard brand={brand} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bottom grass */}
        <img
          src="/gallery/grass-bottom.png"
          alt=""
          className="relative z-10 w-full pointer-events-none select-none mt-8"
        />
      </div>

      {/* CTA */}
      <section className="w-full bg-cream px-8 md:px-16 py-16">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <h2 className="font-serif font-bold text-[48px] leading-tight text-forest-dark text-center md:text-left">
            Ready to analyze a trend?
          </h2>
          <Link
            href="/analyze"
            className="group flex items-center gap-4 bg-forest text-white rounded-[30px] hover:bg-forest-dark transition-colors"
            style={{ paddingLeft: 30, paddingRight: 16, height: 55 }}
          >
            <span className="font-serif font-medium text-[30px] whitespace-nowrap">
              Analyze a trend
            </span>
            <div className="w-[38px] h-[38px] flex items-center justify-center">
              <ArrowRight
                weight="bold"
                className="w-6 h-6 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <div className="relative w-full mt-auto">
        <img
          src="/analyze/footer-wave.png"
          alt=""
          className="w-full h-auto min-h-[120px] object-cover object-top"
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
              className="inline-block bg-white text-forest-dark font-sans font-bold text-[24px] px-10 py-4 rounded-[30px] hover:bg-cream transition-colors"
            >
              Get Extension Now
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
  const scoreLabel = scoreToLabel(brand.brand_score);
  const pillBg = scoreToPillBg(brand.brand_score);
  const score = Math.round(brand.brand_score * 100);

  const isMuted = scoreLabel === "Poor" || scoreLabel === "Avoid";

  return (
    <div
      className={`${isMuted ? "bg-[#a0a784]" : "bg-[#a0a784]"} rounded-[30px] shadow-[0px_4px_5.5px_0px_rgba(0,0,0,0.25)] flex flex-col text-white border-[14px] border-solid border-white/25`}
      style={{ width: 280, height: 286 }}
    >
      {/* Score badge — top */}
      <div className="pt-5 px-5 flex items-center justify-between">
        <span className="font-serif text-[18px] opacity-80">{score}/100</span>
        {brand.bcorp_certified && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
            B Corp
          </span>
        )}
      </div>

      {/* Brand name — center, grows */}
      <div className="flex-1 flex items-center justify-center px-5 py-2">
        <h3 className="font-serif font-bold text-[26px] leading-tight text-center capitalize line-clamp-3">
          {brand.name}
        </h3>
      </div>

      {/* Status + pill — bottom */}
      <div className="pb-5 px-5 flex items-center justify-between">
        <span className="font-serif text-[20px]">{scoreLabel}</span>
        <div
          className={`${pillBg} rounded-[20px] flex items-center justify-center`}
          style={{ height: 38, width: 116 }}
        >
          <span className="font-serif text-[16px] text-white">View profile</span>
        </div>
      </div>
    </div>
  );
}
