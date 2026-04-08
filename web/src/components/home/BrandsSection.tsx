"use client";

import { motion } from "framer-motion";
import { ASSETS } from "./Assets";

const BRANDS = [
  { src: ASSETS.imgLevis, name: "Levis", h: "h-10 md:h-12" },
  { src: ASSETS.imgVector, name: "Zara", h: "h-6 md:h-8" },
  { src: ASSETS.imgVector1, name: "Patagonia", h: "h-4 md:h-6" },
  { src: ASSETS.imgRectangle49, name: "ASOS", h: "h-6 md:h-8" },
  { src: ASSETS.imgCalvinKlein, name: "Calvin Klein", h: "h-12 md:h-16" },
  { src: ASSETS.imgGap, name: "Gap", h: "h-10 md:h-12" },
  { src: ASSETS.imgLevis, name: "Levis", h: "h-10 md:h-12" },
];

export function BrandsSection() {
  return (
    <section className="w-full bg-white py-16 flex flex-col items-center justify-center relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-3xl md:text-4xl text-[#5f6642] mb-12 text-center"
      >
        Trusted by brands
      </motion.h2>

      <div className="w-full max-w-[1200px] flex items-center justify-center flex-wrap gap-8 md:gap-12 lg:gap-16 px-8">
        {BRANDS.map((brand, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="flex items-center justify-center"
          >
            <img
              src={brand.src}
              alt={brand.name}
              className={`${brand.h} w-auto object-contain`}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
