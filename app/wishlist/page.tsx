"use client";

import AccountSidebar from "@/components/account/Accountsidebar";
import WishlistCard from "@/components/wishlist/WishlistCard";
import { useWishlist } from "@/app/lib/context/WishlistContext";
import { useCart } from "@/app/lib/context/CartContext";
import {
  getProducts,
} from "@/services/product.service";
export default async function WishlistPage() {
  const products = await getProducts(); // Fetch all products (you may want to filter this based on the wishlist)
  const { productIds, toggle } = useWishlist();
  const { addItem } = useCart();
  const wishlistProducts = products.filter((p) => productIds.includes(p.id));

  const handleMoveToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    addItem({
      id: `${product.id}-default`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: 1,
    });
    toggle(id); // remove from wishlist once moved
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
            your wishlist ({wishlistProducts.length})
          </h1>

          {wishlistProducts.length === 0 ? (
            <p className="text-sm text-charcoal/55">
              you haven&apos;t saved anything yet. items you wishlist will show
              up here.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {wishlistProducts.map((product) => (
                <WishlistCard
                  key={product.id}
                  product={product}
                  onRemove={toggle}
                  onMoveToCart={handleMoveToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}