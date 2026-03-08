"use client";

import { motion } from "framer-motion";
import { ArrowSquareOut, Leaf, Timer } from "@phosphor-icons/react";
import type { AlternativeProduct } from "@/types/alternatives";

const gradeColors: Record<string, string> = {
  A: "#2C4A3E",
  B: "#7A9E8E",
  C: "#D4883C",
  D: "#C84B31",
  F: "#991B1B",
};

interface AlternativeCardProps {
  product: AlternativeProduct;
  index: number;
}

export function AlternativeCard({ product, index }: AlternativeCardProps) {
  const gradeColor = gradeColors[product.sustainability_grade] ?? "#7A9E8E";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white border border-charcoal/[0.08] rounded-2xl overflow-hidden hover:border-charcoal/[0.15] hover:shadow-sm transition-all duration-300"
    >
      {/* Image */}
      {product.image_url ? (
        <div className="relative w-full aspect-square bg-charcoal/[0.03] overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full aspect-square bg-charcoal/[0.03] flex items-center justify-center">
          <Leaf weight="duotone" className="w-10 h-10 text-charcoal/15" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="font-sans text-[10px] font-semibold text-charcoal/40 uppercase tracking-widest mb-1">
          {product.brand}
        </p>
        <h4 className="font-sans text-sm font-semibold text-charcoal leading-snug mb-2 line-clamp-2">
          {product.name}
        </h4>

        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-sm font-semibold text-charcoal tabular-nums">
            {product.currency === "USD" ? "$" : product.currency}
            {product.price.toFixed(0)}
          </span>
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
            style={{ backgroundColor: gradeColor }}
          >
            {product.sustainability_grade}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium text-charcoal/50 bg-charcoal/[0.05]">
            Fiber: {product.fiber_score.toFixed(0)}
          </span>
        </div>

        {product.is_timeless && (
          <div className="flex items-center gap-1 mb-3">
            <Timer weight="fill" className="w-3 h-3 text-forest" />
            <span className="font-sans text-[10px] font-semibold text-forest uppercase tracking-wider">
              Timeless pick
            </span>
          </div>
        )}

        <a
          href={product.product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-charcoal/60 hover:text-charcoal transition-colors"
        >
          Shop Now
          <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
