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

type Supplier = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSuppliers() {
    try {
      const response = await fetch("/api/suppliers");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data supplier");
        return;
      }

      setSuppliers(data);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data supplier");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "Apakah kamu yakin ingin menghapus supplier ini?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/suppliers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menghapus supplier");
        return;
      }

      setSuppliers((current) =>
        current.filter((supplier) => supplier.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus supplier");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading suppliers...
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
            Suppliers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your suppliers
          </p>
        </div>

        <Link
          href="/suppliers/create"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={17} />
          Add Supplier
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Supplier
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
              {suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada supplier.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50"
                  >
                    {/* Supplier */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {supplier.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        ID #{supplier.id}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {supplier.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={14} />
                            {supplier.email}
                          </div>
                        )}

                        {supplier.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={14} />
                            {supplier.phone}
                          </div>
                        )}

                        {!supplier.email &&
                          !supplier.phone && (
                            <span className="text-gray-400">
                              No contact
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4 text-gray-600">
                      {supplier.address || "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/suppliers/${supplier.id}/edit`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(supplier.id)
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