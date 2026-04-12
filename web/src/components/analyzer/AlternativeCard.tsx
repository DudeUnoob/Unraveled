"use client";

import { motion } from "framer-motion";
import { ArrowSquareOut, Leaf, Timer, Star } from "@phosphor-icons/react";
import type { AlternativeProduct } from "@/types/alternatives";

const gradeColors: Record<string, string> = {
  A: "#5c6c47",
  B: "#9fa586",
  C: "#D4883C",
  D: "#C84B31",
  F: "#991B1B",
};

interface AlternativeCardProps {
  product: AlternativeProduct;
  index: number;
}

export function AlternativeCard({ product, index }: AlternativeCardProps) {
  const gradeColor = gradeColors[product.sustainability_grade] ?? "#9fa586";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
      className="group relative bg-white/40 backdrop-blur-sm border border-forest/5 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] transition-all duration-500"
    >
      {/* Image with Zoom Effect */}
      <div className="relative w-full aspect-[4/5] bg-forest-light/5 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf weight="duotone" className="w-12 h-12 text-forest/10" />
          </div>
        )}

        {/* Floating Sustainability Badge */}
        <div className="absolute top-4 right-4 z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl border border-forest/5"
          >
             <span className="font-mono text-xl font-bold leading-none" style={{ color: gradeColor }}>
                {product.sustainability_grade}
             </span>
             <span className="font-sans text-[8px] font-bold text-charcoal/30 uppercase mt-0.5">
                Grade
             </span>
          </motion.div>
        </div>

        {/* Timeless Tag */}
        {product.is_timeless && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-forest/90 backdrop-blur-md text-cream rounded-full">
            <Timer weight="bold" className="w-3 h-3" />
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest">Timeless Pick</span>
          </div>
        )}
      </div>

      {/* Content Section - Gallery Style */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                {product.brand}
            </span>
            <div className="flex items-center gap-1">
                <Star weight="fill" className="w-3 h-3 text-forest" />
                <span className="font-mono text-[10px] font-bold text-forest">
                    {product.fiber_score.toFixed(0)}
                </span>
            </div>
        </div>

        <h4 className="font-sans text-lg font-bold text-charcoal leading-tight mb-4 group-hover:text-forest transition-colors duration-300">
          {product.name}
        </h4>

        <div className="mt-auto pt-6 border-t border-forest/5 flex items-center justify-between">
            <span className="font-mono text-lg font-medium text-charcoal tabular-nums">
                {product.currency === "USD" ? "$" : product.currency}
                {product.price.toFixed(0)}
            </span>

            <motion.a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 3 }}
                className="flex items-center gap-2 font-sans text-[10px] font-bold text-charcoal/40 hover:text-forest uppercase tracking-widest transition-colors duration-300"
            >
                View Product
                <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
            </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
