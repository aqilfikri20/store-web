"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Sale = {
  id: number;
  customer_id: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  total: number;
  created_at: string;
};

type SaleItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type SaleDetail = {
  sale: Sale;
  items: SaleItem[];
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function SaleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getSaleDetail() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/sales/${id}`);

        const text = await response.text();

        let result;

        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Response API bukan JSON yang valid.");
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil detail penjualan"
          );
        }

        if (!result.sale || !Array.isArray(result.items)) {
          throw new Error("Format data penjualan tidak valid.");
        }

        setData(result);
      } catch (error) {
        console.error("GET SALE DETAIL ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengambil detail penjualan."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getSaleDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Memuat detail penjualan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Link
          href="/sales"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Kembali ke Penjualan
        </Link>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">
            Gagal mengambil data
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Link
          href="/sales"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Kembali ke Penjualan
        </Link>

        <p className="mt-6 text-gray-500">
          Data penjualan tidak ditemukan.
        </p>
      </div>
    );
  }

  const { sale, items } = data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/sales"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Kembali ke Penjualan
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Detail Penjualan #{sale.id}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {formatDate(sale.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-6 rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Informasi Pelanggan
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">
              Nama
            </p>

            <p className="mt-1 font-medium">
              {sale.customer_name || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 font-medium">
              {sale.customer_email || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Telepon
            </p>

            <p className="mt-1 font-medium">
              {sale.customer_phone || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Produk yang Dibeli
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-4 py-3 font-medium">
                  Produk
                </th>

                <th className="px-4 py-3 text-center font-medium">
                  Jumlah
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Harga
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Tidak ada produk.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {item.product_name}
                        </p>

                        <p className="text-xs text-gray-500">
                          ID Produk: {item.product_id}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {item.quantity}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {formatRupiah(Number(item.price))}
                    </td>

                    <td className="px-4 py-3 text-right font-medium">
                      {formatRupiah(Number(item.subtotal))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            <tfoot>
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-4 text-right font-semibold"
                >
                  Total
                </td>

                <td className="px-4 py-4 text-right text-lg font-bold">
                  {formatRupiah(Number(sale.total))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}