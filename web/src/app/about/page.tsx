"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Asterisk, ChartLine, CurrencyDollar, Leaf, Database, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    }),
};

const dataSources = [
    { name: "Google Trends", type: "Search interest", usage: "Trend velocity & decay modeling" },
    { name: "TikTok", type: "Social signals", usage: "Virality detection & peak timing" },
    { name: "Pinterest", type: "Visual trends", usage: "Emerging style identification" },
    { name: "Good On You", type: "Brand ethics", usage: "Labor, environment, animal ratings" },
    { name: "B Corp Directory", type: "Certification", usage: "Verified sustainability practices" },
    { name: "Fashion Transparency Index", type: "Supply chain", usage: "Disclosure & accountability scoring" },
];

export default function AboutPage() {
    let sectionIndex = 0;

    return (
        <main className="flex min-h-[100dvh] flex-col items-center w-full overflow-hidden bg-[#f6f5f1] text-charcoal selection:bg-rust/30">
            <Navbar />

            {/* Hero */}
            <section className="w-full pt-28 pb-16 px-4">
                <div className="max-w-[900px] mx-auto">
                    <motion.div custom={sectionIndex++} initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="flex items-center gap-2 mb-6">
                            <Asterisk weight="bold" className="w-3.5 h-3.5 text-charcoal/30" />
                            <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-widest">
                                Methodology
                            </span>
                        </div>
                        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal leading-[1.1] mb-4">
                            How{" "}
                            <span className="font-serif italic text-forest">Unravel</span>{" "}
                            Works
                        </h1>
                        <p className="font-sans text-base sm:text-lg text-charcoal/50 max-w-2xl leading-relaxed">
                            We combine real-time search data, machine learning models, and sustainability
                            research to give you the full picture on any fashion trend — before you buy.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Trend Decay Model */}
            <section className="w-full py-12 px-4">
                <div className="max-w-[900px] mx-auto">
                    <motion.div custom={sectionIndex++} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                                <ChartLine weight="duotone" className="w-5 h-5 text-forest" />
                            </div>
                            <h2 className="font-sans text-xl font-semibold text-charcoal tracking-tight">
                                Trend Decay Model
                            </h2>
                        </div>
                        <div className="space-y-4 font-sans text-sm text-charcoal/60 leading-relaxed pl-[52px]">
                            <p>
                                We pull normalized search interest from Google Trends, cross-referenced with
                                TikTok engagement data and Pinterest search signals, to build a time-series of trend
                                velocity for any fashion keyword.
                            </p>
                            <p>
                                A <strong className="text-charcoal/80">logistic growth + exponential decay</strong> curve
                                is fit to the data. The model parameters (peak K, growth rate r, decay rate λ)
                                determine where a trend sits in its lifecycle.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                {[
                                    { label: "Timeless", desc: "Stable interest >1yr", color: "#2C4A3E" },
                                    { label: "Trending", desc: "Growing / near peak", color: "#7A9E8E" },
                                    { label: "Fading", desc: "Post-peak decline", color: "#D4883C" },
                                    { label: "Dead", desc: "Below viability", color: "#C84B31" },
                                ].map((phase) => (
                                    <div key={phase.label} className="p-3 rounded-xl border border-charcoal/[0.06] bg-white/50">
                                        <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: phase.color }}>
                                            {phase.label}
                                        </span>
                                        <span className="block font-sans text-xs text-charcoal/40">{phase.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Cost Per Wear */}
            <section className="w-full py-12 px-4">
                <div className="max-w-[900px] mx-auto">
                    <motion.div custom={sectionIndex++} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#D4883C]/10 flex items-center justify-center">
                                <CurrencyDollar weight="duotone" className="w-5 h-5 text-[#D4883C]" />
                            </div>
                            <h2 className="font-sans text-xl font-semibold text-charcoal tracking-tight">
                                Cost Per Wear
                            </h2>
                        </div>
                        <div className="space-y-4 font-sans text-sm text-charcoal/60 leading-relaxed pl-[52px]">
                            <p>
                                The standard Cost Per Wear formula divides the item price by the number
                                of times you&apos;ll realistically wear it:
                            </p>
                            <div className="p-4 rounded-xl bg-white/60 border border-charcoal/[0.06] font-mono text-sm text-charcoal/80">
                                <p><strong>Standard CPW</strong> = Price ÷ Standard Wears</p>
                                <p className="mt-2"><strong>Trend-Adjusted CPW</strong> = Price ÷ min(Standard Wears, Wears Per Week × Weeks Remaining)</p>
                            </div>
                            <p>
                                Standard wears are estimated per product category — a cotton tee gets ~30 wears,
                                jeans ~70, a jacket ~90. When an item is trending or fading, the trend-adjusted
                                CPW accounts for the risk that you&apos;ll stop wearing it before the fabric wears out.
                            </p>
                            <p>
                                We also generate a <strong className="text-charcoal/80">classic equivalent comparison</strong> — a
                                timeless alternative with full material lifespan — so you can see the true
                                cost difference between trendy and classic versions.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Sustainability Score */}
            <section className="w-full py-12 px-4">
                <div className="max-w-[900px] mx-auto">
                    <motion.div custom={sectionIndex++} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#2C4A3E]/10 flex items-center justify-center">
                                <Leaf weight="duotone" className="w-5 h-5 text-[#2C4A3E]" />
                            </div>
                            <h2 className="font-sans text-xl font-semibold text-charcoal tracking-tight">
                                Sustainability Score
                            </h2>
                        </div>
                        <div className="space-y-4 font-sans text-sm text-charcoal/60 leading-relaxed pl-[52px]">
                            <p>
                                Our sustainability score is a weighted composite of three features,
                                each contributing to an overall 0–100 score with A–F grading:
                            </p>
                            <div className="space-y-3 pt-1">
                                {[
                                    { label: "Fiber Composition", weight: "50%", desc: "Ranked by environmental impact — organic linen (0.95) to acrylic (0.20)" },
                                    { label: "Brand Reputation", weight: "30%", desc: "Aggregated from Good On You, B Corp, and Fashion Transparency Index" },
                                    { label: "Trend Longevity", weight: "20%", desc: "Timeless items score highest; dead trends score lowest" },
                                ].map((f) => (
                                    <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-charcoal/[0.06]">
                                        <span className="shrink-0 font-mono text-xs font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md">
                                            {f.weight}
                                        </span>
                                        <div>
                                            <span className="block font-sans text-sm font-medium text-charcoal">{f.label}</span>
                                            <span className="block font-sans text-xs text-charcoal/40 mt-0.5">{f.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 rounded-xl bg-white/60 border border-charcoal/[0.06] font-mono text-sm text-charcoal/80">
                                Score = (Fiber × 0.5 + Brand × 0.3 + Trend × 0.2) × 100
                            </div>
                            <p>
                                With the Chrome Extension installed, exact fiber compositions and brand ratings
                                are scraped from product pages. Without the extension, we estimate using
                                category defaults and the trend signal alone.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Data Sources */}
            <section className="w-full py-12 px-4">
                <div className="max-w-[900px] mx-auto">
                    <motion.div custom={sectionIndex++} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center">
                                <Database weight="duotone" className="w-5 h-5 text-charcoal/60" />
                            </div>
                            <h2 className="font-sans text-xl font-semibold text-charcoal tracking-tight">
                                Data Sources
                            </h2>
                        </div>
                        <div className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white/50">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-charcoal/[0.06]">
                                        <th className="px-5 py-3 font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">Source</th>
                                        <th className="px-5 py-3 font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hidden sm:table-cell">Type</th>
                                        <th className="px-5 py-3 font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">Usage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataSources.map((src) => (
                                        <tr key={src.name} className="border-b border-charcoal/[0.03] last:border-0">
                                            <td className="px-5 py-3 font-sans text-sm font-medium text-charcoal">{src.name}</td>
                                            <td className="px-5 py-3 font-mono text-xs text-charcoal/40 hidden sm:table-cell">{src.type}</td>
                                            <td className="px-5 py-3 font-sans text-xs text-charcoal/50">{src.usage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="w-full py-16 px-4">
                <div className="max-w-[900px] mx-auto">
                    <motion.div
                        custom={sectionIndex++}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        className="text-center"
                    >
                        <h2 className="font-sans text-2xl sm:text-3xl font-medium text-charcoal tracking-tight mb-4">
                            See it in action
                        </h2>
                        <p className="font-sans text-sm text-charcoal/45 mb-8 max-w-md mx-auto">
                            Enter any trend, product, or style keyword and get the full breakdown —
                            lifespan, cost per wear, and sustainability score.
                        </p>
                        <Link
                            href="/analyze"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-charcoal text-cream rounded-full font-sans text-sm font-medium hover:bg-forest transition-colors"
                        >
                            Try it yourself
                            <ArrowRight weight="bold" className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
