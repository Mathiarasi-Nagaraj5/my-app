import Image from "next/image";
import Link from "next/link";

interface Props {
  title: string;
  items: { name: string; image: string; href: string }[];
}

export default function CategoryTiles({ title, items }: Props) {
  return (
    <section className="bg-ivory px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center font-serif text-3xl text-charcoal">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((c, i) => (
            <Link key={i} href={c.href} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded bg-charcoal/5">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <p className="mt-3 text-center text-lg capitalize text-charcoal">{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}