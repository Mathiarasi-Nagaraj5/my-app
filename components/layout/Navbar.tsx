"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, User, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useWishlist } from "@/lib/context/WishlistContext";

const NAV_LINKS = [
  { label: "t-shirts", href: "/shop?category=t-shirts" },
  { label: "hoodies", href: "/shop?category=hoodies" },
  { label: "pyjamas", href: "/shop?category=pyjamas" },
  { label: "new arrivals", href: "/shop?sort=newest" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  return (
    <header className="bg-charcoal">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-medium tracking-wide text-ivory">
          ELITE SOUL
        </Link>

        {/* desktop links */}
        <nav className="hidden gap-7 text-sm text-ivory/85 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brass">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* icons */}
        <div className="flex items-center gap-5 text-ivory">
          <Link href="/search" aria-label="Search">
            <Search size={19} />
          </Link>
          <Link href="/login" aria-label="Account">
            <User size={19} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative">
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brass text-[10px] font-medium text-charcoal">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brass text-[10px] font-medium text-charcoal">
                {cartCount}
              </span>
            )}
          </Link>

          {/* mobile menu toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-ivory/10 px-6 py-5 text-sm text-ivory/85 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="hover:text-brass"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}