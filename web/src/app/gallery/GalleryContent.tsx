"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendGalleryCard } from "@/components/gallery/TrendGalleryCard";
import { ArrowRight } from "@phosphor-icons/react";

interface AnalysisRow {
  id: string;
  query_text: string;
  trend_lifespan: {
    label: string;
    weeks_remaining: number;
    confidence: number;
  };
  created_at: string;
}

interface GalleryContentProps {
  analyses: AnalysisRow[];
}

export function GalleryContent({ analyses }: GalleryContentProps) {
  return (
    <main className="flex min-h-[100dvh] flex-col w-full overflow-hidden bg-cream text-charcoal selection:bg-forest/30">
      {/* ── Hero header ── */}
      <section className="w-full pt-32 pb-4 px-8 md:px-16 bg-cream">
        <div className="max-w-[1280px] mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif font-bold text-[48px] leading-tight text-forest-dark mb-3"
          >
            Trend Graveyard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-drama text-[24px] not-italic text-forest-dark max-w-[1047px] leading-snug"
          >
            What died, what&apos;s fading, and what&apos;s truly timeless.
            Browse past trend predictions powered by real search data.
          </motion.p>
        </div>
      </section>

      {/* ── Sky scene: wave + cards + grass ── */}
      <div className="relative w-full">
        {/* Sky photo fills the entire scene */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/gallery/sky-bg.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Top wave/grass — overlaps the sky, providing the top-of-scene grass edge */}
        <img
          src="/gallery/wave-top.png"
          alt=""
          className="relative z-10 w-full pointer-events-none select-none"
          style={{ marginTop: -8 }}
        />

        {/* Card grid */}
        <section className="relative z-10 w-full px-8 md:px-[114px] pb-0">
          <div className="max-w-[1280px] mx-auto">
            {analyses.length === 0 ? (
              <p className="font-sans text-sm text-white/70 text-center py-20">
                No analyses yet. Be the first to analyze a trend.
              </p>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                style={{ columnGap: 104, rowGap: 51 }}
              >
                {analyses.map((a, i) => (
                  <TrendGalleryCard
                    key={a.id}
                    id={a.id}
                    queryText={a.query_text}
                    label={a.trend_lifespan.label}
                    weeksRemaining={a.trend_lifespan.weeks_remaining}
                    confidence={a.trend_lifespan.confidence}
                    createdAt={a.created_at}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Bottom grass/vegetation — bottom of the scene */}
        <img
          src="/gallery/grass-bottom.png"
          alt=""
          className="relative z-10 w-full pointer-events-none select-none mt-8"
        />
      </div>

      {/* ── CTA: Ready to analyze ── */}
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

      {/* ── Footer ── */}
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
          {/* Decorative stars */}
          <img
            src="/analyze/star-blue.png"
            className="absolute bottom-10 right-10 w-32 h-auto hidden md:block opacity-80"
            alt=""
          />
          <img
            src="/analyze/star-green.png"
            className="absolute bottom-24 right-32 w-24 h-auto hidden md:block opacity-80"
            alt=""
          />
          <img
            src="/analyze/star-orange.png"
            className="absolute bottom-10 left-10 w-28 h-auto hidden md:block opacity-80"
            alt=""
          />
          <img
            src="/analyze/star-green.png"
            className="absolute bottom-32 left-32 w-20 h-auto hidden md:block opacity-80"
            alt=""
          />
        </div>
      </div>
    </main>
  );
}

