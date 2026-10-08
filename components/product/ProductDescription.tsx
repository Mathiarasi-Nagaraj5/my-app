import { Product } from "@/app/lib/types";

export default function ProductDescription({ product }: { product: Product }) {
  const specs: { label: string; value?: string }[] = [
    { label: "Fabric", value: product.material },
    { label: "Fit", value: product.fit },
    { label: "Neck", value: product.neck },
    { label: "Sleeve", value: product.sleeveLength },
    { label: "Pattern", value: product.pattern },
    { label: "Occasion", value: product.occasion },
    { label: "Pack of", value: product.packOf && product.packOf > 1 ? String(product.packOf) : undefined },
    { label: "Wash care", value: product.washCare },
    ...(product.attributes ?? []),
  ].filter((s) => s.value);

  const highlights = product.highlights ?? [];

  if (specs.length === 0 && highlights.length === 0 && !product.sizeAndFit) return null;

  return (
    <section className="bg-charcoal px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-5 font-serif text-lg font-medium text-ivory">Product Details</h2>

        {highlights.length > 0 && (
          <ul className="mb-6 list-disc space-y-1.5 pl-5 text-sm text-ivory/75 marker:text-pink">
            {highlights.map((h) => <li key={h}>{h}</li>)}
          </ul>
        )}

        {specs.length > 0 && (
          <dl className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
            {specs.map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-ivory/10 pb-2 text-sm">
                <dt className="text-ivory/55">{label}</dt>
                <dd className="text-right text-ivory/90">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {product.sizeAndFit && (
          <p className="mt-6 text-sm text-ivory/65">
            <span className="font-medium text-ivory/85">Size &amp; fit: </span>
            {product.sizeAndFit}
          </p>
        )}
      </div>
    </section>
  );
}