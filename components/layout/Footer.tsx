import Link from "next/link";
import { Truck, RotateCcw, Wallet, Shirt } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

const FOOTER_LINKS = {
  shop: [
    { label: "t-shirts", href: "/shop?category=t-shirts" },
    { label: "hoodies", href: "/shop?category=hoodies" },
    { label: "pyjamas", href: "/shop?category=pyjamas" },
  ],
  company: [
    { label: "about us", href: "/about" },
    { label: "contact", href: "/contact" },
  ],
  account: [
    { label: "your orders", href: "/orders" },
    { label: "wishlist", href: "/wishlist" },
    { label: "login", href: "/login" },
  ],
};

const TRUST_ITEMS = [
  { icon: Truck, label: "free delivery" },
  { icon: RotateCcw, label: "easy returns" },
  { icon: Wallet, label: "cash on delivery" },
  { icon: Shirt, label: "premium cotton" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-ivory">
      {/* trust strip */}
      <div className="grid grid-cols-2 gap-6 border-b border-ivory/10 px-6 py-8 text-center md:grid-cols-4">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon size={20} className="text-brass" />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* newsletter */}
      <div className="border-b border-ivory/10 px-6 py-10 text-center">
        <p className="mb-1 font-serif text-lg">get updates on new arrivals</p>
        <p className="mb-4 text-xs text-ivory/55">
          be the first to know when we launch new styles.
        </p>
        <form className="mx-auto flex max-w-sm gap-0 overflow-hidden rounded border border-brass">
          <input
            type="email"
            placeholder="your email"
            className="h-10 flex-1 bg-transparent px-3 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
          />
          <Button variant="primary" size="sm" className="rounded-none h-10">
            subscribe
          </Button>
        </form>
      </div>

      {/* link columns */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 text-sm md:grid-cols-4">
        <div>
          <p className="mb-3 font-medium">ELITE SOUL</p>
          <p className="text-xs text-ivory/55 leading-relaxed">
            oversized t-shirts, hoodies and pyjama sets made for everyday
            comfort.
          </p>
        </div>
        <FooterColumn title="shop" links={FOOTER_LINKS.shop} />
        <FooterColumn title="company" links={FOOTER_LINKS.company} />
        <FooterColumn title="account" links={FOOTER_LINKS.account} />
      </div>

      <div className="border-t border-ivory/10 px-6 py-4 text-center text-xs text-ivory/40">
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
      <ul className="flex flex-col gap-2 text-xs text-ivory/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-brass">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}