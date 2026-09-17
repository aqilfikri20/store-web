"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  stock: number;
};

export default function StockAdjustmentPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    product_id: "",
    type: "IN",
    quantity: "1",
    note: "",
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(
          "/api/products"
        );

        const data = await response.json();

        if (!response.ok) {
          alert(
            data.message ||
              "Gagal mengambil product"
          );
          return;
        }

        setProducts(data);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil product");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const quantity = Number(form.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Quantity harus lebih dari 0");
      return;
    }

    const product = products.find(
      (item) =>
        String(item.id) === form.product_id
    );

    if (!product) {
      alert("Silakan pilih product");
      return;
    }

    if (
      form.type === "OUT" &&
      quantity > product.stock
    ) {
      alert(
        `Stock tidak mencukupi. Stock saat ini: ${product.stock}`
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/stock-movements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: Number(form.product_id),
            type: form.type,
            quantity,
            note: form.note,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal memperbarui stock"
        );
        return;
      }

      alert("Stock berhasil diperbarui");

      router.push("/inventory");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/inventory"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Link>

        <h1 className="text-2xl font-bold">
          Stock Adjustment
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add or remove product stock
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border bg-white p-6"
      >
        <div className="space-y-5">
          {/* Product */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Product
            </label>

            <select
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} — Stock{" "}
                  {product.stock}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Movement Type
            </label>

            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="IN">
                IN — Add Stock
              </option>

              <option value="OUT">
                OUT — Remove Stock
              </option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Quantity
            </label>

            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              required
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Note
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={4}
              placeholder="Example: Stock masuk dari supplier"
              className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Link
            href="/inventory"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Adjustment"}
          </button>
        </div>
      </form>
    </div>
  );
}