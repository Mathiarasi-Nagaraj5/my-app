import { ReactNode } from "react";

type BadgeVariant =
  | "brand" // pink — bestseller, discount %
  | "success" // delivered
  | "info" // Out for Delivery
  | "danger" // cancelled / out of stock
  | "neutral"; // default / low-emphasis tag

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-pink text-ivory",
  success: "bg-green-100 text-green-800",
  info: "bg-blue-100 text-blue-800",
  danger: "bg-red text-red-800",
  neutral: "bg-charcoal text-ivory border border-charcoal/20",
};

export default function Badge({ children, variant = "neutral" }: BadgeProps) {
  console.log("Badge variant:", variant); // Debugging line to check the variant value
  return (
    <span
      className={[
        "inline-block rounded px-2.5 py-1 text-[12px] font-medium leading-none",
        variantStyles[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}