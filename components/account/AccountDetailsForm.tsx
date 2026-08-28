"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "../../app/lib/context/AuthContext";

export default function AccountDetailsForm() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // populate the form once the real user loads
  useEffect(() => {
    if (user) setForm({ name: user.fullName, phone: user.phone ?? "", email: user.email ?? "" });
  }, [user]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const updateProfile = async (data: {
    name: string;
    phone: string;
    email: string;
  }): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
        }),
      });

      let responseData: { success?: boolean; message?: string } = {};
      try {
        responseData = await res.json();
      } catch {
        return { ok: false, message: "unexpected server response" };
      }

      if (!res.ok || !responseData.success) {
        return { ok: false, message: responseData.message ?? "failed to save changes" };
      }
      return { ok: true };
    } catch {
      return { ok: false, message: "network error, please try again" };
    }
  };

  const handleSave = async () => {
    setError("");
    setSaved(false);

    if (!form.name.trim()) {
      setError("full name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("email is required");
      return;
    }

    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);

    if (!result.ok) {
      setError(result.message ?? "failed to save changes");
      return;
    }

    await refresh(); // sync AuthContext's user with the saved values
    setSaved(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full Name" value={form.name} onChange={update("name")} />
        <Input label="Phone Number" value={form.phone} onChange={update("phone")} />
        <div className="sm:col-span-2">
          <Input label="Email Address" value={form.email} onChange={update("email")} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        {saved && <span className="text-xs text-green-700">Saved successfully</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}