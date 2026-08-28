export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-charcoal/80">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">Shipping Policy</h1>
      <p className="mb-8 text-xs text-charcoal/50">Last updated: [DATE]</p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 font-medium text-charcoal">1. Delivery Areas</h2>
          <p>
            We currently ship across India, subject to courier serviceability at your pincode. You
            can confirm delivery availability for your area at checkout.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">2. Delivery Charges</h2>
          <p>
            Delivery is <strong>free on orders of ₹999 or more</strong>. Orders below this amount
            incur a flat delivery charge, shown at checkout before you place your order.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">3. Delivery Timelines</h2>
          <p>
            Orders are typically shipped within [X] business days of confirmation, and delivered
            within [X-X] business days depending on your location. You'll receive tracking details by
            email once your order ships.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">4. Order Tracking</h2>
          <p>
            Once shipped, you can track your order's status from your order details page, or directly
            via the courier's tracking link included in your shipping confirmation email.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">5. Contact</h2>
          <p>Questions about your shipment? Reach us at [SUPPORT EMAIL].</p>
        </section>
      </div>

      <p className="mt-10 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        Template — replace bracketed placeholders and have this reviewed by legal counsel before
        publishing.
      </p>
    </div>
  );
}