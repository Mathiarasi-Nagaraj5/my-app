"use client";

import { useState } from "react";
import { useAuth } from "@/app/lib/context/AuthContext";
import PasswordInput from "@/components/auth/PasswordInput";
import { useModal } from "@/components/ui/ModalProvider";

export default function AdminChangePasswordForm() {
  const { changePassword } = useAuth();
  const { alert } = useModal();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword) {
      setError("fill in both current and new password");
      return;
    }
    if (newPassword.length < 8) {
      setError("new password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("new password and confirmation don't match");
      return;
    }

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setSaving(false);

    if (!result.ok) {
      setError(result.message ?? "failed to change password");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    await alert({ title: "Password updated", message: "Your password has been changed successfully.", variant: "success" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Current password</label>
        <PasswordInput
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">New password</label>
        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="at least 8 characters"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Confirm new password</label>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          required
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-md bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90 disabled:opacity-50"
      >
        {saving ? "updating..." : "Update password"}
      </button>
    </form>
  );
}