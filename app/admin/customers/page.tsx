"use client";

import CustomerTable, { Customer } from "@/components/admin/CustomerTable";
import RequireAdmin from "@/components/auth/RequireAdmin";
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
    <RequireAdmin>
      <div >
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-medium text-charcoal">Customers</h1>
          <p className="text-sm text-gray-500">
            View and manage all registered customers.
        </p>
      </div>

      <CustomerTable customers={customers} />
    </div>
    </RequireAdmin>
  );
}