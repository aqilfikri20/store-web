"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
type Product = {
  id: number;
  name: string;
  selling_price: string;
  stock: number;
  supplier_id: number;
  supplier_name: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function getProducts() {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  async function deleteProduct(id: number) {
    const confirmed = confirm(
      "Apakah kamu yakin ingin menghapus product ini?"
    );

    if (!confirmed) return;

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      getProducts();
    } else {
      const data = await response.json();
      alert(data.message);
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Products
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store products
          </p>
        </div>

<Link
  href="/products/create"
  className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
>
  <Plus size={18} />
  Add Product
</Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-medium">
                Product
              </th>

              <th className="px-5 py-4 text-left text-sm font-medium">
                Supplier
              </th>



              <th className="px-5 py-4 text-left text-sm font-medium">
                Selling Price
              </th>

              <th className="px-5 py-4 text-left text-sm font-medium">
                Stock
              </th>

              <th className="px-5 py-4 text-right text-sm font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-gray-500"
                >
                  Belum ada product.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium">
                      {product.name}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {product.supplier_name}
                  </td>

  

                  <td className="px-5 py-4 text-sm">
                    Rp{" "}
                    {Number(
                      product.selling_price
                    ).toLocaleString("id-ID")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        product.stock <= 5
                          ? "bg-red-50 text-red-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                        <Link
                        href={`/products/${product.id}/edit`}
                        className="rounded-lg p-2 hover:bg-gray-100"
                        >
                        <Pencil size={17} />
                        </Link>

                      <button
                        onClick={() =>
                          deleteProduct(product.id)
                        }
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
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
  );
}