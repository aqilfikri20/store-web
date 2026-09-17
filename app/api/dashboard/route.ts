import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // Total products
    const productsResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM products
    `);

    // Total suppliers
    const suppliersResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM suppliers
    `);

    // Total customers
    const customersResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM customers
    `);

    // Total sales bulan ini
    const salesResult = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total
      FROM sales
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    `);

    // 5 transaksi terbaru
    const transactionsResult = await pool.query(`
      SELECT
        s.id,
        c.name AS customer_name,
        s.total,
        s.created_at
      FROM sales s
      LEFT JOIN customers c
        ON s.customer_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    // Produk dengan stock rendah
    const lowStockResult = await pool.query(`
      SELECT
        id,
        name,
        stock
      FROM products
      WHERE stock <= 5
      ORDER BY stock ASC, name ASC
      LIMIT 5
    `);

    return NextResponse.json({
      stats: {
        products: productsResult.rows[0].total,
        suppliers: suppliersResult.rows[0].total,
        customers: customersResult.rows[0].total,
        sales: salesResult.rows[0].total,
      },
      transactions: transactionsResult.rows,
      lowStock: lowStockResult.rows,
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        error: "Gagal mengambil data dashboard",
      },
      {
        status: 500,
      }
    );
  }
}