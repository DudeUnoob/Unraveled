"use client";

import { motion } from "framer-motion";

export function StatsSection() {
    return (
        <section className="w-full bg-white text-charcoal py-32 md:py-48 px-4 border-b border-charcoal/5">
            <div className="max-w-[1200px] mx-auto text-center md:text-left flex flex-col md:flex-row gap-16 lg:gap-32">

                {/* Left Column: Vision Statement */}
                <div className="md:w-[40%] flex flex-col justify-start">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="font-sans text-3xl sm:text-4xl leading-tight font-medium mb-6"
                    >
                        Designed for truth.<br />Built for the planet.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="font-sans text-charcoal/60 leading-relaxed max-w-sm mx-auto md:mx-0"
                    >
                        Unravel's intelligence platform is built to help consumers avoid greenwashing and buy timeless pieces, ending the fast fashion cycle.
                    </motion.p>
                </div>

                {/* Right Column: Oversized Stats */}
                <div className="md:w-[60%] flex flex-wrap gap-x-12 lg:gap-x-24 gap-y-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="font-sans text-6xl lg:text-8xl font-medium tracking-tighter">83%</span>
                        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Items rated unsustainable</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="font-sans text-6xl lg:text-8xl font-medium tracking-tighter">7x</span>
                        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Avg wears before discard</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col gap-2"
                    >
                        <span className="font-sans text-6xl lg:text-8xl font-medium tracking-tighter">$14.50</span>
                        <span className="font-mono text-xs uppercase tracking-widest text-charcoal/50">Avg fast-fashion CPW</span>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
