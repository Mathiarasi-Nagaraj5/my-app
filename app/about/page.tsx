import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      {/* brand story hero */}
      <section className="bg-charcoal px-6 py-16 text-center">
        <p className="mb-3 text-xs tracking-wide text-pink">our story</p>
        <h1 className="mx-auto max-w-xl font-serif text-3xl font-medium leading-snug text-ivory">
          clothes built for real Indian streets, real Indian weather, real
          everyday wear
        </h1>
      </section>

      {/* mission & vision */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-serif text-lg font-medium text-charcoal">
            why we started
          </h2>
          <p className="text-sm leading-relaxed text-charcoal/70">
            we started Elite Soul because good oversized fits shouldn&apos;t
            mean thin fabric or paying premium prices for imported brands.
            we make our own, in India, at fair prices.
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-serif text-lg font-medium text-charcoal">
            what we stand for
          </h2>
          <p className="text-sm leading-relaxed text-charcoal/70">
            heavyweight cotton, honest pricing, and fits that actually look
            good in real life — not just on a model. quality you can feel
            the first time you wear it.
          </p>
        </div>
      </section>

      {/* stats — why our brand */}
      <section className="grid grid-cols-1 gap-6 bg-pink px-6 py-12 text-center sm:grid-cols-3">
        <Stat value="50,000+" label="happy customers" />
        <Stat value="100+" label="styles designed" />
        <Stat value="4.6★" label="average rating" />
      </section>

      {/* collections */}
      <section className="px-6 py-14 text-center">
        <h2 className="mb-6 font-serif text-lg font-medium text-charcoal">
          our collections
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "t-shirts", seed: "about-tshirts" },
            { label: "hoodies", seed: "about-hoodies" },
            { label: "pyjamas", seed: "about-pyjamas" },
          ].map((c) => (
            <div key={c.label} className="relative aspect-[4/3] overflow-hidden rounded">
              <Image
                src={`https://picsum.photos/seed/${c.seed}/500/400`}
                alt={c.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl font-medium text-charcoal">{value}</p>
      <p className="mt-1 text-xs text-charcoal/70">{label}</p>
    </div>
  );
}