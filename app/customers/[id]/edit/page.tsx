"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function EditCustomerPage() {
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
    async function loadCustomer() {
      try {
        const response = await fetch(
          `/api/customers/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          alert(
            data.message || "Customer tidak ditemukan"
          );
          router.push("/customers");
          return;
        }

        const customer: Customer = data;

        setForm({
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
        });
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data customer");
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
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
        `/api/customers/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal memperbarui customer"
        );
        return;
      }

      router.push("/customers");
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
          Loading customer...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/customers"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Customers
        </Link>

        <h1 className="text-2xl font-bold">
          Edit Customer
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update customer information
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border bg-white p-6"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Customer Name
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

        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Link
            href="/customers"
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
              ? "Updating..."
              : "Update Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}