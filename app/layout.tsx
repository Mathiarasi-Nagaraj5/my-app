import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import { CartProvider } from "./lib/context/CartContext";
import { WishlistProvider } from "./lib/context/WishlistContext";
import { AuthProvider } from "./lib/context/AuthContext";
export const metadata: Metadata = {
  title: "Elite Soul — Oversized T-Shirts, Hoodies & Pyjamas",
  description:
    "Heavyweight cotton t-shirts, hoodies and pyjama sets made for everyday comfort.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ivory font-sans text-charcoal antialiased">
        <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SiteChrome>{children}</SiteChrome>
          </WishlistProvider>
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}