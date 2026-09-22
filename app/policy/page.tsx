import connectDB from "@/app/lib/mongodb";
import SiteContent from "@/app/models/SiteContent";
import { marked } from "marked";

// Seeded as a fallback ONLY if the admin hasn't written anything yet —
// once real content exists in SiteContent.policy, this default is never
// used. Keeps the page from looking broken/empty on first deploy.
const DEFAULT_POLICY_MARKDOWN = `
## Shipping & Delivery

- Free delivery on orders of ₹999 or more.
- Orders below ₹999 incur a flat delivery charge, shown at checkout.
- Cash on Delivery (COD) orders carry an additional ₹15 convenience fee.
- Orders are typically shipped within a few business days and delivered within a week, depending on your location.

## Cancellations

Orders can be cancelled free of charge any time before they are shipped. Once shipped, you may request a return instead once it's delivered.

## Returns & Refunds

- Returns are accepted within **7 days of delivery**.
- To request a return, visit your order details page and select "Return order."
- Refunds for prepaid orders are issued automatically and typically reflect within 5-7 business days.
- Cash on Delivery refunds are processed via bank transfer.

## Payments

All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.

## Privacy

We collect your name, phone number, email, and address to process and deliver your order, and never sell your personal information to third parties.

## Contact Us

Reach out to us with any questions about an order.
`;

export default async function PolicyPage() {
  await connectDB();
  const siteContentDoc = await SiteContent.findOne().lean();
  const siteContent = JSON.parse(JSON.stringify(siteContentDoc ?? {}));
  console.log("Fetched site content for policy page:", siteContent);
  const markdown =
    typeof siteContent.policy === "string" && siteContent.policy.trim()
      ? siteContent.policy
      : DEFAULT_POLICY_MARKDOWN;

  const html = await marked.parse(markdown);
  console.log("Rendering PolicyPage with HTML content:", html);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-sm text-charcoal/80">
      <h1 className="mb-2 font-serif text-2xl font-medium text-charcoal">
        Policies & Terms
      </h1>
      <p className="mb-8 text-xs text-charcoal/50">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div
        className="policy-content space-y-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}