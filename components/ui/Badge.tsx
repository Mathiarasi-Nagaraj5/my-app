import { ReactNode } from "react";

type BadgeVariant =
  | "brand" // pink — bestseller, discount %
  | "success" // delivered
  | "info" // in transit
  | "danger" // cancelled / out of stock
  | "neutral"; // default / low-emphasis tag

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: "bg-pink text-charcoal",
  success: "bg-green-100 text-green-800",
  info: "bg-blue-100 text-blue-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-ivory text-charcoal border border-charcoal/20",
};

export default function Badge({ children, variant = "neutral" }: BadgeProps) {
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