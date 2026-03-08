"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
    const container = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Subtle parallax on the background image
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(".hero-bg", {
                yPercent: 20,
                ease: "none",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                }
            });
        }, container);
        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={container}
            className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center px-4 overflow-hidden bg-[#f6f5f1]"
        >
            {/* Immersive Painted Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img
                    src="/background_2.avif"
                    alt="Pastoral oil painting landscape"
                    className="hero-bg w-full h-[120%] object-cover scale-105 origin-top"
                />
                {/* Fade to base color starting higher up to make text legible */}
                <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-[#f6f5f1] via-[#f6f5f1]/90 to-transparent z-10" />
            </div>

            {/* Duna-inspired Centered Content */}
            <div ref={contentRef} className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center mt-[15vh] md:mt-[25vh]">

                {/* Pill Update Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 bg-charcoal/60 backdrop-blur-md border border-white/10 text-cream px-4 py-1.5 rounded-full font-sans text-[13px] font-medium mb-6 cursor-pointer hover:bg-charcoal/80 transition-colors shadow-sm"
                >
                    <span>Unravel Engine v2.0 Live</span>
                    <ArrowRight weight="bold" className="w-3 h-3" />
                </motion.div>

                {/* Massive Centered Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans text-[3rem] sm:text-[3.75rem] md:text-[4.25rem] lg:text-[4.75rem] leading-[1] tracking-[-0.06em] text-charcoal mb-8"
                    style={{ fontWeight: 400 }}
                >
                    The new standard<br />in material truth
                </motion.h1>

                {/* Clean Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans text-[1.15rem] md:text-[1.35rem] text-charcoal/60 max-w-[640px] leading-[1.4] mb-12 tracking-tight"
                >
                    Meet the data-native platform that accelerates ethical sourcing, automates supply chain audits, and uncovers the real cost of micro-trends.
                </motion.p>

                {/* Single Primary CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link href="/analyze">
                        <MagneticButton
                            strength={0.1}
                            className="px-8 py-3.5 bg-charcoal text-cream rounded-full font-sans font-medium text-[15px] transition-transform hover:bg-charcoal/90"
                        >
                            Get started
                        </MagneticButton>
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
