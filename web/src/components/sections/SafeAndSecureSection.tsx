"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, LockKey, FileDashed } from "@phosphor-icons/react";

export function SafeAndSecureSection() {
    return (
        <section className="w-full bg-[#f6f5f1] py-24 md:py-32 flex justify-center border-t border-charcoal/5">
            <div className="w-full max-w-[1200px] px-6 lg:px-0 flex flex-col md:flex-row justify-between items-center md:items-start gap-16">

                {/* Text Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-xl text-center md:text-left"
                >
                    <h2 className="font-sans font-medium tracking-tight text-4xl md:text-5xl text-charcoal mb-6">
                        Private by design.
                    </h2>
                    <p className="font-sans text-charcoal/70 text-lg leading-relaxed mb-8">
                        Your trust is our foundation. Unravel operates completely on-device, meaning your browsing history and shopping data never touch our servers. Visit our privacy center to learn how we protect consumers.
                    </p>

                    <button className="flex items-center justify-center md:justify-start gap-2 text-charcoal hover:text-rust font-sans text-sm font-semibold uppercase tracking-widest transition-colors group">
                        Explore our security
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                </motion.div>

                {/* Badges Block */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8"
                >
                    {/* Badge 1 */}
                    <div className="w-32 h-32 rounded-full border border-charcoal/10 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-charcoal shadow-sm">
                        <ShieldCheck weight="duotone" className="w-8 h-8 mb-2 opacity-80" />
                        <span className="font-mono text-xs font-bold tracking-widest">GDPR</span>
                    </div>

                    {/* Badge 2 */}
                    <div className="w-32 h-32 rounded-full border border-charcoal/10 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-charcoal shadow-sm">
                        <LockKey weight="duotone" className="w-8 h-8 mb-2 opacity-80" />
                        <span className="font-mono text-xs font-bold tracking-widest">E2E</span>
                    </div>

                    {/* Badge 3 */}
                    <div className="w-32 h-32 rounded-full border border-charcoal/10 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center text-charcoal shadow-sm">
                        <FileDashed weight="duotone" className="w-8 h-8 mb-2 opacity-80" />
                        <span className="font-mono text-xs font-bold tracking-widest text-center leading-tight">NO LOGS</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
