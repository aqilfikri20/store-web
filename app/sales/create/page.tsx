"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Customer = {
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

type SaleItem = {
  product_id: string;
  quantity: string;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CreateSalePage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>(
    []
  );

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState<SaleItem[]>([
    {
      product_id: "",
      quantity: "1",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          customerResponse,
          productResponse,
        ] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products"),
        ]);

        const customerData =
          await customerResponse.json();

        const productData =
          await productResponse.json();

        if (!customerResponse.ok) {
          alert(
            customerData.message ||
              "Gagal mengambil customer"
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

        setCustomers(customerData);
        setProducts(productData);
      } catch (error) {
        console.error(error);
        alert("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleItemChange(
    index: number,
    field: keyof SaleItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        product_id: "",
        quantity: "1",
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  }

  function getProduct(productId: string) {
    return products.find(
      (product) => String(product.id) === productId
    );
  }

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item.product_id);

      if (!product) {
        return sum;
      }

      const quantity = Number(item.quantity);

      return (
        sum +
        Number(product.selling_price) *
          (quantity > 0 ? quantity : 0)
      );
    }, 0);
  }, [items, products]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!customerId) {
      alert("Silakan pilih customer");
      return;
    }

    if (items.length === 0) {
      alert("Minimal harus ada satu produk");
      return;
    }

    for (const item of items) {
      if (!item.product_id) {
        alert("Silakan pilih semua produk");
        return;
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        alert("Quantity harus berupa angka lebih dari 0");
        return;
      }

      const product = getProduct(item.product_id);

      if (!product) {
        alert("Produk tidak ditemukan");
        return;
      }

      if (quantity > product.stock) {
        alert(
          `Stock ${product.name} tidak mencukupi. Tersedia ${product.stock}.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: Number(customerId),
          items: items.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Gagal membuat transaksi"
        );
        return;
      }

      alert("Transaksi berhasil dibuat");

      router.push("/sales");
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
          href="/sales"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to Sales
        </Link>

        <h1 className="text-2xl font-bold">
          New Sale
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new sales transaction
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer */}
        <div className="mb-5 max-w-3xl rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-base font-semibold">
            Customer
          </h2>

          <label className="mb-2 block text-sm font-medium">
            Select Customer
          </label>

          <select
            value={customerId}
            onChange={(e) =>
              setCustomerId(e.target.value)
            }
            required
            className="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none focus:border-black"
          >
            <option value="">
              Select customer
            </option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products */}
        <div className="mb-5 rounded-xl border bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add products to this transaction
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const product = getProduct(
                item.product_id
              );

              const quantity = Number(
                item.quantity
              );

              const subtotal = product
                ? Number(product.selling_price) *
                  (quantity > 0 ? quantity : 0)
                : 0;

              return (
                <div
                  key={index}
                  className="rounded-lg border p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    {/* Product */}
                    <div className="md:col-span-6">
                      <label className="mb-2 block text-xs font-medium text-gray-600">
                        Product
                      </label>

                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "product_id",
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                      >
                        <option value="">
                          Select product
                        </option>

                        {products.map((product) => (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={
                              product.stock <= 0
                            }
                          >
                            {product.name} —{" "}
                            {formatRupiah(
                              Number(
                                product.selling_price
                              )
                            )}{" "}
                            — Stock{" "}
                            {product.stock}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-medium text-gray-600">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        max={product?.stock || undefined}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-black"
                      />
                    </div>

                    {/* Price */}
                    <div className="md:col-span-3">
                      <label className="mb-2 block text-xs font-medium text-gray-600">
                        Subtotal
                      </label>

                      <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm font-medium">
                        {formatRupiah(subtotal)}
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="flex items-end justify-end md:col-span-1">
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        disabled={items.length === 1}
                        className="rounded-lg border border-red-200 p-2.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total */}
        <div className="max-w-3xl rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Grand Total
            </span>

            <span className="text-2xl font-bold">
              {formatRupiah(total)}
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-6">
            <Link
              href="/sales"
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
                ? "Creating..."
                : "Create Sale"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}