"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Browser as ChromeIcon, Asterisk, List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { AuthButton } from "@/components/auth/AuthButton";
import { UserMenu } from "@/components/auth/UserMenu";

const navLinks = [
    { name: "Analyze", href: "/analyze" },
    { name: "Gallery", href: "/gallery" },
    { name: "Brands", href: "/brands" },
    { name: "About", href: "/about" },
    { name: "Dashboard", href: "/dashboard", auth: true },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const { scrollY } = useScroll();
    const { user, loading } = useUser();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const visibleLinks = navLinks.filter((l) => !l.auth || user);

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
                        {visibleLinks.map((link) => (
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

                <div className="flex items-center gap-3">
                    {!loading && (user ? <UserMenu /> : <AuthButton />)}

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 rounded-full hover:bg-stone-100 transition-colors"
                        onClick={() => setMobileOpen((p) => !p)}
                    >
                        {mobileOpen ? (
                            <X weight="bold" className="w-5 h-5" />
                        ) : (
                            <List weight="bold" className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden mt-2 mx-2 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg overflow-hidden"
                    >
                        <ul className="p-3 space-y-1">
                            {visibleLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-3 rounded-xl text-sm font-medium text-charcoal hover:bg-stone-50 transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
