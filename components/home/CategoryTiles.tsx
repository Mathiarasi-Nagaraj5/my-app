import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  items: { name: string; image: string; href: string }[];
}

export default function CategoryTiles({ title, items }: Props) {
  return (
    <section className="bg-ivory px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-6 text-center font-serif text-2xl text-charcoal md:text-3xl">{title}</h2>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-5 md:gap-x-6">
          {items.map((c, i) => (
            <Link
              key={i}
              href={c.href}
              className="group block w-[calc(33.333%-11px)] max-w-[140px] sm:w-[130px] md:w-[140px]"
            >
              <div className="relative aspect-square overflow-hidden rounded-full bg-charcoal/5 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="140px"
                />
              </div>
              <p className="mt-2 text-center text-sm capitalize text-charcoal transition-colors duration-200 group-hover:text-pink">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}