"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function SecondaryBanner() {
    return (
        <section className="w-full bg-[#f6f5f1] pb-24 md:pb-32 px-4 md:px-12 lg:px-24 flex justify-center">

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[1200px] bg-sage rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
                {/* Subtle texture overlay for premium feel */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="bg-charcoal/10 border border-charcoal/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-8 font-mono text-xs uppercase tracking-widest text-charcoal/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-charcoal"></span>
                    Extension
                </div>

                <h2 className="font-sans font-medium text-4xl md:text-5xl lg:text-[4rem] leading-tight text-charcoal max-w-2xl mb-12 tracking-tight">
                    Intelligence built for conscious consumers.
                </h2>

                <MagneticButton
                    strength={0.2}
                    className="group px-8 py-4 bg-charcoal text-cream rounded-[1.5rem] font-sans font-semibold text-lg hover:text-white inline-flex items-center transition-colors shadow-lg shadow-charcoal/20"
                >
                    <span>Install for Chrome</span>
                    <ArrowUpRight weight="bold" className="w-5 h-5 ml-2 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </MagneticButton>

            </motion.div>

        </section>
    );
}
