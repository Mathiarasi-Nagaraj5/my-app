import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  items: { name: string; image: string; href: string }[];
}

export default function CategoryTiles({ title, items }: Props) {
  return (
    <section className="bg-ivory px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Heading + decorative divider */}
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl text-charcoal md:text-3xl">
            {title}
          </h2>

          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-pink md:w-24" />
            <span className="text-pink text-sm leading-none">✦</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-pink md:w-24" />
          </div>
        </div>

        {/* Round category tiles */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-8 md:gap-x-8">
          {items.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group block w-[calc(33.333%-11px)] max-w-[160px] sm:w-[140px] md:w-[160px]"
            >
              <div className="relative aspect-square overflow-hidden rounded-full bg-charcoal/5 ring-2 ring-transparent ring-offset-4 ring-offset-ivory shadow-md shadow-pink/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-pink group-hover:shadow-xl">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  sizes="160px"
                />
              </div>

              <p className="mt-4 text-center text-sm font-medium capitalize tracking-wide text-charcoal transition-colors duration-200 group-hover:text-pink">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}