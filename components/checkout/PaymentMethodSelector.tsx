"use client";

export type PaymentMethod = "upi" | "card" | "cod";

const OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "upi", label: "UPI (Google Pay, PhonePe, Paytm)" },
  { value: "card", label: "credit / debit card" },
  { value: "cod", label: "cash on delivery" },
];

export default function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}) {
  return (
    <div>
      <p className="mb-3.5 text-lg font-medium text-charcoal">Payment Methods</p>
      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-3 rounded-card px-4 py-3 text-sm text-charcoal ${
              value === opt.value ? "border-2 border-pink" : "border border-charcoal/30"
            }`}
          >
            <input
              type="radio"
              name="payment"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-pink"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}