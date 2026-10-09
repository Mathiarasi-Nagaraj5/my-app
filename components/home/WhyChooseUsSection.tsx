import type { ElementType } from "react";
import {
  Truck,
  RotateCcw,
  Wallet,
  Shirt,
  ShieldCheck,
  Heart,
  Star,
  Package,
  Sparkles,
  Gift,
} from "lucide-react";

const ICONS: Record<string, ElementType> = {
  truck: Truck,
  return: RotateCcw,
  wallet: Wallet,
  shirt: Shirt,
  shield: ShieldCheck,
  heart: Heart,
  star: Star,
  package: Package,
  sparkles: Sparkles,
  gift: Gift,
};

export default function WhyChooseUsSection({
  items,
}: {
  items: { icon: string; title: string; sub: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="bg-charcoal px-6 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-0 md:divide-x md:divide-white/10">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles;
          return (
            <div key={i} className="group flex flex-col items-center px-4 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-pink/40 bg-pink/10 text-pink transition-all duration-300 group-hover:-translate-y-1 group-hover:border-pink group-hover:bg-pink group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(236,72,153,0.45)]">
                <Icon size={24} strokeWidth={1.75} />
              </span>
              <p className="mt-4 font-serif text-base font-medium text-white">{item.title}</p>
              <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-white/60">{item.sub}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}