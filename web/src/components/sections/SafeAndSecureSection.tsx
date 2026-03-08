"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, LockKey, FileDashed } from "@phosphor-icons/react";

export function SafeAndSecureSection() {
    return (
        <section className="w-full bg-[#f9f8f6] py-32 flex justify-center border-t border-charcoal/5">
            <div className="w-full max-w-[1000px] px-6 lg:px-0 flex flex-col md:flex-row justify-between items-center md:items-start gap-16">

                {/* Text Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-xl text-center md:text-left"
                >
                    <h2 className="font-sans font-medium tracking-tight text-3xl md:text-[2.25rem] text-charcoal mb-4">
                        Safe and secure
                    </h2>
                    <p className="font-sans text-charcoal/50 text-[14px] leading-relaxed mb-8 max-w-sm">
                        Your trust is our foundation. Unravel operates completely on-device, meaning your browsing history and shopping data never touch our servers. Visit our trust page and security center to learn more.
                    </p>

                    <button className="flex items-center justify-center md:justify-start gap-1.5 px-5 py-2 border border-charcoal/20 rounded-full font-sans text-[12px] font-semibold text-charcoal transition-colors hover:bg-charcoal/5 mx-auto md:mx-0">
                        Explore <ArrowRight weight="bold" className="w-3 h-3" />
                    </button>
                </motion.div>

                {/* Badges Block */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap justify-center md:justify-end gap-5"
                >
                    {/* Badge 1 */}
                    <div className="w-[100px] h-[100px] rounded-full border border-charcoal/10 bg-transparent flex flex-col items-center justify-center text-charcoal/80">
                        <span className="font-sans text-[11px] font-bold tracking-wider mb-1">AICPA</span>
                        <span className="font-sans text-[13px] font-bold tracking-tight">SOC2</span>
                    </div>

                    {/* Badge 2 */}
                    <div className="w-[100px] h-[100px] rounded-full border border-charcoal/10 bg-transparent flex flex-col items-center justify-center text-charcoal/80">
                        <ShieldCheck weight="fill" className="w-[45px] h-[45px] text-charcoal/20 absolute" />
                        <span className="font-sans text-[13px] font-bold tracking-widest z-10">GDPR</span>
                    </div>

                    {/* Badge 3 */}
                    <div className="w-[100px] h-[100px] rounded-full border border-charcoal/10 bg-transparent flex flex-col items-center justify-center text-charcoal/80 relative">
                        <LockKey weight="fill" className="w-[45px] h-[45px] text-charcoal/20 absolute" />
                        <span className="font-sans text-[11px] font-bold tracking-wider z-10 mb-0.5">ON</span>
                        <span className="font-sans text-[12px] font-bold tracking-tight z-10 leading-none">DEVICE</span>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
