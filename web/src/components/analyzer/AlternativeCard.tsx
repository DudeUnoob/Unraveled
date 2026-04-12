"use client";
import { motion } from "framer-motion";
import { Leaf, } from "@phosphor-icons/react";
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
      className="group relative border-[3px] border-[#5c6c47] rounded-[15px] overflow-visible flex flex-col w-full h-[400px] transition-all duration-500 hover:-translate-y-2 bg-[#f4f6ec]"
    >
      {/* Image Section */}
      <div className="relative w-full h-[300px] overflow-hidden rounded-t-[12px]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-forest/5">
            <Leaf weight="duotone" className="w-12 h-12 text-forest/20" />
          </div>
        )}
      </div>
      {/* Info Section (Light Green Bottom) */}
      <div className="absolute bottom-2 left-3 right-3 h-[85px] bg-[rgba(220,226,197,0.9)] rounded-[15px] shadow-sm flex flex-col justify-center px-4 z-10 backdrop-blur-sm border border-white/20">
        <h4 className="font-serif text-xl font-bold text-[#5c6c47] truncate pr-16">
          {product.name || "Clothing Item"}
        </h4>
        <span className="font-serif text-sm text-[#5c6c47] uppercase tracking-widest mt-1 truncate pr-16">
          {product.brand || "BRAND"}
        </span>
      </div>
      {/* Overlapping Score Badge */}
      <div className="absolute -right-3 bottom-0 z-20">
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center w-[76px] h-[76px] rounded-full shadow-md border-2 border-white"
            style={{ backgroundColor: `${gradeColor}20`, backdropFilter: 'blur(4px)' }}
        >
             <span className="font-serif text-3xl font-bold leading-none mt-1" style={{ color: gradeColor }}>
                {product.sustainability_score?.toFixed(0) || 85}
             </span>
             <span className="font-serif text-sm font-medium mt-1" style={{ color: gradeColor }}>
                {product.sustainability_grade || "B"}
             </span>
        </motion.div>
      </div>
      {/* Hidden Link Overlay */}
      <a 
        href={product.product_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute inset-0 z-30"
        aria-label={`View ${product.name}`}
      />
    </motion.div>
  );
}