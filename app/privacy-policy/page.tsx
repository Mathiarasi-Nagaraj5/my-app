export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-charcoal/80">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">Privacy Policy</h1>
      <p className="mb-8 text-xs text-charcoal/50">Last updated: [DATE]</p>

      <div className="space-y-6">
        <section>
          <h2 className="mb-2 font-medium text-charcoal">1. Information We Collect</h2>
          <p>
            When you place an order, we collect your name, phone number, email address, and shipping
            address to process and deliver your order. We do not store your payment card or UPI
            details — payments are processed securely by Razorpay, and we never see or store your
            payment credentials.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">2. How We Use Your Information</h2>
          <p>
            Your information is used to process orders, arrange delivery via our courier partners,
            send order confirmations and updates, and respond to customer support requests. We do not
            sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">3. Third-Party Services</h2>
          <p>
            We share order and shipping details with Razorpay (payments) and Shiprocket (logistics)
            solely to fulfil your order. Each of these providers has its own privacy policy governing
            how they handle your data.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">4. Data Retention</h2>
          <p>
            We retain order records for as long as necessary to comply with tax and accounting
            obligations under Indian law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information by
            contacting us at [SUPPORT EMAIL].
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-medium text-charcoal">6. Contact</h2>
          <p>Questions about this policy? Reach us at [SUPPORT EMAIL] or [SUPPORT PHONE].</p>
        </section>
      </div>

      <p className="mt-10 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
        Template — replace bracketed placeholders and have this reviewed by legal counsel before
        publishing.
      </p>
    </div>
  );
}