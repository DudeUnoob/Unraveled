"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, TrendUp, ChartLine, Skull } from "@phosphor-icons/react";

interface TrendGalleryCardProps {
  id: string;
  queryText: string;
  label: string;
  weeksRemaining: number;
  confidence: number;
  createdAt: string;
  index: number;
}

const labelConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  Timeless: { color: "#2C4A3E", bg: "#2C4A3E15", icon: Clock },
  Trending: { color: "#7A9E8E", bg: "#7A9E8E15", icon: TrendUp },
  Fading: { color: "#D4883C", bg: "#D4883C15", icon: ChartLine },
  Dead: { color: "#C84B31", bg: "#C84B3115", icon: Skull },
};

export function TrendGalleryCard({
  id,
  queryText,
  label,
  weeksRemaining,
  confidence,
  createdAt,
  index,
}: TrendGalleryCardProps) {
  const config = labelConfig[label] ?? labelConfig.Trending;
  const Icon = config.icon;
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusText =
    label === "Timeless"
      ? "Enduring"
      : label === "Dead"
        ? "Flatlined"
        : `${weeksRemaining}w remaining`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group"
    >
      <Link
        href={`/analyze/${id}`}
        className="block p-5 bg-white border border-charcoal/[0.08] rounded-2xl hover:border-charcoal/[0.15] hover:shadow-sm transition-all duration-300"
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
            style={{ color: config.color, backgroundColor: config.bg }}
          >
            <Icon weight="fill" className="w-3 h-3" />
            {label}
          </span>
          <span className="font-mono text-[10px] text-charcoal/30">{date}</span>
        </div>

        <h3 className="font-sans text-base font-semibold text-charcoal capitalize leading-snug mb-2 line-clamp-2">
          {queryText}
        </h3>

        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-charcoal/40">{statusText}</span>
          <span className="font-sans text-xs font-medium text-charcoal/30 group-hover:text-charcoal/60 transition-colors flex items-center gap-1">
            View
            <ArrowRight weight="bold" className="w-3 h-3" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
