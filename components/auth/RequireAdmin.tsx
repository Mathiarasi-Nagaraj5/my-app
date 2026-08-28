"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/app/lib/context/AuthContext";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/"); // logged-in customer hitting an admin page — bounce home, not to admin login
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return <p className="px-6 py-16 text-center text-sm text-charcoal/55">checking access...</p>;
  }

  return <>{children}</>;
}