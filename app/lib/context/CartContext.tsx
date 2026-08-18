"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CartItem } from "@/app/lib/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  promoCode: string | null;
  setPromoCode: (code: string | null) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "elite-soul-cart";
const PROMO_STORAGE_KEY = "elite-soul-promo";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCodeState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // load from localStorage once, on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
      const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (storedPromo) setPromoCodeState(storedPromo);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // persist cart on every change (after initial hydration)
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // persist promo separately so clearing the cart doesn't silently wipe it
  // mid-navigation, and vice versa
  useEffect(() => {
    if (!hydrated) return;
    if (promoCode) localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
    else localStorage.removeItem(PROMO_STORAGE_KEY);
  }, [promoCode, hydrated]);

  const addItem: CartContextValue["addItem"] = (newItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: newItem.quantity ?? 1 }];
    });
  };

  const updateQuantity = (id: string, quantity: number) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => {
    setItems([]);
    setPromoCodeState(null); // an applied coupon shouldn't survive into the next, unrelated cart
  };

  const setPromoCode = (code: string | null) => setPromoCodeState(code);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        hydrated,
        promoCode,
        setPromoCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}