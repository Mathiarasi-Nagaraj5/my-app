import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductRail from "../components/home/ProductRail";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import {
  getNewArrivals,
  getBestsellers,
  getFeatured,
  getTrending,
} from "../lib/data";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />

      <ProductRail
        title="new arrivals"
        products={getNewArrivals()}
        viewAllHref="/shop?sort=newest"
      />

      <ProductRail
        title="best sellers"
        products={getBestsellers()}
        viewAllHref="/shop?sort=bestselling"
        tone="charcoal-tint"
      />

      <ProductRail
        title="featured collection"
        products={getFeatured()}
        viewAllHref="/shop"
      />

      <ProductRail
        title="trending now"
        products={getTrending()}
        viewAllHref="/shop?sort=trending"
        tone="charcoal-tint"
      />

      <WhyChooseUs />
      <Testimonials />
      {/* Newsletter signup already lives in the Footer (components/layout/Footer.tsx),
          so it isn't repeated here to avoid asking twice on the same page. */}
    </>
  );
}