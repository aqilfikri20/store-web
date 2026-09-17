"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCustomerPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

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
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal membuat customer"
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
          Add Customer
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a new customer
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
              placeholder="Enter customer name"
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
              placeholder="customer@example.com"
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
              placeholder="08xxxxxxxxxx"
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
              placeholder="Enter customer address"
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
            {saving ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}