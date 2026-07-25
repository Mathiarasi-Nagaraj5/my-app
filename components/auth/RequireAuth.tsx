"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/lib/context/AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // avoid flashing protected content (or a redirect) before we know the
  // real auth state
  if (loading || !user) {
    return <div className="px-6 py-24 text-center text-sm text-charcoal/55">loading...</div>;
  }

  return <>{children}</>;
}
