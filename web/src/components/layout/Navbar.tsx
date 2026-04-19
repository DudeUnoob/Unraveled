"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { ASSETS } from "../home/Assets";
import { motion } from "framer-motion";

const NAV_ASSETS = {
  logoImage: "https://www.figma.com/api/mcp/asset/1f6220d2-4cfd-4a13-9df3-8bd0d05c6573",
  googleIcon: "https://www.figma.com/api/mcp/asset/654c7ecb-205b-40a2-88b0-dc257c29c397",
};

const navLinks = [
    { name: "Analyze", href: "/analyze" },
    { name: "Gallery", href: "/gallery" },
    { name: "Brands", href: "/brands" },
    { name: "About", href: "/about" },
];

export function Navbar() {
    const { signInWithGoogle, user } = useUser();
    const pathname = usePathname();

    return (
      <header className="w-full absolute top-0 left-0 h-[68px] flex items-end px-4 md:px-8 z-[100] pt-2">
        {/* Logo */}
        <Link href="/" className="absolute left-4 md:left-8 top-4 w-[45px] h-[41px] hover:opacity-80 transition-opacity">
          <img src={NAV_ASSETS.logoImage} alt="Logo" className="w-full h-full object-contain" />
        </Link>

        {/* Tabs */}
        <div className="hidden md:flex mx-auto items-end gap-[6px] relative z-10 pb-[1px]">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href) || (pathname === "/" && link.href === "/analyze");
            
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className="w-[122px] h-[40px] relative flex items-center justify-center group transition-all duration-300"
              >
                {isActive ? (
                  <motion.div 
                    layoutId="active-nav-tab"
                    className="absolute inset-0 bg-[#5f6642] rounded-t-[10px]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#5f6642] rounded-t-[10px] group-hover:bg-[#6c744c] transition-colors" aria-hidden />
                )}
                <span className={`relative z-10 font-stix font-bold text-white transition-all duration-300 ${isActive ? 'text-[22px]' : 'text-[20px] opacity-90 group-hover:opacity-100'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sign In */}
        <div className="hidden md:flex absolute right-8 bottom-[1px] z-10">
          {!user ? (
            <button 
              onClick={() => signInWithGoogle()}
              className="w-[125px] h-[35px] bg-[#5f6642] rounded-t-[10px] flex items-center justify-center gap-2 cursor-pointer border-none outline-none hover:bg-[#6c744c] transition-colors"
            >
              <span className="font-stix font-bold text-[#fff3f8] text-[20px]">Sign In</span>
              <img src={NAV_ASSETS.googleIcon} alt="Google" className="w-5 h-5 object-contain" />
            </button>
          ) : (
            <div className="h-[35px] bg-[#5f6642] rounded-t-[10px] flex items-center justify-center gap-3 px-4 border-none outline-none">
              <span className="font-stix font-bold text-[#fff3f8] text-[16px] truncate max-w-[100px]">
                {user.email?.split('@')[0]}
              </span>
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif font-bold text-white text-xs uppercase">
                    {user.email?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Line */}
        <div className="absolute bottom-[-1px] left-0 w-full h-[2px]">
          <img src={ASSETS.imgLine285} alt="" className="w-full h-full object-cover" />
        </div>
      </header>
    );
}
