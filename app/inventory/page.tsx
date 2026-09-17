"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowDown, ArrowUp } from "lucide-react";

type Movement = {
  id: number;
  product_id: number;
  product_name: string;
  type: "IN" | "OUT";
  quantity: number;
  reference_id: number | null;
  note: string | null;
  created_at: string;
};

type Product = {
  id: number;
  name: string;
  selling_price: string;
  stock: number;
  supplier_id: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function InventoryPage() {
  const [movements, setMovements] = useState<
    Movement[]
  >([]);

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [
        movementResponse,
        productResponse,
      ] = await Promise.all([
        fetch("/api/stock-movements"),
        fetch("/api/products"),
      ]);

      const movementData =
        await movementResponse.json();

      const productData =
        await productResponse.json();

      if (!movementResponse.ok) {
        alert(
          movementData.message ||
            "Gagal mengambil stock movement"
        );
        return;
      }

      if (!productResponse.ok) {
        alert(
          productData.message ||
            "Gagal mengambil product"
        );
        return;
      }

      setMovements(movementData);
      setProducts(productData);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data inventory");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading inventory...
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
            Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage stock and stock movements
          </p>
        </div>

        <Link
          href="/inventory/create"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={17} />
          Stock Adjustment
        </Link>
      </div>

      {/* Current Stock */}
      <div className="mb-6">
        <h2 className="mb-4 text-base font-semibold">
          Current Stock
        </h2>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Selling Price
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Stock
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Belum ada product.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {product.name}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          ID #{product.id}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        Rp{" "}
                        {Number(
                          product.selling_price
                        ).toLocaleString("id-ID")}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            product.stock === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock <= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock} unit
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Movement History */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold">
            Stock Movement History
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            History of stock changes
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Product
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Quantity
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Note
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {movements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Belum ada stock movement.
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">
                          {movement.product_name}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          Product ID #{movement.product_id}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {movement.type === "IN" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            <ArrowDown size={13} />
                            IN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                            <ArrowUp size={13} />
                            OUT
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {movement.type === "IN"
                          ? "+"
                          : "-"}
                        {movement.quantity}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {movement.note || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(
                          movement.created_at
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}