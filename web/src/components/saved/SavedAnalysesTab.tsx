"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark } from "@phosphor-icons/react";
import { SavedAnalysisCard } from "./SavedAnalysisCard";
import { useSavedAnalyses } from "@/hooks/useSavedAnalyses";
import Link from "next/link";

export function SavedAnalysesTab() {
  const { saved, loading, unsave } = useSavedAnalyses();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-stone-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
          <Bookmark weight="light" className="w-7 h-7 text-stone-400" />
        </div>
        <h3 className="text-lg font-semibold text-charcoal">No saved analyses yet</h3>
        <p className="mt-1 text-sm text-stone-500 max-w-sm">
          Run a trend analysis and click the bookmark icon to save it to your collection.
        </p>
        <Link
          href="/analyze"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal text-cream px-5 py-2.5 text-sm font-medium hover:bg-charcoal/90 transition-colors"
        >
          Try the Analyzer
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {saved.map((s) => (
          <SavedAnalysisCard key={s.id} analysis={s} onUnsave={unsave} />
        ))}
      </AnimatePresence>
    </div>
  );
}
