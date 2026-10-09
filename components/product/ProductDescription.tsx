import { Product } from "@/app/lib/types";

export default function ProductDescription({ product }: { product: Product }) {
  const specs: { label: string; value?: string }[] = [
    { label: "Fabric", value: product.material },
    { label: "Fit", value: product.fit },
    { label: "Neck", value: product.neck },
    { label: "Sleeve", value: product.sleeveLength },
    { label: "Pattern", value: product.pattern },
    { label: "Occasion", value: product.occasion },
    {
      label: "Pack of",
      value: product.packOf && product.packOf > 1 ? String(product.packOf) : undefined,
    },
    { label: "Wash care", value: product.washCare },
    ...(product.attributes ?? []),
  ].filter((s) => s.value);

  const highlights = product.highlights ?? [];

  if (specs.length === 0 && highlights.length === 0 && !product.sizeAndFit) return null;

  return (
    <section className="bg-charcoal px-6 py-14">
      <div className="mx-auto max-w-4xl">
        {/* Heading + divider */}
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl font-medium text-pink md:text-3xl">Product Details</h2>
          <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-pink md:w-28" />
            <span className="text-sm leading-none text-pink">✦</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-pink md:w-28" />
          </div>
        </div>

        {highlights.length > 0 && (
          <ul className="mb-8 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-sm leading-relaxed text-ivory/80">
                <span aria-hidden="true" className="mt-0.5 text-xs text-pink">
                  ✦
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}

        {specs.length > 0 && (
          <dl className="grid grid-cols-1 gap-x-10 rounded-2xl border border-ivory/10 bg-ivory/5 px-6 py-3 sm:grid-cols-2">
            {specs.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-ivory/10 py-3 text-sm"
              >
                <dt className="text-ivory/60">{label}</dt>
                <dd className="text-right font-medium text-ivory/90">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {product.sizeAndFit && (
          <p className="mt-8 border-l-2 border-pink bg-ivory/5 px-5 py-4 text-sm leading-relaxed text-ivory/75">
            <span className="font-medium text-pink">Size &amp; fit: </span>
            {product.sizeAndFit}
          </p>
        )}
      </div>
    </section>
  );
}