"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatbotFloat from "@/components/ui/ChatbotFloat";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHrApp = pathname?.startsWith("/hr360");

  return (
    <>
      {!isHrApp && <Navbar />}
      <main>{children}</main>
      {!isHrApp && <Footer />}
      {!isHrApp && <ChatbotFloat />}
    </>
  );
}
