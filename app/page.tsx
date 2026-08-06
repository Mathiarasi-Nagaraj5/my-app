import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductRail from "../components/home/ProductRail";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";

import {
  getProducts,
  getBestsellers,
} from "@/services/product.service";
import Marquee from "@/components/ui/Marquee";

export default async function HomePage() {
  const [
    newArrivals,
    bestSellers,
    trending,
  ] = await Promise.all([
    getProducts(new URLSearchParams({ sort: "newest" })),
    getBestsellers(),
    getProducts(new URLSearchParams({ sort: "rating" })),
    getProducts(new URLSearchParams({ sort: "popular" })),
  ]);

  return (
    <>
      <Hero />
<Marquee className="bg-pink py-2 text-white">
  <>
    <span>✨ Free Shipping Above ₹999</span>
    <span>💖 Premium Quality</span>
    <span>🚚 Fast Delivery</span>
    <span>🎁 New Collection Available</span>
  </>
</Marquee>
      <CategoryGrid />

      <ProductRail
        title="New Arrivals"
        products={newArrivals.at(0) ? newArrivals.slice(0, 3) : []}
        viewAllHref="/shop?sort=newest"
           tone="charcoal-tint"
      />

      <ProductRail
        title="Best Sellers"
        products={bestSellers.at(0) ? bestSellers.slice(0, 3) : []}
        viewAllHref="/shop?bestseller=true"
     
      />


      <ProductRail
        title="Trending Now"
        products={trending.at(0) ? trending.slice(0, 3) : []}
        viewAllHref="/shop?sort=popular"
        tone="charcoal-tint"
      />


      <Testimonials />
    </>
  );
}