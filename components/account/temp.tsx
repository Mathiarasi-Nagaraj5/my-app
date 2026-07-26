"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../app/lib/context/AuthContext";

const NAV_ITEMS = [
  { label: "Account Details", href: "/profile", icon: User },
  { label: "Orders", href: "/orders", icon: Package },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Saved Addresses", href: "/profile/address", icon: MapPin },
  { label: "Settings", href: "/profile/settings", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex p-2.5  pl-3 pr-3 items-center justify-center rounded-full bg-charcoal text-sm font-black text-pink">
          {initials}
        </div>
        <div>
          <p className="text-md font-medium text-charcoal">{user?.name ?? "..."}</p>
          <p className="text-sm text-charcoal/55">{user?.email ?? ""}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded px-3 py-2.5 text-lg ${
                active
                  ? "bg-charcoal font-medium text-pink"
                  : "text-charcoal/70 hover:bg-charcoal/5"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex items-center gap-2.5 rounded border-t border-charcoal/15 px-3 py-2.5 pt-4 text-left text-lg text-charcoal/70 hover:bg-charcoal/5"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
