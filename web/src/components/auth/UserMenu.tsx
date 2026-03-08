"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { motion, AnimatePresence } from "framer-motion";
import { SignOut, User as UserIcon, ChartBar } from "@phosphor-icons/react";
import Link from "next/link";

export function UserMenu() {
  const { user, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "User";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-stone-100"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-charcoal text-cream flex items-center justify-center text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-charcoal max-w-[120px] truncate">
          {displayName}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 rounded-xl bg-white border border-stone-200 shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-sm font-semibold text-charcoal truncate">
                {displayName}
              </p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal hover:bg-stone-50 transition-colors"
              >
                <ChartBar weight="bold" className="w-4 h-4 text-stone-500" />
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal hover:bg-stone-50 transition-colors"
              >
                <UserIcon weight="bold" className="w-4 h-4 text-stone-500" />
                My Wardrobe
              </Link>
            </div>

            <div className="border-t border-stone-100 py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <SignOut weight="bold" className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
