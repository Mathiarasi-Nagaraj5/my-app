export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-charcoal/80">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">Terms & Conditions</h1>
      <p className="mb-8 text-xs text-charcoal/50">Last updated: [DATE]</p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 font-medium text-charcoal">1. Acceptance of Terms</h2>
          <p>
            By placing an order on [BUSINESS NAME]'s website, you agree to these Terms & Conditions.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">2. Orders & Pricing</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless
            stated otherwise. We reserve the right to correct pricing errors and to cancel orders
            placed at an incorrect price, with a full refund issued in such cases.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">3. Payments</h2>
          <p>
            Payments are processed via Razorpay (UPI/Card) or Cash on Delivery, where available. For
            prepaid orders, your order is confirmed only after successful payment verification.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">4. Shipping</h2>
          <p>
            Orders are shipped via our courier partners once confirmed. Delivery timelines are
            estimates and may vary based on serviceability and courier availability. See our{" "}
            <a href="/shipping-policy" className="text-pink underline">
              Shipping Policy
            </a>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">5. Cancellations, Returns & Refunds</h2>
          <p>
            See our{" "}
            <a href="/refund-policy" className="text-pink underline">
              Refund & Return Policy
            </a>{" "}
            for cancellation windows, return eligibility, and refund timelines.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">6. Limitation of Liability</h2>
          <p>
            [BUSINESS NAME] is not liable for delays or failures caused by circumstances beyond our
            reasonable control, including courier delays, natural disasters, or third-party service
            outages.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">7. Governing Law</h2>
          <p>These terms are governed by the laws of India, with jurisdiction in [CITY], Tamil Nadu.</p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">8. Contact</h2>
          <p>[SUPPORT EMAIL] · [SUPPORT PHONE]</p>
        </section>
      </div>

      <p className="mt-10 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        Template — replace bracketed placeholders and have this reviewed by legal counsel before
        publishing.
      </p>
    </div>
  );
}