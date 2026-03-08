"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrendGalleryCard } from "@/components/gallery/TrendGalleryCard";
import { Asterisk, ArrowRight } from "@phosphor-icons/react";

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
    <main className="flex min-h-[100dvh] flex-col items-center w-full overflow-hidden bg-[#f6f5f1] text-charcoal selection:bg-rust/30">
      <Navbar />

      <section className="w-full pt-28 pb-8 px-4">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Asterisk weight="bold" className="w-3.5 h-3.5 text-charcoal/30" />
              <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-widest">
                Historical Analyses
              </span>
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal leading-[1.1] mb-3">
              Trend{" "}
              <span className="font-serif italic text-forest">Graveyard</span>
            </h1>
            <p className="font-sans text-base text-charcoal/45 max-w-xl leading-relaxed mb-8">
              What died, what&apos;s fading, and what&apos;s truly timeless. Browse past trend predictions powered by real search data.
            </p>

            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal text-cream rounded-xl font-sans text-sm font-medium hover:bg-forest transition-colors mb-10"
            >
              Analyze a trend
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="w-full flex-1 px-4 pb-20">
        <div className="max-w-[1100px] mx-auto">
          {analyses.length === 0 ? (
            <p className="font-sans text-sm text-charcoal/40 text-center py-20">
              No analyses yet. Be the first to analyze a trend.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      <Footer />
    </main>
  );
}
