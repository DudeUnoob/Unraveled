"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { ASSETS } from "../home/Assets";

const NAV_ASSETS = {
  logoImage: "https://www.figma.com/api/mcp/asset/1f6220d2-4cfd-4a13-9df3-8bd0d05c6573",
  googleIcon: "https://www.figma.com/api/mcp/asset/654c7ecb-205b-40a2-88b0-dc257c29c397",
  tabInactive: "https://www.figma.com/api/mcp/asset/ac2f3189-2966-415f-b082-556e421f1231",
  lineNavbar: "https://www.figma.com/api/mcp/asset/752307d6-9ff8-4e46-824d-b65869c2ee9a",
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
      <header className="w-full absolute top-0 left-0 h-[68px] flex items-end px-4 md:px-8 z-50 pt-2">
        {/* Logo */}
        <Link href="/" className="absolute left-4 md:left-8 top-4 w-[45px] h-[41px] hover:opacity-80 transition-opacity">
          <img src={NAV_ASSETS.logoImage} alt="Logo" className="w-full h-full object-contain" />
        </Link>

        {/* Tabs */}
        <div className="hidden md:flex mx-auto items-end gap-[6px] relative z-10 pb-[1px]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname === "/" && link.href === "/analyze");
            
            if (isActive) {
              return (
                <div key={link.name} className="w-[129px] h-[40px] bg-[#5f6642] rounded-t-[10px] flex items-center justify-center relative">
                  <span className="font-serif font-bold text-white text-[22px]">{link.name}</span>
                </div>
              );
            }
            
            return (
              <Link key={link.name} href={link.href} className="w-[104px] h-[32px] relative flex items-center justify-center group hover:opacity-90 transition-opacity">
                <img src={NAV_ASSETS.tabInactive} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <span className="relative z-10 font-serif font-bold text-white text-[20px]">{link.name}</span>
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
              <span className="font-serif font-bold text-[#fff3f8] text-[20px]">Sign In</span>
              <img src={NAV_ASSETS.googleIcon} alt="Google" className="w-5 h-5 object-contain" />
            </button>
          ) : (
            <div className="h-[35px] bg-[#5f6642] rounded-t-[10px] flex items-center justify-center gap-3 px-4 border-none outline-none">
              <span className="font-serif font-bold text-[#fff3f8] text-[16px] truncate max-w-[100px]">
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
