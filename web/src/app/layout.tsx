import type { Metadata } from "next";
import { Outfit, Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unravel | Micro-Trend Death Clock",
  description: "See the expiration date on every trend. Know the real cost before you buy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${outfit.variable} ${playfair.variable} ${cormorant.variable} ${jetbrainsMono.variable} font-sans antialiased relative`}
      >
        <NoiseOverlay />
        {children}
      </body>
    </html>
  );
}
