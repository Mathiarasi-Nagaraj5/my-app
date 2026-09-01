"use client";

import { usePathname } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface SiteChromeProps {
  children: React.ReactNode;
  topBar?: string[];
}

export default function SiteChrome({
  children,
  topBar = [],
}: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <AnnouncementBar items={topBar} />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}