import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    label: "oversized t-shirts",
    href: "/shop?category=t-shirts",
    image: "/images/categories/tshirt.jpg",
  },
  {
    label: "hoodies",
    href: "/shop?category=hoodies",
    image: "/images/categories/hoodie.jpg",
  },
  {
    label: "pyjama sets",
    href: "/shop?category=pyjamas",
    image: "/images/categories/pyjama.png",
  },
];

export default function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <h2 className="mb-6 text-center font-serif text-3xl font-medium text-charcoal">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link key={cat.href} href={cat.href} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded bg-charcoal">
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <p className="mt-3 text-center text-lg font-medium text-charcoal">
              {cat.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}