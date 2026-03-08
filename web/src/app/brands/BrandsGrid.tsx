"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, ArrowRight } from "@phosphor-icons/react";
import type { BrandProfile } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function scoreToGrade(score: number): { grade: string; label: string; color: string } {
  const s = Math.round(score * 100);
  if (s >= 90) return { grade: "A", label: "Excellent", color: "bg-emerald-100 text-emerald-800" };
  if (s >= 75) return { grade: "B", label: "Good", color: "bg-emerald-50 text-emerald-700" };
  if (s >= 50) return { grade: "C", label: "Average", color: "bg-amber-100 text-amber-800" };
  if (s >= 25) return { grade: "D", label: "Poor", color: "bg-orange-100 text-orange-800" };
  return { grade: "F", label: "Avoid", color: "bg-red-100 text-red-800" };
}

const tierColors: Record<string, string> = {
  Great: "text-emerald-600",
  Good: "text-emerald-500",
  "It's a Start": "text-amber-600",
  "Not Good Enough": "text-orange-600",
  "We Avoid": "text-red-600",
};

export function BrandsGrid({ brands }: { brands: BrandProfile[] }) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-charcoal tracking-tight">
            Brand Profiles
          </h1>
          <p className="mt-3 text-stone-500 text-lg max-w-2xl">
            Data-backed sustainability ratings for major fashion brands.
            Aggregated from Good On You, B Corp, Fashion Transparency Index, and
            more.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {brands.map((brand, i) => {
            const { grade, label, color } = scoreToGrade(brand.brand_score);
            return (
              <motion.div
                key={brand.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/brands/${brand.slug}`}
                  className="group block rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-charcoal">
                        {brand.name}
                      </h2>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${color}`}>
                          {grade} — {label}
                        </span>
                        <span className="text-xs text-stone-400">
                          {Math.round(brand.brand_score * 100)}/100
                        </span>
                      </div>
                    </div>
                    {brand.bcorp_certified && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
                        B Corp
                      </span>
                    )}
                  </div>

                  {/* Rating chips */}
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {brand.environment_rating && (
                      <span>
                        <span className="text-stone-400">Env: </span>
                        <span className={`font-semibold ${tierColors[brand.environment_rating] ?? "text-stone-600"}`}>
                          {brand.environment_rating}
                        </span>
                      </span>
                    )}
                    {brand.labor_rating && (
                      <span>
                        <span className="text-stone-400">Labor: </span>
                        <span className={`font-semibold ${tierColors[brand.labor_rating] ?? "text-stone-600"}`}>
                          {brand.labor_rating}
                        </span>
                      </span>
                    )}
                    {brand.animal_rating && (
                      <span>
                        <span className="text-stone-400">Animal: </span>
                        <span className={`font-semibold ${tierColors[brand.animal_rating] ?? "text-stone-600"}`}>
                          {brand.animal_rating}
                        </span>
                      </span>
                    )}
                  </div>

                  {brand.certifications.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {brand.certifications.slice(0, 3).map((cert) => (
                        <span
                          key={cert}
                          className="flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full"
                        >
                          <Leaf weight="fill" className="w-2.5 h-2.5 text-emerald-500" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-charcoal/60 group-hover:text-charcoal transition-colors">
                    View full profile
                    <ArrowRight weight="bold" className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
