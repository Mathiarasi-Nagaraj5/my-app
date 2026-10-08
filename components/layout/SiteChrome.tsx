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
    <div className="sticky top-0 z-50 w-full bg-ivory">
      <AnnouncementBar items={topBar} />
      </div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}