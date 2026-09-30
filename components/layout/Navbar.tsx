"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, User, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/app/lib/context/CartContext";
import { useWishlist } from "@/app/lib/context/WishlistContext";
import { useAuth } from "../../app/lib/context/AuthContext";

interface Category {
  name: string;
  slug: string;
}

function CategoryLink({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={`/shop?category=${encodeURIComponent(category.slug)}`}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      data-label={category.name}
      // The invisible bold copy in ::after reserves the bold width,
      // so links don't shift when one becomes active.
      className={`inline-flex flex-col items-center hover:text-pink after:invisible after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-label)] ${
        isActive ? "font-bold text-pink" : ""
      }`}
    >
      {category.name}
    </Link>
  );
}

function NavbarContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory =
    pathname === "/shop" ? searchParams.get("category") : null;

  // logged in → account icon goes to the profile page
  // logged out → goes to login
  const accountHref = user ? "/profile" : "/login";
  const accountLabel = user ? `Account — ${user.fullName}` : "Login";

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  return (
    <header className="bg-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-3xl font-stretch-50% tracking-wide text-charcoal">
          <Image src="/images/logo.png" alt="Elite Soul" width={180} height={80} />
        </Link>

        {/* desktop links */}
        <nav className="hidden gap-7 text-lg text-charcoal/85 md:flex">
          {categories.map((category) => (
            <CategoryLink
              key={category.slug}
              category={category}
              isActive={activeCategory === category.slug}
            />
          ))}
        </nav>

        {/* icons */}
        <div className="flex items-center gap-5 text-charcoal/85">
          <Link href="/search" aria-label="Search">
            <Search size={19} />
          </Link>
          <Link href={accountHref} aria-label={accountLabel}>
            <User size={19} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative">
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink text-[10px] font-medium text-ivory">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative">
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink text-[10px] font-medium text-ivory">
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
        <nav className="flex flex-col items-start gap-4 border-t border-charcoal/10 px-6 py-5 text-sm text-charcoal/85 md:hidden">
          {categories.map((category) => (
            <CategoryLink
              key={category.slug}
              category={category}
              isActive={activeCategory === category.slug}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      )}
    </header>
  );
}

// Suspense is required because useSearchParams is used inside a layout-level component.
export default function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarContent />
    </Suspense>
  );
}