import { NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.selling_price,
        p.stock,
        p.supplier_id,
        s.name AS supplier_name
      FROM products p
      JOIN suppliers s
        ON p.supplier_id = s.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Product tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengambil product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
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
      UPDATE products
      SET
        name = $1,
        selling_price = $2,
        stock = $3,
        supplier_id = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        name,
        selling_price,
        stock,
        supplier_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Product tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Gagal mengupdate product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Product tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Product tidak dapat dihapus. Product mungkin sudah digunakan dalam transaksi.",
      },
      { status: 400 }
    );
  }
}