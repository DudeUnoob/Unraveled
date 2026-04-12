"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent, } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS } from "@/components/home/Assets";
import { useUser } from "@/hooks/useUser";
import { GoogleLogo } from "@phosphor-icons/react";
const navLinks = [
    { name: "Analyze", href: "/analyze" },
    { name: "Gallery", href: "/gallery" },
    { name: "Brands", href: "/brands" },
    { name: "About", href: "/about" },
];
export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();
    const { signInWithGoogle, user } = useUser();
    const pathname = usePathname();
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });
    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-500 px-6 pt-6",
                isScrolled ? "translate-y-[-10px]" : "translate-y-0"
            )}
        >
            <div className={cn(
                "max-w-[1400px] mx-auto rounded-full transition-all duration-500 border overflow-hidden backdrop-blur-xl",
                isScrolled 
                    ? "bg-white/80 border-forest/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] py-2" 
                    : "bg-white/40 border-white/20 py-3"
            )}>
                <nav className="flex items-center justify-between px-8">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
                            <img src={ASSETS.imgImage32} alt="Unraveled Logo" className="w-10 h-10 object-contain" />
                        </Link>
                    </div>
                    {/* Center: Tabs */}
                    <div className="flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (pathname === "/" && link.href === "/analyze");
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "relative px-6 py-2 transition-all duration-300 font-sans text-sm font-bold tracking-tight uppercase",
                                        isActive ? "text-forest" : "text-charcoal/40 hover:text-charcoal/80"
                                    )}
                                >
                                    {link.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navActive"
                                            className="absolute bottom-0 left-6 right-6 h-0.5 bg-forest rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                    {/* Right: Sign In / User */}
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => signInWithGoogle()}
                                className="flex items-center gap-2 bg-forest text-cream px-5 py-2.5 rounded-full font-sans text-xs font-bold shadow-lg shadow-forest/20 hover:bg-forest-dark transition-all duration-300"
                            >
                                <GoogleLogo weight="bold" className="w-4 h-4" />
                                Sign In
                            </motion.button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="font-sans text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">Logged in</span>
                                    <span className="font-sans text-xs font-bold text-forest leading-tight truncate max-w-[100px]">
                                        {user.email?.split('@')[0]}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-forest-light/30 border border-forest/10 flex items-center justify-center overflow-hidden">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-sans text-xs font-bold text-forest uppercase">
                                            {user.email?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}