import Link from "next/link";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="bg-charcoal px-6 py-20 text-center">
      <p className="mb-4 text-2xl italic tracking-wide text-pink">
        New Arrivals Are Here
      </p>
      <h1 className="mx-auto mb-4 max-w-xl font-serif text-4xl font-medium leading-tight text-ivory md:text-5xl">
        Oversized comfort. built to last.
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sm text-ivory/65">
        soft, heavy-quality cotton t-shirts, hoodies and pyjama sets — made
        for everyday wear.
      </p>
      <Link href="/shop">
        <Button variant="primary" size="lg" font-bold text-lg>
          Shop Now
        </Button>
      </Link>
    </section>
  );
}