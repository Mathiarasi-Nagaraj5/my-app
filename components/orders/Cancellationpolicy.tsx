import { Info } from "lucide-react";

export default function CancellationPolicy() {
  return (
    <div className="flex gap-2.5 rounded-card border border-charcoal/15 bg-charcoal/[0.02] p-4 text-sm text-charcoal/70">
      <Info size={15} className="mt-0.5 flex-shrink-0 text-pink" />
      <div className="space-y-1">
        <p>
          <span className="font-medium text-charcoal">Cancellation: </span> Free until your order
          ships. once it&apos;s out for delivery or delivered, it can no longer be cancelled.
        </p>
        <p>
          <span className="font-medium text-charcoal">Returns:</span> Available within 7 days of
          delivery. refunds are issued to your original payment method within 5-7 business days.
        </p>
      </div>
    </div>
  );
}