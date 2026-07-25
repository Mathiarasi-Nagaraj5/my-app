"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex bg-ivory">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col h-screen overflow-hidden">
        <header className="flex items-center gap-3 border-b border-charcoal/10 bg-white p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-charcoal"
          >
            <Menu size={22} />
          </button>
         <p className="text-3xl font-bold text-charcoal">
            Elite Soul <span className="text-3xl font-bold text-pink">Admin</span>
          </p>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}