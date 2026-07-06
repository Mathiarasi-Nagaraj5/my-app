import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string; // omit on the current/last item
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="px-6 pt-4 text-xs text-charcoal/55">
      {items.map((item, i) => (
        <span key={item.label}>
          {item.href ? (
            <Link href={item.href} className="hover:text-brass">
              {item.label}
            </Link>
          ) : (
            <span className="text-charcoal/80">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}