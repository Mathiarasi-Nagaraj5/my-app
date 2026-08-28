import Link from "next/link";
import { Truck, RotateCcw, Wallet, Shirt } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import PolicyLinks from "./PolicyLinks";

const FOOTER_LINKS = {
  Shop: [
    { label: "T-shirts", href: "/shop?category=t-shirts" },
    { label: "Hoodies", href: "/shop?category=hoodies" },
    { label: "Pyjamas", href: "/shop?category=pyjamas" },
  ],
  Company: [
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Account: [
    { label: "Your orders", href: "/orders" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Login", href: "/login" },
  ],
};

const TRUST_ITEMS = [
  { icon: Truck, label: "Free delivery" },
  { icon: RotateCcw, label: "Easy returns" },
  { icon: Wallet, label: "Cash on delivery" },
  { icon: Shirt, label: "Premium cotton" },
];
const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund & Return Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];


export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      {/* trust strip */}
      <div className="grid grid-cols-2 gap-6 border-b border-ivory/10 px-6 py-8 text-center md:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon size={20} className="text-pink" />
            <span className="text-md">{label}</span>
          </div>
        ))}
      </div>

      {/* newsletter */}
      <div className="border-b border-ivory/10 px-6 py-10 text-center">
        <p className="mb-1 font-serif text-lg">Get updates on new arrivals</p>
        <p className="mb-4 text-md text-ivory/55">
          Be the first to know when we launch new styles.
        </p>
        <form className="mx-auto flex max-w-sm gap-0 overflow-hidden rounded border border-pink">
          <input
            type="email"
            placeholder="your email"
            className="h-10 flex-1 bg-transparent px-3 text-lg text-ivory placeholder:text-ivory/40 focus:outline-none"
          />
          <Button variant="primary" size="lg" className="rounded-none h-10">
            Subscribe
          </Button>
        </form>
      </div>

      {/* link columns */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 text-sm md:grid-cols-4">
        {/* <div>
          <p className="mb-3 font-medium">ELITE SOUL</p>
          <p className="text-sm text-ivory/55 leading-relaxed">
            Oversized t-shirts, hoodies and pyjama sets made for everyday
            comfort.
          </p>
        </div> */}
        <FooterColumn title="Shop" links={FOOTER_LINKS.Shop} />
        <FooterColumn title="Company" links={FOOTER_LINKS.Company} />
        <FooterColumn title="Account" links={FOOTER_LINKS.Account} />
        <FooterColumn title="Policies" links={POLICY_LINKS} />
      </div>

      <div className="border-t border-ivory/10 px-6 py-4 text-center text-sm text-ivory/40">
        © {new Date().getFullYear()} Elite Soul. All rights reserved.

      </div>

    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-3 font-medium">{title}</p>
      <ul className="flex flex-col gap-2 text-sm text-ivory/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-pink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}