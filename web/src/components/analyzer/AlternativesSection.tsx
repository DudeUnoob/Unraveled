"use client";
import { useEffect } from "react";
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
  const { state, alternatives, fetchAlternatives } = useAlternatives();
  useEffect(() => {
    if (query) {
      fetchAlternatives(query, trendLabel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, trendLabel, fetchAlternatives]);
  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col mb-10">
        <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#5c6c47]">
            Better Alternatives
        </h3>
      </div>
      {state === "loading" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-forest-light/10 rounded-[15px] h-[400px] border border-[#5c6c47]/20" />
          ))}
        </div>
      )}
      {state === "error" && (
        <div className="p-8 rounded-[15px] bg-rust/5 border border-rust/10 text-center">
            <p className="font-serif text-lg font-medium text-rust/70">
                Could not load alternatives at this moment.
            </p>
        </div>
      )}
      {state === "success" && alternatives.length === 0 && (
        <div className="p-12 rounded-[15px] bg-forest-light/10 border border-[#5c6c47]/10 text-center">
            <p className="font-serif text-lg font-medium text-[#5c6c47]/60 italic">
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