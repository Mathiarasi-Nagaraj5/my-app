"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, LogOut, X, Star, Users, Image,
  Percent, UserCircle, ChevronDown, Plus, List,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string; icon: LucideIcon }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: Truck },
 
  {
    label: "Inventory",
    href: "/admin/products",
    icon: Package,
    children: [
      { label: "All Products", href: "/admin/products", icon: List },
      { label: "Add New Product", href: "/admin/products/new", icon: Plus },
    ],
  },
   { label: "Site Content", href: "/admin/site-content", icon: Image },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Promotions", href: "/admin/promotions", icon: Percent },
  { label: "Ratings", href: "/admin/ratings", icon: Star },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // which groups the user has manually toggled; a group is also forced
  // open whenever the current route is inside it
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const isInside = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Overlay - mobile only, shown when drawer is open */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
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
          {NAV_ITEMS.map(({ label, href, icon: Icon, children }) => {
            // ── group with sub menu ──
            if (children) {
              const groupActive = isInside(href);
              const isOpen = expanded[href] ?? groupActive;

              return (
                <div key={href}>
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [href]: !isOpen }))}
                    aria-expanded={isOpen}
                    className={`flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-xl capitalize transition-colors ${
                      groupActive ? "text-pink" : "text-ivory/70 hover:bg-ivory/5"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* grid-rows trick gives a smooth height animation */}
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-ivory/15 pl-3">
                        {children.map(({ label: cLabel, href: cHref, icon: CIcon }) => {
                          const active = pathname === cHref;
                          return (
                            <Link
                              key={cHref}
                              href={cHref}
                              onClick={onClose}
                              tabIndex={isOpen ? 0 : -1}
                              className={`flex items-center gap-2 rounded px-3 py-2 text-base ${
                                active
                                  ? "bg-pink font-medium text-black"
                                  : "text-ivory/70 hover:bg-ivory/5"
                              }`}
                            >
                              <CIcon size={15} />
                              {cLabel}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // ── normal link ──
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

        <div className="flex flex-col gap-1 border-t border-ivory/10 pt-4">
          <Link
            href="/admin/profile"
            onClick={onClose}
            className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-xl ${
              pathname === "/admin/profile" ? "bg-pink font-medium text-black" : "text-ivory/70 hover:bg-ivory/5"
            }`}
          >
            <UserCircle size={18} />
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 text-xl text-ivory/70 hover:text-ivory"
          >
            <LogOut size={16} />
            logout
          </button>
        </div>
      </aside>
    </>
  );
}