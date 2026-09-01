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
  const [newArrivals, bestSellers, trending] = await Promise.all([
    getProducts(new URLSearchParams({ sort: "newest" })),
    getBestsellers(),
    getProducts(new URLSearchParams({ sort: "rating" })),
    getProducts(new URLSearchParams({ sort: "popular" })),
  ]);

  await connectDB();
  const siteContentDoc = await SiteContent.findOne().lean();
  const siteContent = JSON.parse(JSON.stringify(siteContentDoc ?? {}));

  return (
    <>
      {/* Hero needs `slides={siteContent.heroSlides}` and TopBar (rendered
          wherever it currently lives, likely in a layout/Navbar, not this
          page) needs `items={siteContent.topBar}` — see notes below. */}
      <Hero slides={siteContent.heroSlides} />

      <Marquee className="bg-pink py-2 text-white">
        <>
          {(siteContent.marquee ?? []).map((text: string, i: number) => (
            <span key={i}>{text}</span>
          ))}
        </>
      </Marquee>

      <CategoryGrid />

      <ProductRail
        title="New Arrivals"
        products={newArrivals.at(0) ? newArrivals.slice(0, 4) : []}
        viewAllHref="/shop?sort=newest"
        tone="charcoal-tint"
      />

      <ProductRail
        title="Best Sellers"
        products={bestSellers.at(0) ? bestSellers.slice(0, 4) : []}
        viewAllHref="/shop?bestseller=true"
      />

      <ProductRail
        title="Trending Now"
        products={trending.at(0) ? trending.slice(0, 4) : []}
        viewAllHref="/shop?sort=popular"
        tone="charcoal-tint"
      />

      <Testimonials />
    </>
  );
}