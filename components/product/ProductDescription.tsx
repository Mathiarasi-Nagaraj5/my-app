import { Fingerprint, Ruler, Shirt, Tag, MapPin } from "lucide-react";

const DETAILS = [
  { icon: Fingerprint, text: "240 GSM heavyweight cotton" },
  { icon: Ruler, text: "true oversized, drop-shoulder fit" },
  { icon: Shirt, text: "ribbed crew neck" },
  { icon: Tag, text: "pre-shrunk fabric" },
  { icon: MapPin, text: "made in india" },
];

export default function ProductDescription() {
  return (
    <section className="bg-charcoal px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-5 font-serif text-lg font-medium text-ivory">
          product details
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DETAILS.map(({ icon: Icon, text }) => (
            <p key={text} className="flex items-center gap-2 text-sm text-ivory/75">
              <Icon size={16} className="text-brass" />
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}