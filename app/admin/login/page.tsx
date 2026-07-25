"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("incorrect password");
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="mb-1.5 text-center text-lg font-medium text-ivory">
          Elite Soul <span className="text-brass">admin</span>
        </p>
        <p className="mb-6 text-center text-sm text-ivory/55">
          enter the admin password to continue
        </p>

        <Input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />

        <Button type="submit" variant="primary" fullWidth className="mt-4" disabled={loading}>
          {loading ? "checking..." : "login"}
        </Button>
      </form>
    </div>
  );
}