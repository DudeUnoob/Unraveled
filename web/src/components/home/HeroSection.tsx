"use client";
import { ASSETS } from "./Assets";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
export function HeroSection() {
    return (
        <section className="relative w-full h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-white mt-[64px]">
            {/* Radial Gradient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ecf9d8_0%,_#ffffff_70%)]" />
            </div>
            {/* Orbiting Clothes */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center max-w-[1200px] mx-auto w-full h-full">
                {/* Top Left (Yellow Top) */}
                <img src={ASSETS.imgImage12} alt="Yellow top" className="absolute top-[12%] left-[26%] w-[18%] object-contain rotate-[-15deg]" />
                
                {/* Top Right (Checkered Top) */}
                <img src={ASSETS.imgImage13} alt="Checkered top" className="absolute top-[8%] right-[26%] w-[18%] object-contain rotate-[5deg]" />
                
                {/* Far Left (Polka Dot) */}
                <img src={ASSETS.imgImage9} alt="Polka dot skirt" className="absolute top-[38%] left-[8%] w-[22%] object-contain rotate-[10deg]" />
                
                {/* Far Right (Jeans) */}
                <img src={ASSETS.imgImage11} alt="Blue jeans" className="absolute top-[32%] right-[8%] w-[26%] object-contain rotate-[-15deg]" />
                
                {/* Bottom Left (Pink Top) */}
                <img src={ASSETS.imgImage8} alt="Pink top" className="absolute bottom-[18%] left-[20%] w-[18%] object-contain rotate-[25deg]" />
                
                {/* Bottom Center (Denim Shorts) */}
                <img src={ASSETS.imgImage6} alt="Denim shorts" className="absolute bottom-[12%] left-[45%] w-[18%] object-contain" />
                
                {/* Bottom Right (Cream T-Shirt) */}
                <img src={ASSETS.imgImage10} alt="Cream t-shirt" className="absolute bottom-[18%] right-[20%] w-[18%] object-contain rotate-[15deg]" />
            </div>
            {/* Centered Text */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center mt-8">
                <p className="font-drama italic text-[3rem] md:text-[4rem] text-[#5f6642] mb-1">
                    Welcome to
                </p>
                <h1 className="font-serif text-[5rem] md:text-[7rem] leading-none tracking-tight text-[#5c6c47] mb-4">
                    UNRAVELED
                </h1>
                <p className="font-serif text-lg md:text-2xl text-[#5f6642] mb-8">
                    The sustainability of your clothes UNRAVELED.
                </p>
                <Link href="/analyze" className="pointer-events-auto">
                    <MagneticButton
                        strength={0.1}
                        className="px-10 py-3 bg-[#5c6c47] text-white rounded-full font-serif font-bold text-xl hover:bg-[#5c6c47]/90 transition-colors"
                    >
                        Get score
                    </MagneticButton>
                </Link>
            </div>
        </section>
    );
}