"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const brands = [
    "Patagonia",
    "Everlane",
    "Eileen Fisher",
    "Outerknown",
    "Reformation",
    "Stella McCartney"
];

const testimonials = [
    {
        quote: "We chose Unravel for their proven track record delivering 5–10× improvements in operational productivity, while increasing compliance quality. The return on investment was clear.",
        author: "Jaap Remijn",
        role: "COO Eco/Fiserv",
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800&h=1000",
        bg: "bg-[#EAE8E3]"
    },
    {
        quote: "Regulations change fast. Unravel's adaptive risk and policy engine helps businesses drive revenue while keeping sustainability requirements front and center.",
        author: "Job van der Voort",
        role: "CEO Remote (Unravel investor)",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800&h=1000",
        bg: "bg-[#DFDBD2]"
    },
    {
        quote: "Unravel isn't just a browser extension. It's an immune system response to the fast fashion epidemic. Giving users material truth at the point of purchase is transformative.",
        author: "Dr. Elena Rostova",
        role: "Head of Material Science, Eco-Institute",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000",
        bg: "bg-[#E6E4DD]"
    }
];

export function TrustedBySection() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full bg-[#f6f5f1] py-24 md:py-32 flex flex-col items-center">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-[1000px] px-6 lg:px-0 mb-20 text-center"
            >
                <h2 className="font-sans text-3xl md:text-[2.5rem] tracking-tight text-charcoal mb-4">
                    Trusted by leaders
                </h2>
                <p className="font-sans text-charcoal/60 text-[1.125rem] mb-16 leading-relaxed">
                    Analyze supply chains like the world's best companies — <br className="hidden md:block" />
                    without needing a 100+ person team.
                </p>

                <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 md:gap-x-16 opacity-40 mix-blend-multiply font-sans font-extrabold text-2xl md:text-[2rem] tracking-tighter text-charcoal lowercase">
                    {brands.map((brand, i) => (
                        <span key={i}>
                            {brand}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Testimonial Block */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-[1000px] px-4 lg:px-0"
            >
                <div className="relative w-full h-[650px] md:h-[500px] bg-[#f9f8f6] rounded-[1rem] md:rounded-lg overflow-hidden flex flex-col md:flex-row shadow-sm border border-charcoal/5">
                    <AnimatePresence>
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 flex flex-col-reverse md:flex-row w-full h-full"
                        >
                            {/* Left Text */}
                            <div className="w-full md:w-[55%] h-1/2 md:h-full p-8 md:p-14 lg:p-20 flex flex-col justify-center bg-[#F9F8F6] z-10">
                                <p className="font-sans text-xl md:text-[1.75rem] leading-[1.3] text-charcoal tracking-tight mb-8">
                                    "{testimonials[activeIndex].quote}"
                                </p>
                                <div className="mt-auto md:mt-12">
                                    <div className="font-sans font-semibold text-[15px] text-charcoal">{testimonials[activeIndex].author}</div>
                                    <div className="font-sans font-medium text-[13px] text-charcoal/50 mt-1">{testimonials[activeIndex].role}</div>
                                </div>
                            </div>

                            {/* Right Image */}
                            <div className={`w-full md:w-[45%] h-1/2 md:h-full relative overflow-hidden ${testimonials[activeIndex].bg}`}>
                                <img
                                    src={testimonials[activeIndex].image}
                                    alt={testimonials[activeIndex].author}
                                    className="absolute inset-x-0 bottom-0 w-[85%] mx-auto h-auto object-contain mix-blend-multiply opacity-95"
                                    style={{ objectPosition: 'bottom' }}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

        </section>
    );
}
