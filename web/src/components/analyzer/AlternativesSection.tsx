"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, SpinnerGap } from "@phosphor-icons/react";
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
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Leaf weight="duotone" className="w-4 h-4 text-forest" />
          <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest">
            Better alternatives
          </h3>
        </div>
        <p className="font-sans text-sm text-charcoal/40 leading-relaxed">
          {getSubtitle(trendLabel)}
        </p>
      </div>

      {state === "loading" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-charcoal/[0.04] rounded-2xl h-72" />
          ))}
        </div>
      )}

      {state === "error" && (
        <p className="font-sans text-sm text-charcoal/40">
          Could not load alternatives. {error}
        </p>
      )}

      {state === "success" && alternatives.length === 0 && (
        <p className="font-sans text-sm text-charcoal/40">
          No alternatives found for this category yet.
        </p>
      )}

      {state === "success" && alternatives.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alternatives.map((product, i) => (
            <AlternativeCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
