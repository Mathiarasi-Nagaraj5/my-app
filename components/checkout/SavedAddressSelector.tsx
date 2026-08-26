"use client";

import { MapPin, Plus } from "lucide-react";

export interface SavedAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface SavedAddressSelectorProps {
  addresses: SavedAddress[];
  selectedId: string; // an address _id, or "new"
  onSelect: (id: string) => void;
}

export default function SavedAddressSelector({
  addresses,
  selectedId,
  onSelect,
}: SavedAddressSelectorProps) {
  return (
    <div>
      <p className="mb-3.5 text-lg font-medium text-charcoal">Shipping Address</p>
      <div className="flex flex-col gap-2.5">
        {addresses.map((address) => (
          <label
            key={address._id}
            className={`flex cursor-pointer items-start gap-3 rounded-card px-4 py-3 text-sm ${
              selectedId === address._id ? "border-2 border-pink" : "border border-charcoal/30"
            }`}
          >
            <input
              type="radio"
              name="shipping-address"
              checked={selectedId === address._id}
              onChange={() => onSelect(address._id)}
              className="mt-1 accent-pink"
            />
            <div>
              <p className="font-medium capitalize text-charcoal">
                {address.label || "address"}
              </p>
              <p className="text-charcoal/70">
                {address.fullName} · {address.phone}
              </p>
              <p className="text-charcoal/70">
                {address.addressLine}, {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
          </label>
        ))}

        <label
          className={`flex cursor-pointer items-center gap-3 rounded-card px-4 py-3 text-sm ${
            selectedId === "new" ? "border-2 border-pink" : "border border-charcoal/30"
          }`}
        >
          <input
            type="radio"
            name="shipping-address"
            checked={selectedId === "new"}
            onChange={() => onSelect("new")}
            className="accent-pink"
          />
          <span className="flex items-center gap-1.5 font-medium text-charcoal">
            <Plus size={14} /> Use a Different Address
          </span>
        </label>
      </div>
    </div>
  );
}