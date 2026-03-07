"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ArrowRight } from "@phosphor-icons/react";

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
                    src="file:///Users/dam_kamani/.gemini/antigravity/brain/2b4eaffc-f27a-4347-b751-bca39ee4f5a3/painted_landscape_hero_1772914744540.png"
                    alt="Pastoral oil painting landscape"
                    className="hero-bg w-full h-[120%] object-cover scale-105"
                />
                {/* Fade to white at the bottom to blend into the next section cleanly like Duna */}
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#f6f5f1] to-transparent z-10" />
            </div>

            {/* Duna-inspired Centered Content */}
            <div ref={contentRef} className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center mt-24">

                {/* Pill Update Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 bg-charcoal/40 backdrop-blur-md border border-white/20 text-cream px-4 py-1.5 rounded-full font-sans text-xs font-medium mb-8 cursor-pointer hover:bg-charcoal/60 transition-colors"
                >
                    <span>Unravel Engine v2.0 Live</span>
                    <ArrowRight weight="bold" className="w-3 h-3" />
                </motion.div>

                {/* Massive Centered Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans text-[3.5rem] sm:text-[5rem] md:text-[6.5rem] leading-[0.95] tracking-tight text-charcoal mb-6 drop-shadow-sm"
                    style={{ fontWeight: 500 }}
                >
                    The new standard<br />in material truth
                </motion.h1>

                {/* Clean Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="font-sans text-lg md:text-xl text-charcoal/80 max-w-2xl leading-relaxed mb-10"
                >
                    Meet the data-native platform that accelerates ethical sourcing, automates supply chain audits, and uncovers the real cost of micro-trends.
                </motion.p>

                {/* Single Primary CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <MagneticButton
                        strength={0.1}
                        className="px-8 py-4 bg-charcoal text-white rounded-full font-sans font-medium text-lg hover:scale-105 transition-transform"
                    >
                        Get started
                    </MagneticButton>
                </motion.div>

            </div>
        </section>
    );
}
