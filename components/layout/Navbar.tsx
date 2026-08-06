"use client";

import Link from "next/link";
import { useState,useEffect } from "react";
import { Search, User, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useCart } from "@/app/lib/context/CartContext";
import { useWishlist } from "@/app/lib/context/WishlistContext";
import { useAuth } from "../../app/lib/context/AuthContext";


interface Category {
  name: string;
  slug: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [categories, setCategories] = useState<Category[]>([]); // State to hold categories
  const { user } = useAuth();

  // logged in → account icon goes to the profile page
  // logged out → goes to login
  const accountHref = user ? "/profile" : "/login";
  const accountLabel = user ? `Account — ${user.name}` : "Login";
   
  useEffect(() => {
    fetch("/api/categories").then((res) => res.json()).then((data) => {
      setCategories(data); // Assuming the API returns an array of category objects with a 'name' property
    }).catch((err) => {
      console.error("Failed to fetch categories:", err);
    });
  }, []);

  return (
    <header className="bg-ivory">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-3xl font-stretch-50% tracking-wide text-charcoal">
          ELITE SOUL
        </Link>

        {/* desktop links */}
        <nav className="hidden gap-7 text-lg text-charcoal/85 md:flex">
          
          {categories.map((category) => (
            <Link key={category.name} href={`/shop?category=${encodeURIComponent(category.slug)}`} className="hover:text-pink">
              {category.name}  
            </Link>
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
        <nav className="flex flex-col gap-4 border-t border-charcoal/10 px-6 py-5 text-sm text-charcoal/85 md:hidden">
         
            {categories.map((category) => (
           <Link
              key={category.name}
              href={`/shop?category=${encodeURIComponent(category.slug)}`}
              onClick={() => setMenuOpen(false)}
              className="hover:text-pink"
            >
              {category.name}  
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}