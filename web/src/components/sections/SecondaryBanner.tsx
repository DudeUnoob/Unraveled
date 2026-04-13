"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export function SecondaryBanner() {
    return (
        <section className="w-full relative py-32 md:py-48 flex justify-center text-cream overflow-hidden">
            {/* Background Color & Texture */}
            <div className="absolute inset-0 bg-[#658896] z-0" /> {/* Using the Duna blue/sage tone */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply texture-woven z-0 pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.15] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 pointer-events-none mix-blend-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1000px] mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10"
            >
                {/* Pill */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full mb-6 font-sans text-[11px] font-semibold text-white flex items-center gap-2 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-[#D4F170] rounded-[1px]"></div>
                    Artificial Intelligence
                </div>

                {/* Headline */}
                <h2 className="font-sans font-normal text-[2.5rem] md:text-[3.5rem] leading-[1.1] tracking-[-0.05em] text-white mb-6 drop-shadow-sm">
                    Intelligence built for <br />conscious consumers.
                </h2>

                {/* Subheadline */}
                <p className="font-sans text-[15px] md:text-[17px] text-white/80 max-w-[600px] leading-relaxed mb-10 text-center">
                    Unravel&apos;s AI engine multiplies your conscious choices, not your budget. Accelerate brand discovery, track real garment lifespans, and uncover automated transparency.
                </p>

                {/* CTA */}
                <button className="px-6 py-2.5 bg-white text-charcoal rounded-full font-sans font-semibold text-[13px] flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                    Discover Unravel AI
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                </button>
            </motion.div>
        </section>
    );
}
