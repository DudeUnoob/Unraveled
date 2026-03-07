"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Browser as ChromeIcon, Asterisk } from "@phosphor-icons/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";

const navLinks = [
    { name: "Analyze", href: "/analyze" },
    { name: "Platform", href: "#platform" },
    { name: "Methodology", href: "#methodology" },
    { name: "Brands", href: "#brands" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("Platform");
    const { scrollY } = useScroll();

    // Strict avoidance of window.addEventListener per theme.md rules
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <motion.header
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[1200px] px-4 md:px-0 transition-all duration-500",
            )}
        >
            <nav
                className={cn(
                    "flex items-center justify-between rounded-full px-6 py-4 transition-all duration-500",
                    isScrolled
                        ? "bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/50 text-charcoal"
                        : "bg-transparent text-charcoal"
                )}
            >
                <div className="flex items-center gap-x-12">
                    <Link href="/" className="flex items-center gap-1.5 font-sans font-medium text-lg tracking-tight uppercase shrink-0">
                        <Asterisk weight="bold" className="w-5 h-5 text-charcoal/80" />
                        UNRAVEL
                    </Link>

                    <ul className="hidden md:flex items-center gap-6 font-sans text-sm font-medium">
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <Link
                                    href={link.href}
                                    onClick={() => setActiveLink(link.name)}
                                    className="relative transition-opacity hover:opacity-100"
                                    style={{ opacity: activeLink === link.name ? 1 : 0.6 }}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <MagneticButton
                    strength={0.1}
                    className="rounded-full px-6 py-2.5 bg-charcoal text-cream font-sans font-medium text-sm transition-transform hover:scale-105"
                >
                    Get the Extension
                </MagneticButton>
            </nav>
        </motion.header>
    );
}
