import Link from "next/link";
import {
  Truck,
  RotateCcw,
  Wallet,
  Shirt,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "../ui/Button";

interface FooterLink {
  label: string;
  href: string;
}

interface TrustItem {
  icon: LucideIcon;
  title: string;
  note: string;
}

const EXPLORE_LINKS: FooterLink[] = [
  { label: "T-shirts", href: "/shop?category=t-shirts" },
  { label: "Hoodies", href: "/shop?category=hoodies" },
  { label: "Pyjamas", href: "/shop?category=pyjamas" },
  { label: "Your orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Login", href: "/login" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Policy", href: "/policy" },
  { label: "Contact", href: "/contact" },
];

const TRUST_ITEMS: TrustItem[] = [
  { icon: Truck, title: "Free delivery", note: "On Online payments" },
  { icon: RotateCcw, title: "Easy returns", note: "7-day no-questions returns" },
  { icon: Wallet, title: "Cash on delivery", note: "Pay when it reaches you" },
  { icon: Shirt, title: "Premium cotton", note: "240 GSM heavyweight fabric" },
];

export default function Footer() {
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const contactAddress = process.env.NEXT_PUBLIC_CONTACT_ADDRESS;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <footer className="border-t border-charcoal/10 bg-ivory font-sans text-charcoal">
      {/* newsletter */}
      <div className="border-b border-charcoal/10 px-6 py-10 text-center">
        <p className="mb-1 font-serif text-2xl">Get updates on new arrivals</p>
        <p className="mb-4 text-sm text-charcoal/60">
          Be the first to know when we launch new styles.
        </p>
        <form className="mx-auto flex max-w-sm overflow-hidden rounded border border-pink bg-white">
          <input
            type="email"
            placeholder="your email"
            aria-label="Email address"
            className="h-10 flex-1 bg-transparent px-3 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none"
          />
          <Button variant="primary" size="lg" className="h-10 rounded-none">
            Subscribe
          </Button>
        </form>
      </div>

      {/* main columns */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-24 pt-14 sm:grid-cols-2 lg:grid-cols-4 lg:pb-14">
        {/* brand */}
        <div>
          <p className="font-serif text-3xl font-semibold uppercase tracking-[0.18em] text-pink">
            Elite Soul
          </p>
          <p className="mt-4 text-sm font-medium text-charcoal/60">
            Heavyweight comfort <span className="mx-1 text-pink">•</span> Everyday style
          </p>

          <p className="mt-8 text-sm leading-relaxed text-charcoal/60">
            © {new Date().getFullYear()} Elite Soul.
            <br />
            All rights reserved.
          </p>

          <ul className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {LEGAL_LINKS.map((link, i) => (
              <li key={link.href} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden="true" className="text-pink">
                    •
                  </span>
                )}
                <Link href={link.href} className="transition hover:text-pink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* explore */}
        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-pink">
            Explore
          </h3>
          <ul className="flex flex-col gap-3 text-[15px]">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-pink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* connect */}
        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-pink">
            Connect
          </h3>
          <div className="flex flex-col gap-3 text-[15px]">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 transition hover:text-pink"
              >
                <Mail size={15} className="shrink-0 text-pink" />
                {contactEmail}
              </a>
            )}
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-2 transition hover:text-pink"
              >
                <Phone size={15} className="shrink-0 text-pink" />
                {contactPhone}
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition hover:text-pink"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-pink"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
            )}
            {contactAddress && (
              <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed text-charcoal/60">
                <MapPin size={15} className="mt-0.5 shrink-0 text-pink" />
                {contactAddress}
              </p>
            )}
          </div>
        </div>

        {/* trust card */}
        <div>
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-pink">
            Why Elite Soul
          </h3>
          <div className="rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm">
            <ul className="flex flex-col gap-4">
              {TRUST_ITEMS.map(({ icon: Icon, title, note }) => (
                <li key={title} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink/10">
                    <Icon size={17} className="text-pink" />
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-medium">{title}</span>
                    <span className="text-xs text-charcoal/55">{note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}