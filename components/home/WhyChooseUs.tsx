import { Truck, RotateCcw, Wallet, Shirt } from "lucide-react";

const REASONS = [
  {
    icon: Truck,
    title: "free delivery",
    desc: "on all orders above ₹999",
  },
  {
    icon: RotateCcw,
    title: "easy returns",
    desc: "7-day no-questions returns",
  },
  {
    icon: Wallet,
    title: "cash on delivery",
    desc: "pay when it reaches you",
  },
  {
    icon: Shirt,
    title: "premium cotton",
    desc: "240 GSM heavyweight fabric",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-charcoal px-6 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center md:grid-cols-4">
        {REASONS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center gap-2">
            <Icon size={26} className="text-brass" />
            <p className="text-sm font-medium text-ivory">{title}</p>
            <p className="text-xs text-ivory/55">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}