import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import FaqSection from "@/components/faq/FaqSection";

export const metadata: Metadata = {
  title: "About — Elite Soul",
  description:
    "Heavyweight cotton, honest pricing and fits that look good in real life. Find answers to common questions.",
};

interface Collection {
  label: string;
  href: string;
  seed: string;
}

const COLLECTIONS: Collection[] = [
  { label: "T-shirts", href: "/shop?category=t-shirts", seed: "about-tshirts" },
  { label: "Hoodies", href: "/shop?category=hoodies", seed: "about-hoodies" },
  { label: "Pyjamas", href: "/shop?category=pyjamas", seed: "about-pyjamas" },
];

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section className="bg-charcoal px-6 py-20 text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-pink">
          Our story
        </p>
        <h1 className="mx-auto max-w-2xl font-serif text-3xl font-medium leading-snug text-ivory sm:text-4xl">
          Clothes built for real Indian streets, real Indian weather, real
          everyday wear
        </h1>
      </section>

      {/* mission & vision */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 sm:grid-cols-2">
        <div className="rounded-2xl border border-charcoal/10 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-pink">
            Why we started
          </h2>
          <p className="text-[15px] leading-relaxed text-charcoal/70">
            We started Elite Soul because good oversized fits shouldn&apos;t
            mean thin fabric or paying premium prices for imported brands. We
            make our own, in India, at fair prices.
          </p>
        </div>
        <div className="rounded-2xl border border-charcoal/10 bg-white p-7 shadow-sm">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-pink">
            What we stand for
          </h2>
          <p className="text-[15px] leading-relaxed text-charcoal/70">
            Heavyweight cotton, honest pricing, and fits that actually look
            good in real life, not just on a model. Quality you can feel the
            first time you wear it.
          </p>
        </div>
      </section>

      {/* promises */}
      <section className="grid grid-cols-1 gap-8 bg-pink px-6 py-14 text-center sm:grid-cols-3">
        <Promise value="240 GSM" label="Heavyweight premium cotton" />
        <Promise value="7 days" label="Easy, no-questions returns" />
        <Promise value="₹999+" label="Free delivery on orders" />
      </section>

      {/* collections */}
      <section className="px-6 py-16 text-center">
        <h2 className="mb-8 font-serif text-3xl font-medium uppercase tracking-wide">
          Our collections
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src={`https://picsum.photos/seed/${c.seed}/500/400`}
                alt={c.label}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <span className="absolute inset-0 bg-charcoal/35" />
              <span className="absolute inset-x-0 bottom-4 text-sm font-semibold uppercase tracking-[0.2em] text-ivory">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="scroll-mt-24 border-t border-charcoal/10 px-6 py-16"
      >
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-pink/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-pink">
            <HelpCircle size={13} />
            Got questions?
          </span>
          <h2 className="font-serif text-3xl font-medium uppercase leading-tight tracking-wide sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base text-charcoal/65">
            Everything you need to know about our clothes, sizing, delivery and
            returns.
          </p>
        </div>

        <FaqSection />
      </section>

      {/* contact CTA */}
      <section className="border-t border-charcoal/10 px-6 py-14 text-center">
        <p className="font-serif text-2xl">Still need help?</p>
        <p className="mt-2 text-sm text-charcoal/65">
          Our team is happy to answer anything not covered above.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-block rounded-full bg-pink px-7 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Contact us
        </Link>
      </section>
    </>
  );
}

function Promise({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-4xl font-medium text-charcoal">{value}</p>
      <p className="mt-1 text-sm text-charcoal/75">{label}</p>
    </div>
  );
}