"use client";

import { motion } from "framer-motion";
import { ASSETS } from "./Assets";

const FEATURES = [
    {
        title: "Uncover reality",
        desc: "Unravel's platform is built to help consumers see past greenwashing.",
        bg: ASSETS.imgRoundedRectangle,
        textColor: "text-white",
        descColor: "text-white",
    },
    {
        title: "Future-proof style",
        desc: "A powerful data engine translates sustainability metrics into simple insights",
        bg: ASSETS.imgRoundedRectangle1,
        textColor: "text-[#9e345c]",
        descColor: "text-[#9e345c]",
    },
    {
        title: "Reduce waste",
        desc: "Eliminate impulse buys, endless returns, and low-quality fabrics",
        bg: ASSETS.imgRoundedRectangle2,
        textColor: "text-white",
        descColor: "text-white",
    }
];

export function FeaturesSection() {
    return (
        <section className="relative w-full flex flex-col items-center justify-center z-20 min-h-[600px] -mt-[1px]">
            {/* 
              The background image contains both the ripped edges and the gingham pattern.
              We stretch it with object-fill to ensure the edges cover the top and bottom seamlessly.
            */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                <img src={ASSETS.imgGroup14} alt="Gingham Pattern with Ripped Edges" className="w-full h-full object-fill" />
            </div>

            <div className="relative z-30 w-full max-w-[1200px] px-8 flex flex-col md:flex-row items-center justify-center gap-8 py-32">
                {FEATURES.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                        className="relative w-full md:w-1/3 aspect-[4/3] rounded-[16px] overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.48)] flex flex-col items-center justify-center text-center px-6"
                    >
                        {/* Background Fabric */}
                        <img
                            src={feature.bg}
                            alt={feature.title}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />
                        
                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            <h3 className={`font-serif font-bold text-[32px] leading-tight ${feature.textColor}`}>
                                {feature.title}
                            </h3>
                            <p className={`font-serif font-bold text-[20px] leading-relaxed max-w-[280px] ${feature.descColor}`}>
                                {feature.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
