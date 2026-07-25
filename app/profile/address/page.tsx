"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RequireAuth from "../../../components/auth/RequireAuth";
import { useAuth } from "../../lib/context/AuthContext";

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM = {
  label: "",
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

function AddressesContent() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAddresses = () => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/addresses?userId=${user.id}`)
      .then((res) => res.json())
      .then((result) => setAddresses(result.data ?? []))
      .catch(() => setError("failed to load addresses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const startEdit = (address: Address) => {
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setEditingId(address._id);
    setShowForm(true);
    setError("");
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.fullName || !form.addressLine || !form.pincode) {
      setError("please fill in full name, address, and pincode");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        const res = await fetch(`/api/addresses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("failed to update address");
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, userId: user.id }),
        });
        if (!res.ok) throw new Error("failed to save address");
      }

      setShowForm(false);
      loadAddresses();
    } catch {
      setError("something went wrong while saving. please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("delete this address?")) return;

    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } else {
      alert("failed to delete address");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-serif text-2xl font-medium text-charcoal">
              Saved Addresses
            </h1>
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={startAdd}>
                Add new
            </Button>
          </div>

          {showForm && (
            <div className="mb-6 rounded-card border border-charcoal/15 p-5">
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  placeholder="label (e.g. home, work)"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
                <Input
                  placeholder="full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <Input
                  placeholder="phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <Input
                  placeholder="house no, street, area"
                  value={form.addressLine}
                  onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
                />
              </div>
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input placeholder="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input placeholder="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <Input placeholder="pincode" maxLength={6} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>

              {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "saving..." : "save address"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  cancel
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-charcoal/55">loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-charcoal/55">
              you haven&apos;t saved any addresses yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="flex items-start justify-between rounded-card border border-charcoal/15 p-4"
                >
                  <div className="flex gap-3">
                    <MapPin size={16} className="mt-0.5 text-pink" />
                    <div>
                      <p className="text-sm font-medium capitalize text-charcoal">
                        {address.label || "address"}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal/65">
                        {address.fullName} · {address.phone}
                      </p>
                      <p className="text-xs text-charcoal/65">
                        {address.addressLine}, {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button aria-label="Edit address" onClick={() => startEdit(address)}>
                      <Pencil size={15} className="text-charcoal/50 hover:text-pink" />
                    </button>
                    <button aria-label="Delete address" onClick={() => handleDelete(address._id)}>
                      <Trash2 size={15} className="text-charcoal/50 hover:text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <RequireAuth>
      <AddressesContent />
    </RequireAuth>
  );
}