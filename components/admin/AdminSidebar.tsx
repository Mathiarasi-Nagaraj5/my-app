"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Truck, LogOut, RotateCcw, Wallet, X,Star ,  Users, Icon, Image,
  Tag,
  Percent,} from "lucide-react";



const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Site Content", href: "/admin/site-content", icon: Image },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Promotions", href: "/admin/promotions", icon: Percent },
  { label: "Orders", href: "/admin/orders", icon: Truck },
  { label: "Returns", href: "/admin/returns", icon: RotateCcw },
  { label: "Ratings", href: "/admin/ratings", icon: Star },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <>
      {/* Overlay - mobile only, shown when drawer is open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-65 flex-col bg-charcoal p-4 transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:z-auto lg:flex lg:shrink-0`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-3xl font-bold text-ivory">
            Elite Soul <span className="text-3xl font-bold text-pink">Admin</span>
          </p>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-ivory/70 hover:text-ivory lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-xl capitalize ${
                  active ? "bg-pink font-medium text-black" : "text-ivory/70 hover:bg-ivory/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 border-t border-ivory/10 pt-4 text-xl text-ivory/70 hover:text-ivory"
        >
          <LogOut size={16} />
          logout
        </button>
      </aside>
    </>
  );
}