"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";

const newsItems = [
    {
        title: "The Reality of Recycled Polyester: Greenwashing or Progress?",
        category: "Material Science",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
        title: "Unravel Intelligence Engine: Mapping the Global Supply Chain",
        category: "Product Update",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
        title: "Unravel conversations with Patagonia's Head of Sustainability",
        category: "Interviews",
        readTime: "12 min watch",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800&h=600"
    }
];

export function NewsSection() {
    return (
        <section className="w-full bg-[#f6f5f1] pt-24 pb-32 flex justify-center border-t border-charcoal/5 pointer-events-auto">
            <div className="w-full max-w-[1000px] mx-auto px-4 lg:px-0">

                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <h2 className="font-sans text-[2.25rem] md:text-[3rem] tracking-[-0.05em] font-normal leading-[1.1] text-[#1b0624]">
                        News
                    </h2>
                    <button className="hidden md:flex items-center gap-1.5 font-sans text-[13px] font-semibold text-charcoal transition-colors hover:text-charcoal/70">
                        See more
                    </button>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {newsItems.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="flex flex-col group cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="w-full aspect-[4/3] rounded-[4px] overflow-hidden bg-charcoal/5 mb-5 relative">
                                <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                />
                            </div>

                            {/* Content */}
                            <h3 className="font-sans font-medium text-[16px] leading-[1.35] text-charcoal mb-4">
                                {item.title}
                            </h3>

                            <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-charcoal/40 mt-auto">
                                <span>{item.category}</span>
                                <span className="w-3 border-t border-charcoal/20"></span>
                                <span>{item.readTime}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center md:hidden">
                    <button className="flex items-center gap-1.5 font-sans text-[13px] font-semibold text-charcoal transition-colors hover:text-charcoal/70">
                        See more
                    </button>
                </div>

            </div>
        </section>
    );
}
