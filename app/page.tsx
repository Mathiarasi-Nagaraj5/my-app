import Hero from "../components/home/Hero";
import CategoryGrid from "../components/home/CategoryGrid";
import ProductRail from "../components/home/ProductRail";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import InstagramFeed from "../components/home/InstagramFeed";
import { getProducts, getBestsellers } from "@/services/product.service";
import Marquee from "@/components/ui/Marquee";
import ProductTab from "../components/home/ProductTab";
import connectDB from "@/app/lib/mongodb";
import SiteContent from "@/app/models/SiteContent";
import CategoryTiles from "../components/home/CategoryTiles";
import WhyChooseUsSection from "../components/home/WhyChooseUsSection";
import { withHomeDefaults } from "@/app/lib/homeDefaults";
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
  console.log("siteContent", siteContent);

  const home = withHomeDefaults(siteContent.home);

const tabData = {
  new: { products: newArrivals, href: "/shop?sort=newest" },
  best: { products: bestSellers, href: "/shop?bestseller=true" },
  trending: { products: trending, href: "/shop?sort=popular" },
};
const tabs = home.products.tabs
  .filter((t) => t.enabled)
  .map((t) => ({
    id: t.id,
    label: t.label,
    products: tabData[t.id].products.slice(0, t.count),
    viewAllHref: tabData[t.id].href,
  }));

  console.log(home,'homeee')
  return (
 <>
  <Hero slides={siteContent.heroSlides} />

  <Marquee className="bg-pink py-2 text-white">
    <>{(siteContent.marquee ?? []).map((text: string, i: number) => <span key={i}>{text}</span>)}</>
  </Marquee>

  {home.categories.enabled &&
    (home.categories.items.length > 0 ? (
      <CategoryTiles title={home.categories.title} items={home.categories.items} />
    ) : (
      <CategoryGrid />
    ))}

  {home.products.enabled && <ProductTab tabs={tabs} />}


    {home.instagram.enabled  && (
    <InstagramFeed handle={siteContent.instagramHandle} posts={siteContent.instagramPosts} />
  )}
    {home.why.enabled && <WhyChooseUsSection items={home.why.items} />}

{/* 
  {home.testimonials.enabled && (
    // <Testimonials
    //   title={home.testimonials.title}
    //   minRating={home.testimonials.minRating}
    //   limit={home.testimonials.limit}
    // />
  )} */}


</>
  );
}