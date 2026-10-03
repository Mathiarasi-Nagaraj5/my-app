import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — Elite Soul",
  description: "Questions about an order, sizing or bulk requirements? Get in touch.",
};

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-pink">
        {label}
      </p>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const address = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
      {/* left: details */}
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-pink">
          Order &amp; customer support
        </p>
        <h1 className="font-serif text-4xl font-medium uppercase leading-tight tracking-wide sm:text-5xl">
          Get in touch
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-charcoal/65">
          Have a question, need help with an order, or want to discuss bulk or
          business requirements? We&apos;re here to help.
        </p>

        <div className="mt-8 space-y-7 border-t border-charcoal/10 pt-8">
          {email && (
            <Detail label="Email support">
              <a
                href={`mailto:${email}`}
                className="text-lg font-medium transition hover:text-pink"
              >
                {email}
              </a>
            </Detail>
          )}
          {phone && (
            <Detail label="Phone / WhatsApp support">
              <a
                href={`tel:${phone}`}
                className="text-lg font-medium transition hover:text-pink"
              >
                {phone}
              </a>
            </Detail>
          )}
          {instagram && (
            <Detail label="Instagram">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium transition hover:text-pink"
              >
                @elitesoul25
              </a>
            </Detail>
          )}
          {address && (
            <Detail label="Business address">
              <p className="text-[15px] leading-relaxed text-charcoal/70">
                {address}
              </p>
            </Detail>
          )}
        </div>
      </div>

      {/* right: form card */}
      <div className="rounded-3xl border border-charcoal/10 bg-white p-6 shadow-sm sm:p-10">
        <ContactForm />
      </div>
    </section>
  );
}