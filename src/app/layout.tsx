import type { Metadata } from "next";
import "./globals.css";

import { Playfair_Display, Inter } from "next/font/google";

// IMPORT ADD //
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SBS PROSPECTS",
  description:
    "Build Your Career with Industry-Focused Training",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`
          ${playfair.variable}
          ${inter.variable}
          font-sans
          antialiased bg-sbs-cream text-sbs-charcoal
        `}
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}