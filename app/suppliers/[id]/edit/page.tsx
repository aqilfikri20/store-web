"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function EditSupplierPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function loadSupplier() {
      try {
        const response = await fetch(
          `/api/suppliers/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Supplier tidak ditemukan");
          router.push("/suppliers");
          return;
        }

        const supplier: Supplier = data;

        setForm({
          name: supplier.name,
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
        });
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data supplier");
      } finally {
        setLoading(false);
      }
    }

    loadSupplier();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
        `/api/suppliers/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal memperbarui supplier");
        return;
      }

      router.push("/suppliers");
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
          Loading supplier...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/suppliers"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Suppliers
        </Link>

        <h1 className="text-2xl font-bold">
          Edit Supplier
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update supplier information
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border bg-white p-6"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Supplier Name
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

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={4}
              className="w-full resize-none rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Link
            href="/suppliers"
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Supplier"}
          </button>
        </div>
      </form>
    </div>
  );
}