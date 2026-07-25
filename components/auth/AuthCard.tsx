import { ReactNode } from "react";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-center font-serif text-2xl font-medium text-charcoal">
          {title}
        </h1>
        <p className="mt-1.5 text-center text-sm text-charcoal/60">
          {subtitle}
        </p>
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}
