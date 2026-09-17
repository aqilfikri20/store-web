"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCustomers() {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal mengambil data customer"
        );
        return;
      }

      setCustomers(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data customer");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "Apakah kamu yakin ingin menghapus customer ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal menghapus customer"
        );
        return;
      }

      setCustomers((current) =>
        current.filter(
          (customer) => customer.id !== id
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        "Terjadi kesalahan saat menghapus customer"
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading customers...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your customers
          </p>
        </div>

        <Link
          href="/customers/create"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={17} />
          Add Customer
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Customer
                </th>

                <th className="px-6 py-4 font-semibold">
                  Contact
                </th>

                <th className="px-6 py-4 font-semibold">
                  Address
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada customer.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {customer.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        ID #{customer.id}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        )}

                        {customer.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={14} />
                            {customer.phone}
                          </div>
                        )}

                        {!customer.email &&
                          !customer.phone && (
                            <span className="text-gray-400">
                              No contact
                            </span>
                          )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {customer.address || "-"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(customer.id)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}