"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const router = useRouter();
  const [fullName, setfullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await adminLogin(fullName, password);
    console.log("Admin login result:", result);
    if (!result.ok) {
      setError(result.message ?? "login failed");
      setSubmitting(false);
      return;
    }
console.log("Admin login successful, redirecting to /admin/orders");
    // adminLogin only ever succeeds for a real admin account (role checked
    // server-side before any cookie was issued) — no follow-up role check
    // needed here, unlike the earlier version.
    router.push("/admin/orders");
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <Link href="/" className="flex justify-center text-3xl font-stretch-50% tracking-wide text-charcoal">
          <Image src="/images/logo.png" alt="Elite Soul" width={180} height={80} />
        </Link>
      <h1 className="mb-6 mt-10 text-xl font-semibold text-gray-700">Admin Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="User Name"
          value={fullName}
          onChange={(e) => setfullName(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          required
        />
       <PasswordInput
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
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
    </div>
  );
}