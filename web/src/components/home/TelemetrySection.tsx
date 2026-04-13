"use client";

import { motion } from "framer-motion";
import { ASSETS } from "./Assets";

const TELEMETRY_FEATURES = [
    {
        icon: ASSETS.imgConflict,
        title: "Instant telemetry",
        desc: "Velit officia consequat duis enim velit mollit.\nExercitation veniam consequat sunt nostrud amet"
    },
    {
        icon: ASSETS.imgCash,
        title: "Cost per wear projection",
        desc: "Velit officia consequat duis enim velit mollit.\nExercitation veniam consequat sunt nostrud amet"
    },
    {
        icon: ASSETS.imgDatabase,
        title: "First-time-right data collection",
        desc: "Velit officia consequat duis enim velit mollit.\nExercitation veniam consequat sunt nostrud amet"
    }
];

export function TelemetrySection() {
    return (
        <section className="relative w-full flex flex-col items-center justify-center bg-white z-40 pt-[100px] pb-0">
            {/* Title sits on the white background */}
            <h2 className="font-serif text-[2.5rem] md:text-[3.25rem] text-[#5f6642] text-center mb-12 relative z-10">
                Drive better decisions
            </h2>

            {/* Repeating Background Text Area */}
            <div className="relative w-full bg-[rgba(236,249,216,0.8)] py-16 overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 flex flex-col justify-center overflow-hidden z-0 pointer-events-none select-none opacity-[0.25]">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="whitespace-nowrap font-serif font-medium text-[10vw] leading-[0.85] text-[#5f6642]">
                            UNRAVELED UNRAVELED UNRAVELED UNRAVELED UNRAVELED UNRAVELED
                        </div>
                    ))}
                </div>

                <div className="relative z-10 w-full max-w-[1200px] px-4 md:px-8 mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
                    
                    {/* Left: T-shirt Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-5/12 flex justify-center lg:justify-end"
                    >
                        <div className="w-full max-w-[380px] aspect-[4/5] bg-white rounded-[32px] flex items-center justify-center p-4">
                            <img 
                                src={ASSETS.imgRectangle6} 
                                alt="T-shirt with stars"
                                className="w-[95%] h-[95%] object-cover rounded-[24px]"
                            />
                        </div>
                    </motion.div>

                    {/* Right: Feature Cards */}
                    <div className="w-full lg:w-7/12 flex flex-col gap-6 justify-center">
                        {TELEMETRY_FEATURES.map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-white rounded-[18px] px-8 py-6 flex items-center gap-6"
                            >
                                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                    <img src={feat.icon} alt={feat.title} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h3 className="font-serif font-bold text-[23px] text-[#5f6642]">
                                        {feat.title}
                                    </h3>
                                    <p className="font-serif font-semibold text-[16px] text-[#5f6642] leading-snug whitespace-pre-line">
                                        {feat.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
