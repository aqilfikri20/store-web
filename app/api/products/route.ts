import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.selling_price,
        p.stock,
        p.supplier_id,
        s.name AS supplier_name
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengambil data product" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      selling_price,
      stock,
      supplier_id,
    } = body;

    if (!name || !supplier_id) {
      return NextResponse.json(
        { message: "Nama dan supplier wajib diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO products
        (name,  selling_price, stock, supplier_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        selling_price,
        stock,
        supplier_id,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal menambahkan product" },
      { status: 500 }
    );
  }
}