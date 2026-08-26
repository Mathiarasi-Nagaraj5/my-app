"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "../../app/lib/context/AuthContext";

export default function AccountDetailsForm() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "" , email: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // populate the form once the real user loads
  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone ?? "", email: user.email ?? "" });
  }, [user]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "failed to save changes");
      return;
    }
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
        {saved && <span className="text-xs text-green-700">Saved Successfully</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}
