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
      {/* Heading + divider */}
      <div className="mb-12 text-center">
        <h2 className="font-serif text-3xl font-medium text-charcoal">
          Shop by Category
        </h2>

        <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-pink md:w-28" />
          <span className="text-sm leading-none text-pink">✦</span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-pink md:w-28" />
        </div>
      </div>

      {/* Round tiles */}
      <div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group block w-full max-w-[180px] focus:outline-none"
          >
            <div className="relative aspect-square overflow-hidden rounded-full bg-charcoal/5 shadow-md shadow-pink/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(236,72,153,0.45)] group-focus-visible:shadow-[0_8px_24px_rgba(236,72,153,0.45)]">
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="180px"
              />
            </div>
            <p className="mt-4 text-center font-serif text-base font-medium capitalize text-charcoal transition-colors duration-200 group-hover:text-pink">
              {cat.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}