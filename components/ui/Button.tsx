import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  // pink fill — reserve for the ONE primary action on a page (add to bag, place order)
  primary:
    "bg-pink text-ivory hover:bg-pink/90 active:scale-[0.98] border border-transparent",
  // charcoal fill — secondary strong action (buy now, save changes)
  secondary:
    "bg-charcoal text-ivory hover:bg-charcoal/90 active:scale-[0.98] border border-transparent",
  // outline — most buttons on a page should default to this
  outline:
    "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal/5 active:scale-[0.98]",
  // ghost — low-emphasis, e.g. "remove" or "view all"
  ghost:
    "bg-transparent text-charcoal border border-transparent hover:bg-charcoal/5 underline-offset-2",
  danger:
    "bg-red-600 text-ivory hover:bg-red-700 active:scale-[0.98] border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-md",
  lg: "h-[52px] px-8 text-lg",
};

export default function Button({
  variant = "outline",
  size = "md",
  fullWidth = false,
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const { ["font-bold"]: _fontBold, ...buttonProps } = props as any;

  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 rounded font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...buttonProps}
    >
      {icon}
      {children}
    </button>
  );
}
