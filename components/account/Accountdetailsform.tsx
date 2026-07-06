"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function AccountDetailsForm() {
  // TODO: replace defaults with the logged-in user's real data (session/API)
  const [form, setForm] = useState({
    name: "Rohit Sharma",
    phone: "+91 98765 43210",
    email: "rohit@email.com",
  });
  const [saved, setSaved] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: call your update-profile API here
    console.log("save profile", form);
    setSaved(true);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="full name" value={form.name} onChange={update("name")} />
        <Input label="phone number" value={form.phone} onChange={update("phone")} />
        <div className="sm:col-span-2">
          <Input label="email address" value={form.email} onChange={update("email")} />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <Button variant="primary" onClick={handleSave}>
          save changes
        </Button>
        {saved && <span className="text-xs text-green-700">saved successfully</span>}
      </div>
    </div>
  );
}