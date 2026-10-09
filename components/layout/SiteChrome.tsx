"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "../ui/ChatWidget";

interface SiteChromeProps {
  children: ReactNode;
  topBar?: string[];
}

export default function SiteChrome({ children, topBar = [] }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {/* scrolls away; only the navbar stays pinned */}
      <AnnouncementBar items={topBar} />
      <Navbar />
      <main>{children}</main>
         <ChatWidget /> 
      <Footer />
    </>
  );
}