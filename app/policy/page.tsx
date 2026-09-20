export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-charcoal/80">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">
        Policies & Terms
      </h1>
      <p className="mb-8 text-xs text-charcoal/50">Last updated: Sep 9</p>

      <div className="space-y-8">
        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Shipping & Delivery</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Free delivery on online orders .</li>
            <li>Cash on Delivery (COD) orders carry an additional ₹15 convenience fee.</li>
            <li>Orders are typically shipped within 5-7 business days and delivered within [X-X] business days, depending on your location.</li>
            <li>You'll receive tracking details by email once your order ships, and can track it anytime from your order details page.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Cancellations</h2>
          <p>
            Orders can be cancelled free of charge any time before they are shipped. Once an order
            has shipped, it can no longer be cancelled — you may request a return instead once it's
            delivered.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Returns & Refunds</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Returns are accepted within <strong>7 days of delivery</strong>. To request a return,
              visit your order details page and select "Return order," choosing a reason from the
              options provided.
            </li>
            <li>Our team reviews each request and will notify you once it's approved or declined.</li>
            <li>
              Once a return is approved and the item is received back, refunds for prepaid (UPI/Card)
              orders are issued automatically to your original payment method and typically reflect
              within <strong>5-7 business days</strong>.
            </li>
            <li>
              For Cash on Delivery orders, refunds are processed via bank transfer — our team will
              contact you to arrange this.
            </li>
            <li>
              Items that are damaged due to misuse, or returned without original packaging/tags, may
              not be eligible for a return.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Payments</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless
            stated otherwise. Payments are processed via Razorpay (UPI/Card) or Cash on Delivery,
            where available. We reserve the right to correct pricing errors and to cancel orders
            placed at an incorrect price, with a full refund issued in such cases.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Privacy</h2>
          <p>
            When you place an order, we collect your name, phone number, email address, and shipping
            address to process and deliver it. We do not store your payment card or UPI details —
            payments are processed securely by Razorpay. We share order and shipping details with
            Razorpay (payments) and Shiprocket (logistics) solely to fulfil your order, and never
            sell your personal information to third parties. You may request access to, correction
            of, or deletion of your personal information by contacting us below.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Terms of Use</h2>
          <p>
            By placing an order on Elite Soul's website, you agree to these terms. We are not liable
            for delays or failures caused by circumstances beyond our reasonable control, including
            courier delays or third-party service outages. These terms are governed by the laws of
            India, with jurisdiction in Tiruppur, Tamil Nadu.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-charcoal">Contact Us</h2>
          <p className="space-y-1">
            <span className="block">Phone: {process.env.NEXT_PUBLIC_CONTACT_NUMBER}</span>
            <span className="block">Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL}</span>
            <span className="block">Address: {process.env.NEXT_PUBLIC_CONTACT_ADDRESS}, Tiruppur, Tamil Nadu</span>
          </p>
        </section>
      </div>

    </div>
  );
}