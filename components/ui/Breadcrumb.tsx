import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string; // omit on the current/last item
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const capitalize = (label: string) =>
    label.length ? label[0].toUpperCase() + label.slice(1) : label;

  return (
    <nav aria-label="Breadcrumb" className="px-6 pt-4 text-md ml-20 text-charcoal/55">
      {items.map((item, i) => (
        <span key={item.label}>
          {item.href ? (
            <Link href={item.href} className="hover:text-pink"  >
              {capitalize(item.label)}
            </Link>
          ) : (
            <span className="text-charcoal/80">{capitalize(item.label)}</span>
          )}
          {i < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}