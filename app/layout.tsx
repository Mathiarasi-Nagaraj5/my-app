import type { Metadata } from "next";
import "./globals.css";
import SiteChrome from "@/components/layout/SiteChrome";
import ChatWidget from "@/components/ui/ChatWidget"; // NEW
import { CartProvider } from "./lib/context/CartContext";
import { WishlistProvider } from "./lib/context/WishlistContext";
import { AuthProvider } from "./lib/context/AuthContext";
import connectDB from "@/app/lib/mongodb";
import SiteContent from "@/app/models/SiteContent";
import { ModalProvider } from "@/components/ui/ModalProvider";

export const metadata: Metadata = {
  title: "Elite Soul — Oversized T-Shirts, Hoodies & Pyjamas",
  description:
    "Heavyweight cotton t-shirts, hoodies and pyjama sets made for everyday comfort.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectDB();

  const siteContentDoc = await SiteContent.findOne().lean();

  const siteContent = JSON.parse(JSON.stringify(siteContentDoc ?? {}));

  return (
    <html lang="en">
      <body className="bg-ivory font-sans text-charcoal antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ModalProvider>
                <SiteChrome topBar={siteContent.topBar}>{children}</SiteChrome>
                <ChatWidget /> {/* NEW */}
              </ModalProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>

        
      </body>
    </html>
  );
}