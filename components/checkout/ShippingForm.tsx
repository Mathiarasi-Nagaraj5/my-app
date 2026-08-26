"use client";

import Input from "@/components/ui/Input";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
}

interface ShippingFormProps {
  value: ShippingAddress;
  onChange: (next: ShippingAddress) => void;
  errors?: Partial<Record<keyof ShippingAddress, string>>;
}

export default function ShippingForm({ value, onChange, errors = {} }: ShippingFormProps) {
  const update =
    (field: keyof ShippingAddress) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [field]: e.target.value });

  return (
    <div>
      <p className="mb-3.5 flex items-center gap-2 text-lg font-medium text-charcoal">
        Shipping Address
      </p>
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          placeholder="full name"
          value={value.fullName}
          onChange={update("fullName")}
          error={errors.fullName}
        />
          <Input
          placeholder="email address"
          value={value.email}
          onChange={update("email")}
          error={errors.email}
        />
        <Input
          placeholder="phone number"
          value={value.phone}
          onChange={update("phone")}
          error={errors.phone}
        />
      </div>
      <div className="mb-3">
        <Input
          placeholder="house no, street, area"
          value={value.addressLine}
          onChange={update("addressLine")}
          error={errors.addressLine}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input placeholder="city" value={value.city} onChange={update("city")} error={errors.city} />
        <Input placeholder="state" value={value.state} onChange={update("state")} error={errors.state} />
        <Input
          placeholder="pincode"
          value={value.pincode}
          onChange={update("pincode")}
          maxLength={6}
          error={errors.pincode}
        />
      </div>
    </div>
  );
}
