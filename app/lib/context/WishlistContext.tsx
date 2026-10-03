"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface WishlistContextValue {
  productIds: string[];
  toggle: (id: string, productName?: string) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const STORAGE_KEY = "elite-soul-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
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

  // `productName` is optional — only needed to fire the WhatsApp
  // notification when an item is ADDED. A caller that doesn't have the
  // name handy (or is removing, not adding) can omit it; the notification
  // simply won't fire in that case.
  const toggle = (id: string, productName?: string) => {
    if (!id) return;

    setProductIds((prev) => {
      const alreadyWishlisted = prev.includes(id);

      if (!alreadyWishlisted && productName && user?.id) {
        fetch("/api/notifications/wishlist-added", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, productName }),
        }).catch(() => {
          /* notification is non-critical — swallow network errors */
        });
      }

      return alreadyWishlisted ? prev.filter((p) => p !== id) : [...prev, id];
    });
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