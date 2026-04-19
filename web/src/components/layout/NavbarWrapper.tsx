"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function NavbarWrapper() {
  const pathname = usePathname();
  
  // You might want to hide navbar on certain pages
  const hideNavbarOn = ["/login", "/signup"];
  if (hideNavbarOn.includes(pathname)) return null;

  return <Navbar />;
}
