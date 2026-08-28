export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-charcoal/80">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">Refund & Return Policy</h1>
      <p className="mb-8 text-xs text-charcoal/50">Last updated: [DATE]</p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 font-medium text-charcoal">1. Cancellations</h2>
          <p>
            Orders can be cancelled free of charge any time before they are shipped. Once an order has
            shipped, it can no longer be cancelled — you may request a return instead once it's
            delivered.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">2. Returns</h2>
          <p>
            Returns are accepted within <strong>7 days of delivery</strong>. To request a return,
            visit your order details page and select "Return order," choosing a reason from the
            options provided. Our team reviews each request and will notify you once it's approved or
            declined.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">3. Refunds</h2>
          <p>
            Once a return is approved and the item is received back, refunds for prepaid (UPI/Card)
            orders are issued automatically to your original payment method and typically reflect
            within <strong>5-7 business days</strong>. For Cash on Delivery orders, refunds are
            processed via bank transfer — our team will contact you to arrange this.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">4. Non-Returnable Items</h2>
          <p>
            Items that are damaged due to misuse, or returned without original packaging/tags, may not
            be eligible for a return.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">5. Contact</h2>
          <p>Questions about a return or refund? Reach us at [SUPPORT EMAIL].</p>
        </section>
      </div>

      <p className="mt-10 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        Template — replace bracketed placeholders and have this reviewed by legal counsel before
        publishing.
      </p>
    </div>
  );
}