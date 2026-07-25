import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-lg text-charcoal"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/50">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "h-[42px] w-full rounded border bg-ivory px-3 text-lg text-charcoal placeholder:text-charcoal/40",
              "focus:outline-none focus:ring-1 focus:ring-pink focus:border-pink",
              icon ? "pl-9" : "",
              error ? "border-red-500" : "border-charcoal",
              className,
            ].join(" ")}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-lg text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
