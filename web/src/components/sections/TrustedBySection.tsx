"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const brands = [
    { name: "patagonia", style: "font-sans font-bold tracking-tighter" },
    { name: "everlane", style: "font-sans font-medium tracking-tight" },
    { name: "eileen fisher", style: "font-sans font-light tracking-wide lowercase" },
    { name: "outerknown", style: "font-sans font-semibold tracking-widest uppercase" },
    { name: "reformation", style: "font-serif italic tracking-tight" },
    { name: "stella mccartney", style: "font-sans font-medium tracking-normal" }
];

// Duplicate for infinite scroll
const marqueeBrands = [...brands, ...brands, ...brands];

const testimonials = [
    {
        quote: "People ask how we're using AI in supply chain regulation and I have a simple answer for them. We use Unravel.",
        author: "Zak Lambert",
        role: "GM EMEA, Eco-Institute",
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
        role: "Head of Material Science, Eco",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000",
        bg: "bg-[#E6E4DD]"
    }
];

export function TrustedBySection() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full bg-[#FCFBF9] py-32 flex flex-col items-center">

            {/* Header Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-[1000px] px-6 lg:px-0 mb-12 text-center"
            >
                <h2 className="font-sans text-[1.75rem] md:text-[2.25rem] font-medium tracking-tight text-charcoal mb-3">
                    Trusted by leaders
                </h2>
                <p className="font-sans text-charcoal/60 text-[14px] md:text-[15px] max-w-[500px] mx-auto leading-relaxed">
                    Analyze supply chains like the world's best companies — <br className="hidden md:block" />
                    without needing a 100+ person team.
                </p>
            </motion.div>

            {/* Animated Marquee */}
            <div className="w-full max-w-[800px] overflow-hidden mb-24 relative flex">
                <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-[#FCFBF9] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-[#FCFBF9] to-transparent z-10 pointer-events-none" />

                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                    className="flex items-center gap-16 md:gap-24 opacity-40 mix-blend-multiply text-[1.5rem] md:text-[1.75rem] text-charcoal whitespace-nowrap min-w-max px-8"
                >
                    {marqueeBrands.map((brand, i) => (
                        <span key={i} className={brand.style}>
                            {brand.name}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Testimonial Block */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full max-w-[1000px] px-4 lg:px-0"
            >
                <div className="relative w-full h-[650px] md:h-[500px] bg-[#F6F5F1] rounded-[4px] overflow-hidden flex flex-col md:flex-row">
                    <AnimatePresence>
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute inset-0 flex flex-col-reverse md:flex-row w-full h-full"
                        >
                            {/* Left Text Box */}
                            <div className="w-full md:w-[55%] h-1/2 md:h-full p-8 md:p-14 flex flex-col justify-center bg-[#F6F5F1] z-10 relative">
                                <p className="font-sans text-[1.5rem] md:text-[1.75rem] font-normal leading-[1.2] tracking-[-0.03em] text-[#292421] mb-10 text-left">
                                    "{testimonials[activeIndex].quote}"
                                </p>
                                <div className="mt-auto flex flex-col gap-1">
                                    <div className="font-sans font-semibold text-[13px] text-charcoal">{testimonials[activeIndex].author}</div>
                                    <div className="font-sans text-[12px] text-charcoal/50">{testimonials[activeIndex].role}</div>
                                </div>
                            </div>

                            {/* Right Image Box */}
                            <div className={`w-full md:w-[45%] h-1/2 md:h-full relative overflow-hidden ${testimonials[activeIndex].bg}`}>
                                <img
                                    src={testimonials[activeIndex].image}
                                    alt={testimonials[activeIndex].author}
                                    className="absolute inset-x-0 bottom-0 w-[95%] mx-auto h-[110%] object-cover object-top mix-blend-multiply opacity-90 transition-transform duration-1000 scale-100 group-hover:scale-105"
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </section>
    );
}
