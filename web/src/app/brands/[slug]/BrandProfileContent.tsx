"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  Users,
  Tree,
  PawPrint,
  Certificate,
  ArrowLeft,
  MagnifyingGlass,
  Star,
  ShieldCheck,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { BrandProfile, RatingTier } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function scoreToGrade(score: number) {
  const s = Math.round(score * 100);
  if (s >= 90) return { grade: "A", label: "Excellent", bg: "bg-emerald-500" };
  if (s >= 75) return { grade: "B", label: "Good", bg: "bg-emerald-400" };
  if (s >= 50) return { grade: "C", label: "Average", bg: "bg-amber-500" };
  if (s >= 25) return { grade: "D", label: "Poor", bg: "bg-orange-500" };
  return { grade: "F", label: "Avoid", bg: "bg-red-500" };
}

const tierConfig: Record<RatingTier, { color: string; bg: string }> = {
  Great: { color: "text-emerald-700", bg: "bg-emerald-50" },
  Good: { color: "text-emerald-600", bg: "bg-emerald-50" },
  "It's a Start": { color: "text-amber-700", bg: "bg-amber-50" },
  "Not Good Enough": { color: "text-orange-700", bg: "bg-orange-50" },
  "We Avoid": { color: "text-red-700", bg: "bg-red-50" },
};

function RatingCard({
  icon,
  label,
  rating,
}: {
  icon: React.ReactNode;
  label: string;
  rating: RatingTier | null;
}) {
  if (!rating) return null;
  const config = tierConfig[rating];
  return (
    <div className={`rounded-2xl ${config.bg} p-5`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className={`text-lg font-bold ${config.color}`}>{rating}</p>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function BrandProfileContent({ brand }: { brand: BrandProfile }) {
  const { grade, label, bg } = scoreToGrade(brand.brand_score);
  const score100 = Math.round(brand.brand_score * 100);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Back link */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-charcoal transition-colors mb-8"
          >
            <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
            All Brands
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10"
        >
          {/* Logo placeholder */}
          <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-stone-400">
              {brand.name.charAt(0)}
            </span>
          </div>

          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-charcoal tracking-tight">
              {brand.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-sm font-bold text-white px-3 py-1 rounded-full ${bg}`}
              >
                {grade} — {label}
              </span>
              <span className="text-sm text-stone-400">
                {score100}/100 sustainability score
              </span>
            </div>
          </div>
        </motion.div>

        {/* Score bar */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score100}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className={`h-full rounded-full ${bg}`}
            />
          </div>
        </motion.div>

        {/* Rating cards */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <RatingCard
            icon={<Users weight="bold" className="w-5 h-5 text-stone-400" />}
            label="Labor"
            rating={brand.labor_rating}
          />
          <RatingCard
            icon={<Tree weight="bold" className="w-5 h-5 text-stone-400" />}
            label="Environment"
            rating={brand.environment_rating}
          />
          <RatingCard
            icon={<PawPrint weight="bold" className="w-5 h-5 text-stone-400" />}
            label="Animal Welfare"
            rating={brand.animal_rating}
          />
        </motion.div>

        {/* Third-party data */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-stone-200 bg-white p-6 mb-10"
        >
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
            Third-Party Ratings
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {/* Good On You */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <Star weight="fill" className="w-3 h-3 text-amber-400" />
                Good On You
              </div>
              <p className="text-lg font-bold text-charcoal">
                {brand.good_on_you_rating != null
                  ? `${brand.good_on_you_rating}/5`
                  : "N/A"}
              </p>
            </div>

            {/* B Corp */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                <ShieldCheck weight="fill" className="w-3 h-3 text-emerald-500" />
                B Corp
              </div>
              <p
                className={`text-lg font-bold ${brand.bcorp_certified ? "text-emerald-600" : "text-stone-400"}`}
              >
                {brand.bcorp_certified ? "Certified" : "No"}
              </p>
            </div>

            {/* FTI */}
            <div>
              <div className="text-xs text-stone-400 mb-1">
                Fashion Transparency Index
              </div>
              <p className="text-lg font-bold text-charcoal">
                {brand.fti_score != null ? `${brand.fti_score}%` : "N/A"}
              </p>
            </div>

            {/* Remake */}
            <div>
              <div className="text-xs text-stone-400 mb-1">
                Remake Score
              </div>
              <p className="text-lg font-bold text-charcoal">
                {brand.remake_score != null
                  ? `${brand.remake_score}/100`
                  : "N/A"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        {brand.certifications.length > 0 && (
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-10"
          >
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Certifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {brand.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal bg-stone-50 border border-stone-200 px-3.5 py-1.5 rounded-full"
                >
                  <Certificate weight="fill" className="w-4 h-4 text-emerald-500" />
                  {cert}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Summary */}
        {brand.sustainability_summary && (
          <motion.div
            custom={6}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-stone-50 border border-stone-100 p-6 mb-10"
          >
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Sustainability Summary
            </h2>
            <p className="text-charcoal leading-relaxed">
              {brand.sustainability_summary}
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-3"
        >
          <Link
            href={`/analyze?q=${encodeURIComponent(brand.name)}`}
            className="inline-flex items-center gap-2 rounded-full bg-charcoal text-cream px-6 py-3 text-sm font-semibold hover:bg-charcoal/90 transition-colors"
          >
            <MagnifyingGlass weight="bold" className="w-4 h-4" />
            Analyze a {brand.name} product
          </Link>
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 text-charcoal px-6 py-3 text-sm font-semibold hover:bg-stone-50 transition-colors"
          >
            <Leaf weight="bold" className="w-4 h-4" />
            Compare brands
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
