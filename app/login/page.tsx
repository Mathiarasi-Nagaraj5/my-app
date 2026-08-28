"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/lib/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login(email, password);
    if (!result.ok) {
      setError(result.message ?? "login failed");
      setSubmitting(false);
      return;
    }

    router.push("/orders");
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">Log in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-charcoal/20 px-3 py-2 text-sm"
          required
        />
     <PasswordInput
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="rounded-md border border-charcoal/20 px-3 py-2 text-sm"
  required
/>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-pink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "logging in..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-charcoal/60">
        No account?{" "}
        <Link href="/signup" className="text-pink hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}