"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface WishlistContextValue {
  productIds: string[];
  toggle: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const STORAGE_KEY = "elite-soul-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setProductIds(parsed.filter((id): id is string => typeof id === "string" && id.trim() !== ""));
      }
    }
  } catch {
    setProductIds([]);
  }

  setHydrated(true);
}, []);


  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  }, [productIds, hydrated]);


  const toggle = (id: string) => {
    if (!id) return;

    setProductIds((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };
  const isWishlisted = (id: string) => productIds.includes(id);

  return (
    <WishlistContext.Provider
      value={{ productIds, toggle, isWishlisted, count: productIds.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}