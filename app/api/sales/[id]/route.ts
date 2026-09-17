import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const saleResult = await pool.query(
      `
      SELECT
        s.id,
        s.customer_id,
        c.name AS customer_name,
        s.total,
        s.created_at
      FROM sales s
      LEFT JOIN customers c
        ON s.customer_id = c.id
      WHERE s.id = $1
      `,
      [id]
    );

    if (saleResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    const itemsResult = await pool.query(
      `
      SELECT
        si.id,
        si.product_id,
        p.name AS product_name,
        si.quantity,
        si.price,
        si.subtotal
      FROM sale_items si
      JOIN products p
        ON si.product_id = p.id
      WHERE si.sale_id = $1
      ORDER BY si.id
      `,
      [id]
    );

    return NextResponse.json({
      ...saleResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("GET SALE DETAIL ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil detail transaksi" },
      { status: 500 }
    );
  }
}