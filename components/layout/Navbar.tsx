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

const ICON_LINK =
  "relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 hover:bg-pink/10 hover:text-pink";

const BADGE =
  "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink px-1 text-[10px] font-semibold text-white ring-2 ring-ivory";

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
      // The ::before bar is the animated pink underline.
      className={`relative inline-flex flex-col items-center transition-colors duration-200 hover:text-pink before:absolute before:-bottom-1.5 before:left-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-pink before:transition-transform before:duration-300 hover:before:scale-x-100 after:invisible after:h-0 after:overflow-hidden after:font-bold after:content-[attr(data-label)] ${
        isActive ? "font-bold text-pink before:scale-x-100" : ""
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
  const activeCategory = pathname === "/shop" ? searchParams.get("category") : null;

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
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="shrink-0" aria-label="Elite Soul home">
          <Image src="/images/logo.png" alt="Elite Soul" width={170} height={76} priority />
        </Link>

        {/* desktop links */}
        <nav className="hidden gap-8 font-serif text-lg text-charcoal/85 md:flex [&_a]:first-letter:uppercase">
          {categories.map((category) => (
            <CategoryLink
              key={category.slug}
              category={category}
              isActive={activeCategory === category.slug}
            />
          ))}
        </nav>

        {/* icons */}
        <div className="flex items-center gap-1 text-charcoal/85 sm:gap-2">
          <Link href="/search" aria-label="Search" className={ICON_LINK}>
            <Search size={19} />
          </Link>

          <Link href={accountHref} aria-label={accountLabel} className={ICON_LINK}>
            {user ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink text-sm font-semibold uppercase text-white shadow-sm transition-shadow duration-300 hover:shadow-[0_4px_14px_rgba(236,72,153,0.5)]">
                {user.fullName?.trim().charAt(0) || "U"}
              </span>
            ) : (
              <User size={19} />
            )}
          </Link>

          <Link href="/wishlist" aria-label="Wishlist" className={ICON_LINK}>
            <Heart size={19} />
            {wishlistCount > 0 && <span className={BADGE}>{wishlistCount}</span>}
          </Link>

          <Link href="/cart" aria-label="Cart" className={ICON_LINK}>
            <ShoppingBag size={19} />
            {cartCount > 0 && <span className={BADGE}>{cartCount}</span>}
          </Link>

          {/* mobile menu toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`${ICON_LINK} md:hidden`}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {menuOpen && (
        <nav className="flex flex-col items-start gap-5 border-t border-charcoal/10 bg-ivory px-6 py-6 font-serif text-lg text-charcoal/85 md:hidden [&_a]:first-letter:uppercase">
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