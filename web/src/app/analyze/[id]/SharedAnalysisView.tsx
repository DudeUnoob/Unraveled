"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TrendResults } from "@/components/analyzer/TrendResults";
import { ArrowRight, Asterisk } from "@phosphor-icons/react";
import type { TrendAnalysisResponse } from "@/types/analysis";

interface SharedAnalysisViewProps {
  data: TrendAnalysisResponse;
}

export function SharedAnalysisView({ data }: SharedAnalysisViewProps) {
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
                Shared Analysis
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-cream rounded-xl font-sans text-sm font-medium hover:bg-forest transition-colors"
              >
                Run your own analysis
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full flex-1 px-4 pb-20">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <TrendResults data={data} />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
