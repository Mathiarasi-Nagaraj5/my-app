import Link from "next/link";
import { Shirt } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-6 py-24 text-center">
      <div className="mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-charcoal">
        <Shirt size={40} className="text-brass" />
      </div>
      <p className="font-serif text-5xl font-medium text-brass">404</p>
      <h1 className="mt-2 font-serif text-xl font-medium text-charcoal">
        this page went missing
      </h1>
      <p className="mt-2 max-w-sm text-sm text-charcoal/60">
        the page you&apos;re looking for isn&apos;t here. let&apos;s get you
        back to shopping.
      </p>
      <Link href="/" className="mt-7">
        <Button variant="primary">back to home</Button>
      </Link>
    </div>
  );
}