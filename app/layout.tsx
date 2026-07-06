import type { Metadata } from "next";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/context/CartContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";

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
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </body>
    </html>
  );
}