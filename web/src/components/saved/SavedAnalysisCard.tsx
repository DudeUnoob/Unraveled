"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, ArrowRight } from "@phosphor-icons/react";
import type { SavedAnalysis } from "@/types/user";

const trendColors: Record<string, string> = {
  Timeless: "bg-emerald-100 text-emerald-800",
  Trending: "bg-amber-100 text-amber-800",
  Fading: "bg-orange-100 text-orange-800",
  Dead: "bg-red-100 text-red-800",
};

interface Props {
  analysis: SavedAnalysis;
  onUnsave: (analysisId: string) => void;
}

export function SavedAnalysisCard({ analysis, onUnsave }: Props) {
  const colorClass = trendColors[analysis.trend_label ?? ""] ?? "bg-stone-100 text-stone-700";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="group relative rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <button
        onClick={() => onUnsave(analysis.analysis_id)}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
        title="Remove from saved"
      >
        <Bookmark weight="fill" className="w-4 h-4 text-charcoal" />
      </button>

      <div className="pr-8">
        <h3 className="font-semibold text-charcoal text-base capitalize leading-snug">
          {analysis.query_text}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          {analysis.trend_label && (
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${colorClass}`}>
              {analysis.trend_label}
            </span>
          )}
          <span className="text-xs text-stone-400">
            Saved {new Date(analysis.saved_at).toLocaleDateString()}
          </span>
        </div>

        {analysis.notes && (
          <p className="mt-2 text-sm text-stone-500 line-clamp-2">{analysis.notes}</p>
        )}
      </div>

      <Link
        href={`/analyze/${analysis.analysis_id}`}
        className="mt-4 flex items-center gap-1.5 text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors"
      >
        View full analysis
        <ArrowRight weight="bold" className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
