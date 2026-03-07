"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    strength?: number;
}

export function MagneticButton({ children, className, strength = 0.2, ...props }: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);

    // Motion values for x/y position to prevent React re-renders on every pixel move
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Apply spring physics for that strict "premium" feel mentioned in theme.md
    const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
    const smoothX = useSpring(x, springConfig);
    const smoothY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Set motion values directly
        x.set((clientX - centerX) * strength);
        y.set((clientY - centerY) * strength);
    };

    const handleMouseLeave = () => {
        // Reset smoothly back to center
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: smoothX, y: smoothY }}
            className={cn(
                "relative overflow-hidden group flex items-center justify-center transition-transform active:scale-[0.98] active:-translate-y-[1px]",
                className
            )}
            {...props}
        >
            {/* Absolute sliding background layer for premium hover fill WITHOUT reacting to layout */}
            <span
                className="absolute inset-0 w-full h-full bg-black/15 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none mix-blend-multiply"
                style={{ borderRadius: "inherit" }}
            />
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    );
}
