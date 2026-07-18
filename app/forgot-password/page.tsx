"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("please enter your email or phone number");
      return;
    }
    setError("");
    // TODO: call your real password-reset API here
    console.log("send reset link to", identifier);
    setSent(true);
  };

  return (
    <AuthCard
      title="reset your password"
      subtitle="we'll send you a link to reset it"
    >
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-charcoal/75">
            if an account exists for <strong>{identifier}</strong>, a reset
            link has been sent.
          </p>
          <Link href="/login" className="mt-5 inline-block text-sm font-medium text-pink hover:underline">
            back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="email or phone number"
            placeholder="you@email.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={error}
          />
          <Button type="submit" variant="primary" fullWidth>
            send reset link
          </Button>
          <p className="mt-2 text-center text-sm text-charcoal/70">
            remembered it?{" "}
            <Link href="/login" className="font-medium text-pink hover:underline">
              login
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}