"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Sparkle } from "@phosphor-icons/react";
import { useAlternatives } from "@/hooks/useAlternatives";
import { AlternativeCard } from "./AlternativeCard";

interface AlternativesSectionProps {
  query: string;
  trendLabel: string;
}

function getSubtitle(trendLabel: string): string {
  switch (trendLabel) {
    case "Dead":
    case "Fading":
      return "This trend is fading. Here are timeless pieces you'll actually keep wearing.";
    case "Timeless":
      return "Similar styles with strong sustainability scores.";
    default:
      return "Similar styles with better sustainability scores.";
  }
}

export function AlternativesSection({ query, trendLabel }: AlternativesSectionProps) {
  const { state, alternatives, error, fetchAlternatives } = useAlternatives();

  useEffect(() => {
    if (query) {
      fetchAlternatives(query, trendLabel);
    }
  }, [query, trendLabel, fetchAlternatives]);

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                    <Sparkle weight="bold" className="w-4 h-4 text-forest" />
                </div>
                <h3 className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                    Better Alternatives
                </h3>
            </div>
            <p className="font-sans text-xl font-bold text-charcoal/60 leading-tight max-w-xl">
                {getSubtitle(trendLabel)}
            </p>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-charcoal/20 uppercase tracking-widest">Powered by Sustainable Index</span>
        </div>
      </div>

      {state === "loading" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-forest-light/10 rounded-[2rem] h-96 border border-forest/5" />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="p-8 rounded-[2rem] bg-rust/5 border border-rust/10 text-center">
            <p className="font-sans text-sm font-medium text-rust/70">
                Could not load alternatives at this moment.
            </p>
        </div>
      )}

      {state === "success" && alternatives.length === 0 && (
        <div className="p-12 rounded-[2rem] bg-forest-light/10 border border-forest/5 text-center">
            <p className="font-sans text-sm font-medium text-charcoal/40 italic">
                No verified sustainable alternatives found for this specific category yet.
            </p>
        </div>
      )}

      {state === "success" && alternatives.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {alternatives.map((product, i) => (
            <AlternativeCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
