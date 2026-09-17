"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";

type Sale = {
  id: number;
  customer_id: number;
  customer_name: string | null;
  total: string;
  created_at: string;
};

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await fetch("/api/sales");
        const data = await response.json();

        if (!response.ok) {
          alert(
            data.message || "Gagal mengambil data transaksi"
          );
          return;
        }

        setSales(data);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data transaksi");
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading sales...
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
            Sales
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your sales transactions
          </p>
        </div>

        <Link
          href="/sales/create"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={17} />
          New Sale
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Transaction
                </th>

                <th className="px-6 py-4 font-semibold">
                  Customer
                </th>

                <th className="px-6 py-4 font-semibold">
                  Total
                </th>

                <th className="px-6 py-4 font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada transaksi.
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        #{sale.id}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        Transaction
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {sale.customer_name || "-"}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {formatRupiah(sale.total)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(sale.created_at)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <Link
                          href={`/sales/${sale.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50"
                        >
                          <Eye size={14} />
                          Detail
                        </Link>
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