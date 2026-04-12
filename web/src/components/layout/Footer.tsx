"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Asterisk, Sparkle } from "@phosphor-icons/react";

function WavyDivider() {
    return (
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none -translate-y-[99%]">
            <svg
                viewBox="0 0 1440 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,60 C320,-60 420,120 720,60 C1020,0 1120,180 1440,60 L1440,120 L0,120 Z"
                    fill="currentColor"
                    className="text-forest"
                />
            </svg>
        </div>
    );
}

export function Footer() {
    return (
        <footer className="relative w-full bg-forest text-cream pt-32 pb-16 overflow-hidden mt-32">
            <WavyDivider />
            
            {/* Background floating elements for Motion Intensity 8 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1], x: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="absolute -left-20 top-20 opacity-10"
                >
                    <Asterisk weight="bold" className="w-64 h-64 text-sage" />
                </motion.div>
                <motion.div
                    animate={{ rotate: -360, y: [0, -40, 0] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
                    className="absolute right-10 bottom-20 opacity-10"
                >
                    <Sparkle weight="fill" className="w-48 h-48 text-forest-light" />
                </motion.div>
                
                {/* Visual Density dots */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                />
            </div>

            <div className="max-w-[1400px] mx-auto px-8 relative z-10">
                <div className="flex flex-col items-center justify-center text-center mb-24">
                    <motion.h2 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="font-sans text-[12vw] md:text-[10rem] font-bold tracking-tighter leading-none mb-8 select-none"
                    >
                        UNRAVELED
                    </motion.h2>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="font-sans font-medium text-lg md:text-2xl text-cream/80 max-w-3xl mb-16 leading-relaxed"
                    >
                        Empowering consumers with material truth. <br className="hidden md:block" />
                        End the cycle of fast fashion through real-time economic analysis.
                    </motion.div>
                    
                    <motion.a 
                        href="/extension-redirect"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-cream text-forest rounded-full font-sans text-xl font-bold shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all hover:bg-white active:bg-linen"
                    >
                        Get Extension Now
                    </motion.a>
                </div>

                {/* Bottom Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pt-16 border-t border-white/10">
                    <div className="flex flex-col gap-6">
                        <span className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Navigation</span>
                        <div className="flex flex-col gap-3">
                            <Link href="/analyze" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Analyze Trend</Link>
                            <Link href="/gallery" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Style Gallery</Link>
                            <Link href="/brands" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Brand Index</Link>
                            <Link href="/about" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Our Mission</Link>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                        <span className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Legal</span>
                        <div className="flex flex-col gap-3">
                            <Link href="#" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="#" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="#" className="font-sans text-sm font-bold text-cream/60 hover:text-white transition-colors">Cookie Policy</Link>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 md:col-span-2 items-start md:items-end">
                        <span className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Contact</span>
                        <a href="mailto:hello@unravel.style" className="font-sans text-2xl font-bold text-cream hover:text-forest-light transition-colors">hello@unravel.style</a>
                        <p className="font-sans text-sm text-white/20 mt-4">© {new Date().getFullYear()} Unravel Inc. End the cycle.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
