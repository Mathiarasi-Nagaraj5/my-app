"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("please fill in all fields");
      return;
    }
    if (!agreed) {
      setError("please agree to the terms of service to continue");
      return;
    }

    setLoading(true);
    // TODO: replace with your real signup API call
    console.log("register attempt", form);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="full name"
        placeholder="your full name"
        value={form.name}
        onChange={update("name")}
      />
      <Input
        label="email address"
        type="text"
        placeholder="you@email.com"
        value={form.email}
        onChange={update("email")}
      />
      <Input
        label="phone number"
        type="text"
        placeholder="+91 98765 43210"
        value={form.phone}
        onChange={update("phone")}
      />
      <Input
        label="password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={update("password")}
      />

      <label className="flex items-start gap-2 text-xs text-charcoal/70">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-pink"
        />
        i agree to the terms of service and privacy policy
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? "creating account..." : "create account"}
      </Button>

      <p className="mt-2 text-center text-sm text-charcoal/70">
        already have an account?{" "}
        <Link href="/login" className="font-medium text-pink hover:underline">
          login
        </Link>
      </p>
    </form>
  );
}