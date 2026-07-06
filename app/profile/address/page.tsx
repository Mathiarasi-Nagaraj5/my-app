"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import AccountSidebar from "@/components/account/Accountsidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

// TODO: replace with the logged-in user's real saved addresses from your backend.
const INITIAL_ADDRESSES: Address[] = [
  {
    id: "a1",
    label: "home",
    fullName: "Rohit Sharma",
    phone: "+91 98765 43210",
    addressLine: "12, MG Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
  },
];

const EMPTY_FORM = {
  label: "",
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (address: Address) => {
    setForm(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.fullName || !form.addressLine || !form.pincode) return;
    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...form, id: editingId } : a))
      );
    } else {
      setAddresses((prev) => [...prev, { ...form, id: `a${Date.now()}` }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) =>
    setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-serif text-2xl font-medium text-charcoal">
              saved addresses
            </h1>
            <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={startAdd}>
              add new
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
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleSave}>
                  save address
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  cancel
                </Button>
              </div>
            </div>
          )}

          {addresses.length === 0 ? (
            <p className="text-sm text-charcoal/55">
              you haven&apos;t saved any addresses yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="flex items-start justify-between rounded-card border border-charcoal/15 p-4"
                >
                  <div className="flex gap-3">
                    <MapPin size={16} className="mt-0.5 text-brass" />
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
                      <Pencil size={15} className="text-charcoal/50 hover:text-brass" />
                    </button>
                    <button aria-label="Delete address" onClick={() => handleDelete(address.id)}>
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