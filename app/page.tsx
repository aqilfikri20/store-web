"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  Users,
  ShoppingCart,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

type DashboardData = {
  stats: {
    products: number;
    suppliers: number;
    customers: number;
    sales: string;
  };

  transactions: {
    id: number;
    customer_name: string | null;
    total: string;
    created_at: string;
  }[];

  lowStock: {
    id: number;
    name: string;
    stock: number;
  }[];
};

function formatRupiah(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Gagal mengambil data dashboard");
        }

        const result = await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
        setError("Gagal memuat dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const stats = [
    {
      title: "Total Products",
      value: data?.stats.products ?? 0,
      icon: Package,
      description: "Products available",
    },
    {
      title: "Total Suppliers",
      value: data?.stats.suppliers ?? 0,
      icon: Truck,
      description: "Registered suppliers",
    },
    {
      title: "Total Customers",
      value: data?.stats.customers ?? 0,
      icon: Users,
      description: "Registered customers",
    },
    {
      title: "Sales This Month",
      value: formatRupiah(data?.stats.sales ?? 0),
      icon: ShoppingCart,
      description: "Total sales this month",
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border bg-white"
            />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-80 animate-pulse rounded-xl border bg-white xl:col-span-2" />

          <div className="h-80 animate-pulse rounded-xl border bg-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your store
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h2>

                  <p className="mt-2 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <Icon
                    size={20}
                    className="text-gray-700"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Transactions */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                Recent Transactions
              </h2>

              <p className="text-sm text-gray-500">
                Latest sales transactions
              </p>
            </div>

            <a
              href="/sales"
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:underline"
            >
              View all
              <ArrowUpRight size={16} />
            </a>
          </div>

          {data?.transactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Belum ada transaksi.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-5 transition hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      TRX-{String(transaction.id).padStart(3, "0")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {transaction.customer_name ||
                        "Customer umum"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatRupiah(transaction.total)}
                    </p>

                    <span className="mt-1 inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-start justify-between border-b border-gray-200 p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                Low Stock
              </h2>

              <p className="text-sm text-gray-500">
                Products that need attention
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-2">
              <AlertTriangle
                size={18}
                className="text-red-500"
              />
            </div>
          </div>

          {data?.lowStock.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Semua stock masih aman.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-5"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {product.stock === 0
                        ? "Out of stock"
                        : `Only ${product.stock} left`}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      product.stock === 0
                        ? "bg-red-50 text-red-600"
                        : product.stock <= 2
                        ? "bg-red-50 text-red-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {product.stock === 0
                      ? "Out"
                      : "Low"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 p-4">
            <a
              href="/inventory"
              className="block text-center text-sm font-medium text-gray-700 hover:underline"
            >
              View Inventory
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}