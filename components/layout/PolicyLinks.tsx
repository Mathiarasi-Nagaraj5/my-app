import Link from "next/link";

const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund & Return Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

interface PolicyLinksProps {
  className?: string;
  linkClassName?: string;
}

export default function PolicyLinks({ className = "", linkClassName = "" }: PolicyLinksProps) {
  return (
    <nav className={className}>
      {POLICY_LINKS.map((link, i) => (
        <span key={link.href}>
          <Link href={link.href} className={linkClassName || "hover:underline"}>
            {link.label}
          </Link>
          {i < POLICY_LINKS.length - 1 && <span className="mx-2 text-charcoal/30">·</span>}
        </span>
      ))}
    </nav>
  );
}