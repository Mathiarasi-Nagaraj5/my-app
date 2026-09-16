import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductRail from "../components/home/ProductRail";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";

import { getProducts, getBestsellers } from "@/services/product.service";
import Marquee from "@/components/ui/Marquee";

import connectDB from "@/app/lib/mongodb";
import SiteContent from "@/app/models/SiteContent";

export default async function HomePage() {
  /*
   * Get products for all homepage sections
   */
  const [
    newArrivals,
    bestSellers,
    trending,
  ] = await Promise.all([
    getProducts(
      new URLSearchParams({
        sort: "newest",
      })
    ),

    getBestsellers(),

    getProducts(
      new URLSearchParams({
        sort: "popular",
      })
    ),
  ]);

  /*
   * Get site content
   */
  await connectDB();

  const siteContentDoc = await SiteContent.findOne().lean();

  const siteContent = JSON.parse(
    JSON.stringify(siteContentDoc ?? {})
  );

  return (
    <>
      {/* Hero */}
      <Hero slides={siteContent.heroSlides} />

      {/* Marquee */}
      <Marquee className="bg-pink py-2 text-white">
        <>
          {(siteContent.marquee ?? []).map(
            (text: string, i: number) => (
              <span key={i}>{text}</span>
            )
          )}
        </>
      </Marquee>

      {/* Categories */}
      <CategoryGrid />

      {/* New Arrivals */}
      <ProductRail
        title="New Arrivals"
        products={newArrivals.slice(0, 8)}
        viewAllHref="/shop?sort=newest"
        tone="charcoal-tint"
      />

      {/* Best Sellers */}
      <ProductRail
        title="Best Sellers"
        products={bestSellers.slice(0, 8)}
        viewAllHref="/shop?bestseller=true"
      />

      {/* Trending Now */}
      <ProductRail
        title="Trending Now"
        products={trending.slice(0, 8)}
        viewAllHref="/shop?sort=popular"
        tone="charcoal-tint"
      />

      {/* Other Sections */}
      <WhyChooseUs />

      <Testimonials />
    </>
  );
}