"use client";

import { motion } from "framer-motion";
import { ASSETS } from "./Assets";

export function FooterSection() {
    return (
        <section className="relative w-full min-h-[700px] flex flex-col items-center justify-center overflow-hidden bg-[#5f6642] mt-0 pb-20 pt-32 -mt-[1px]">
            {/* Wavy Top Edge */}
            <div className="absolute top-[-2px] left-0 w-full overflow-hidden leading-[0] z-20 pointer-events-none">
                <img src={ASSETS.imgGroup30} alt="Wavy Edge" className="w-full h-auto min-w-[1200px] object-cover object-top" />
            </div>

            {/* Static Stars */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <img src={ASSETS.imgImage21} alt="Star" className="absolute left-[10%] top-[30%] w-[100px] object-contain opacity-90 drop-shadow-md" />
                <img src={ASSETS.imgImage22} alt="Star" className="absolute left-[18%] bottom-[20%] w-[130px] object-contain opacity-95 drop-shadow-md" />
                <img src={ASSETS.imgImage20} alt="Star" className="absolute right-[10%] top-[25%] w-[110px] object-contain opacity-90 drop-shadow-md" />
                <img src={ASSETS.imgImage22} alt="Star" className="absolute right-[12%] bottom-[15%] w-[150px] object-contain opacity-95 drop-shadow-md" />
            </div>

            {/* Footer Content */}
            <div className="relative z-20 w-full max-w-[1000px] px-4 mx-auto flex flex-col items-center text-center mt-20">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-sans font-bold text-[4.5rem] md:text-[6.5rem] tracking-tighter text-white mb-6 leading-none"
                >
                    UNRAVELED
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="font-sans font-bold text-[1.1rem] md:text-[1.3rem] leading-relaxed text-white max-w-xl mb-12"
                >
                    <p className="mb-1">Empowering consumers with material truth.</p>
                    <p>End the cycle of fast fashion.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <button className="px-10 py-3.5 bg-white text-[#5c6c47] rounded-[30px] font-sans font-bold text-[1.1rem] transition-transform hover:scale-105 shadow-lg pointer-events-auto">
                        Get Extension Now
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
