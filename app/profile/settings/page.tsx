"use client";

import { useState } from "react";
import AccountSidebar from "@/components/account/AccountSidebar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import RequireAuth from "../../../components/auth/RequireAuth";

export default function SettingsPage() {
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    newArrivals: true,
    promotions: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.next) {
      setPasswordError("please fill in both password fields");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError("new passwords do not match");
      return;
    }
    setPasswordError("");
    // TODO: call your real change-password API here
    console.log("change password");
    setPasswordSaved(true);
    setPasswords({ current: "", next: "", confirm: "" });
  };

  const toggleNotification = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <RequireAuth>
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div className="flex flex-col gap-10">
          <h1 className="font-serif text-2xl font-medium text-charcoal">
            Account Settings
          </h1>

          {/* change password */}
          <div>
            <p className="mb-3.5 text-xl font-medium text-pink">
              Change Password
            </p>
            <div className="flex max-w-sm flex-col gap-3">
              <Input
                label="Current password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
              <Input
                label="New password"
                type="password"
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
              />
              <Input
                label="Confirm new password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
              {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
              {passwordSaved && <p className="text-xs text-green-700">password updated successfully</p>}
              <Button variant="primary" size="sm" onClick={handleChangePassword} className="mt-1 w-fit">
                Update Password
              </Button>
            </div>
          </div>

          {/* notification preferences */}
          <div>
            <p className="mb-3.5 text-xl font-medium text-pink">
              Notification Preferences
            </p>
            <div className="flex max-w-sm flex-col gap-2.5">
              <ToggleRow
                label="Order updates"
                checked={notifications.orderUpdates}
                onChange={() => toggleNotification("orderUpdates")}
              />
              <ToggleRow
                label="New arrivals"
                checked={notifications.newArrivals}
                onChange={() => toggleNotification("newArrivals")}
              />
              <ToggleRow
                label="Promotions and offers"
                checked={notifications.promotions}
                onChange={() => toggleNotification("promotions")}
              />
            </div>
          </div>

          {/* danger zone */}
          <div className="rounded-card border border-red-200 p-5">
            <p className="mb-1 text-md font-medium text-charcoal">Delete account</p>
            <p className="mb-3.5 text-md text-charcoal/60">
              This permanently deletes your account, orders, and saved data.
              this cannot be undone.
            </p>
            {showDeleteConfirm ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    // TODO: call your real delete-account API here
                    console.log("delete account confirmed");
                  }}
                >
                  Yes, delete my account
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between text-sm text-charcoal">
      {label}
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-pink" />
    </label>
  );
}