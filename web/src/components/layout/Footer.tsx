"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Asterisk } from "@phosphor-icons/react";
import { MagneticButton } from "@/components/ui/MagneticButton";

const Tiers = [
    {
        name: "Basic",
        price: "Free",
        period: "",
        description: "For the conscious browser.",
        features: [
            "Chrome Extension",
            "Real-time CPW Estimates",
            "Basic Material Scoring"
        ],
        buttonText: "Add to Chrome",
        primary: false
    },
    {
        name: "Pro",
        price: "$8",
        period: "/mo",
        description: "For the wardrobe architect.",
        features: [
            "Everything in Basic",
            "Unlimited Trend Forecasting",
            "Personal Wardrobe CPW Dashboard",
            "Brand Alternatives Archive"
        ],
        buttonText: "Start 14-Day Trial",
        primary: true
    }
];

export function Footer() {
    return (
        <footer className="relative w-full min-h-[600px] flex items-end overflow-hidden mt-0">
            {/* Immersive Background */}
            <div className="absolute inset-x-0 bottom-0 top-[-20%] z-0">
                <img
                    src="/background_1.avif"
                    alt="Dark moody pastoral oil painting"
                    className="w-full h-[120%] object-cover opacity-90 sepia-[0.2]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#f6f5f1] to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 lg:px-0 pt-32 pb-12 flex flex-col justify-end">

                <div className="flex flex-col md:flex-row justify-between items-center w-full mb-24 md:mb-32 gap-12 text-center md:text-left">
                    {/* Brand */}
                    <div className="max-w-md">
                        <div className="flex items-center gap-2 mb-6 text-cream/90">
                            <Asterisk weight="bold" className="w-[4vw] h-[4vw] md:w-[6rem] md:h-[6rem]" />
                            <h2 className="font-sans font-medium text-[10vw] md:text-[8rem] leading-none tracking-tight select-none">UNRAVEL</h2>
                        </div>
                        <p className="font-sans text-cream/70 text-lg md:text-xl leading-relaxed">
                            Empowering consumers with material truth. End the cycle of fast fashion.
                        </p>
                    </div>

                    {/* Massive CTA */}
                    <div className="flex flex-col items-center md:items-end gap-6">
                        <MagneticButton
                            strength={0.1}
                            className={`px-12 py-5 rounded-full font-sans font-semibold text-lg text-charcoal bg-cream hover:bg-white hover:scale-105 transition-all`}
                        >
                            Get Started
                        </MagneticButton>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="w-full flex flex-col md:flex-row justify-between items-center pt-8 border-t border-cream/10 text-cream/60 font-sans text-xs gap-4">
                    <p>© {new Date().getFullYear()} Unravel Inc. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="/about" className="hover:text-cream transition-colors">About</a>
                        <a href="#" className="hover:text-cream transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-cream transition-colors">Terms of Service</a>
                        <a href="#" className="flex items-center gap-1 hover:text-cream transition-colors">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            All systems operational
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
