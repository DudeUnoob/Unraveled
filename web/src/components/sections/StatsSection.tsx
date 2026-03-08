"use client";

import { motion } from "framer-motion";
import { TrendUp, ShieldCheck, MinusCircle } from "@phosphor-icons/react";

export function StatsSection() {
    return (
        <section className="w-full bg-[#f6f5f1] text-charcoal py-24 px-4 bg-white border-b border-charcoal/5">
            <div className="max-w-[1000px] mx-auto flex flex-col pt-12 pb-12">

                {/* Top: Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="font-sans text-[2.5rem] md:text-[4rem] tracking-tight font-medium leading-[1.05] mb-20"
                >
                    Designed for truth.<br />Built to scale.
                </motion.h2>

                {/* Middle: Huge Numbers Row */}
                <div className="flex flex-wrap md:flex-nowrap gap-x-12 md:gap-x-20 gap-y-12 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="flex flex-col gap-2.5 min-w-[180px]"
                    >
                        <span className="font-sans text-[4.5rem] lg:text-[6.5rem] font-medium tracking-tighter leading-none">83%</span>
                        <span className="font-sans text-[15px] font-medium text-charcoal/60 tracking-tight">Items rated unsustainable</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col gap-2.5 min-w-[180px]"
                    >
                        <span className="font-sans text-[4.5rem] lg:text-[6.5rem] font-medium tracking-tighter leading-none">7x</span>
                        <span className="font-sans text-[15px] font-medium text-charcoal/60 tracking-tight">Avg wears before discard</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col gap-2.5 min-w-[180px]"
                    >
                        <span className="font-sans text-[4.5rem] lg:text-[6.5rem] font-medium tracking-tighter leading-none">65%</span>
                        <span className="font-sans text-[15px] font-medium text-charcoal/60 tracking-tight">Shopping efficiency</span>
                    </motion.div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-charcoal/[0.05] mb-16" />

                {/* Bottom: Feature Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {/* Feature 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col"
                    >
                        <div className="w-10 h-10 mb-6 text-charcoal">
                            <TrendUp weight="light" className="w-full h-full" />
                        </div>
                        <h3 className="font-sans text-[15px] font-medium text-charcoal mb-3">Uncover reality</h3>
                        <p className="font-sans text-[13px] leading-relaxed text-charcoal/60">
                            Unravel's platform is built to help consumers see past greenwashing. Optimized to eliminate marketing fiction and instantly deliver transparent tracking.
                        </p>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-col border-t pt-8 md:pt-0 md:border-t-0 md:border-l border-charcoal/[0.08] md:pl-8"
                    >
                        <div className="w-10 h-10 mb-6 text-charcoal">
                            <ShieldCheck weight="light" className="w-full h-full" />
                        </div>
                        <h3 className="font-sans text-[15px] font-medium text-charcoal mb-3">Future-proof style</h3>
                        <p className="font-sans text-[13px] leading-relaxed text-charcoal/60">
                            A powerful data engine translates sustainability metrics into simple insights, enabling the industry's most detailed consumer wardrobe analysis.
                        </p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col border-t pt-8 md:pt-0 md:border-t-0 md:border-l border-charcoal/[0.08] md:pl-8"
                    >
                        <div className="w-10 h-10 mb-6 text-charcoal">
                            <MinusCircle weight="light" className="w-full h-full" />
                        </div>
                        <h3 className="font-sans text-[15px] font-medium text-charcoal mb-3">Reduce waste</h3>
                        <p className="font-sans text-[13px] leading-relaxed text-charcoal/60">
                            Eliminate impulse buys, endless returns, and low-quality fabrics by automating material checks with intelligent AI processing.
                        </p>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
