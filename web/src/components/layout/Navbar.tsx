"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { ASSETS } from "@/components/home/Assets";
import { useUser } from "@/hooks/useUser";

const navLinks = [
    { name: "Analyze", href: "/analyze" },
    { name: "Gallery", href: "/gallery" },
    { name: "Brands", href: "/brands" },
    { name: "About", href: "/about" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();
    const { signInWithGoogle } = useUser();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 10);
    });

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300",
                isScrolled ? "bg-white shadow-sm border-b border-gray-200" : "bg-white border-b border-gray-200"
            )}
        >
            <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
                {/* Left: Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <img src={ASSETS.imgImage32} alt="Unraveled Logo" className="w-12 h-12 object-contain" />
                    </Link>
                </div>

                {/* Center: Tabs */}
                <div className="flex items-center justify-center gap-1">
                    {navLinks.map((link, index) => {
                        const isActive = index === 0; // Simulate "Analyze" as active tab
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "px-5 flex items-center justify-center transition-colors text-white font-serif font-bold text-lg",
                                    isActive ? "bg-[#5f6642] h-10 rounded-t-lg rounded-b-none" : "bg-[#5f6642]/80 h-8 rounded-t-lg rounded-b-none hover:bg-[#5f6642]/90"
                                )}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Right: Sign In */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => signInWithGoogle()}
                        className="flex items-center gap-2 bg-[#5f6642] text-white px-4 py-2 rounded-md font-serif font-bold hover:bg-[#5f6642]/90 transition-colors"
                    >
                        <img src={ASSETS.imgGoogle} alt="Google" className="w-4 h-4 object-contain" />
                        Sign In
                    </button>
                </div>
            </nav>
        </header>
    );
}
