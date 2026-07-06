interface QuantityStepperProps {
  quantity: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 10,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded border border-charcoal">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={quantity <= min}
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="flex h-8 w-8 items-center justify-center text-charcoal disabled:opacity-30"
      >
        −
      </button>
      <span className="w-8 border-x border-charcoal text-center text-sm text-charcoal">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={quantity >= max}
        onClick={() => onChange(Math.min(max, quantity + 1))}
        className="flex h-8 w-8 items-center justify-center text-charcoal disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}