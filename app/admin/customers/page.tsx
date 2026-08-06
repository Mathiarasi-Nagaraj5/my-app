"use client";

import CustomerTable, { Customer } from "@/components/admin/CustomerTable";
import { useEffect, useState } from "react";


export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())    
    .then((data) => setCustomers(data.data))
        .catch((err) => console.error("Failed to fetch customers:", err))
    }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">
          View and manage all registered customers.
        </p>
      </div>

      <CustomerTable customers={customers} />
    </div>
  );
}