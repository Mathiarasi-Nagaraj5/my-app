import { Truck, RotateCcw, Wallet, Shirt, ShieldCheck, Heart, Star, Package, Sparkles, Gift } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  truck: Truck, return: RotateCcw, wallet: Wallet, shirt: Shirt, shield: ShieldCheck,
  heart: Heart, star: Star, package: Package, sparkles: Sparkles, gift: Gift,
};

export default function WhyChooseUsSection({ items }: { items: { icon: string; title: string; sub: string }[] }) {
  if (items.length === 0) return null;
  return (
    <section className="bg-charcoal px-6 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles;
          return (
            <div key={i} className="flex flex-col items-center text-center">
              <Icon size={26} className="text-pink" />
              <p className="mt-3 text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs text-white/50">{item.sub}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}