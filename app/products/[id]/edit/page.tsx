"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  selling_price: string;
  stock: number;
  supplier_id: number;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    selling_price: "",
    stock: "",
    supplier_id: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [productResponse, supplierResponse] =
          await Promise.all([
            fetch(`/api/products/${id}`),
            fetch("/api/suppliers"),
          ]);

        const productData =
          await productResponse.json();

        const supplierData =
          await supplierResponse.json();

        if (!productResponse.ok) {
          alert(productData.message);
          router.push("/products");
          return;
        }

        const product: Product = productData;

        setForm({
          name: product.name,
          selling_price: String(
            product.selling_price
          ),
          stock: String(product.stock),
          supplier_id: String(
            product.supplier_id
          ),
        });

        setSuppliers(supplierData);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
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

    setSaving(true);

    try {
      const response = await fetch(
        `/api/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            selling_price: Number(
              form.selling_price
            ),
            stock: Number(form.stock),
            supplier_id: Number(
              form.supplier_id
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      router.push("/products");
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
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/products"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <h1 className="text-2xl font-bold">
          Edit Product
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update product information
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">
              Product Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>


          {/* Selling Price */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Selling Price
            </label>

            <input
              type="number"
              name="selling_price"
              value={form.selling_price}
              onChange={handleChange}
              min="0"
              required
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Stock
            </label>

            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              min="0"
              required
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Supplier */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Supplier
            </label>

            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="">
                Select supplier
              </option>

              {suppliers.map((supplier) => (
                <option
                  key={supplier.id}
                  value={supplier.id}
                >
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Link
            href="/products"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}