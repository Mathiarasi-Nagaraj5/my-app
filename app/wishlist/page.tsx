"use client";

import { useEffect, useState } from "react";
import AccountSidebar from "../../components/account/AccountSidebar";
import WishlistCard from "../../components/wishlist/WishlistCard";
import { useWishlist } from "../../app/lib/context/WishlistContext";
import { useCart } from "../../app/lib/context/CartContext";
import { getProducts } from "../../services/product.service";
import RequireAuth from "../../components/auth/RequireAuth";

export default function WishlistPage() {
  const { productIds, toggle } = useWishlist();
  const { addItem } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const wishlistProducts = products.filter((p) => productIds.includes(p.id));

  const handleMoveToCart = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    addItem({
      id: `${product._id}-default`,
      productId: product._id,
      slug: product.slug,
      name: product.name,
      imageUrls: product.imageUrls,
      price: product.price,
      quantity: 1,
    });
    toggle(id);
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
          <AccountSidebar />

          <div>
            <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
              Your Wishlist ({wishlistProducts.length})
            </h1>

            {loading ? (
              <p className="text-lg text-charcoal/55">loading your wishlist...</p>
            ) : wishlistProducts.length === 0 ? (
              <p className="text-lg text-charcoal/55">
                You haven&apos;t saved anything yet. items you wishlist will show
                up here.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {wishlistProducts.map((product) => (
                  <WishlistCard
                    key={product._id}
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
    </RequireAuth>
  );
}