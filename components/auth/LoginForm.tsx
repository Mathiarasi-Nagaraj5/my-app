"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
console.log("hi")
    if (!email || !password) {
      setError("please enter both email/phone and password");
      return;
    }

    setLoading(true);
    // TODO: replace with your real auth call (NextAuth, custom API, etc.)
    console.log("login attempt", { email, password });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="email or phone number"
        type="text"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <Input
          label="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="mt-1.5 text-right">
          <Link href="/forgot-password" className="text-xs text-pink hover:underline">
            forgot password?
          </Link>
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? "logging in..." : "login"}
      </Button>

      <div className="my-1 flex items-center gap-3">
        <div className="h-px flex-1 bg-charcoal/15" />
        <span className="text-xs text-charcoal/45">or</span>
        <div className="h-px flex-1 bg-charcoal/15" />
      </div>

      <Button
        type="button"
        variant="outline"
        fullWidth
        icon={<Smartphone size={16} />}
      >
        continue with OTP
      </Button>

      <p className="mt-3 text-center text-sm text-charcoal/70">
        new here?{" "}
        <Link href="/register" className="font-medium text-pink hover:underline">
          create an account
        </Link>
      </p>
    </form>
  );
}