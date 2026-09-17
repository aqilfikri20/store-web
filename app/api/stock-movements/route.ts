import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        sm.id,
        sm.product_id,
        p.name AS product_name,
        sm.type,
        sm.quantity,
        sm.reference_id,
        sm.note,
        sm.created_at
      FROM stock_movements sm
      JOIN products p
        ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET STOCK MOVEMENTS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil stock movements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const { product_id, type, quantity, note } = body;

    if (!product_id || !type || !quantity) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (!["IN", "OUT"].includes(type)) {
      return NextResponse.json(
        { error: "Type harus IN atau OUT" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity harus bilangan bulat positif" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const productResult = await client.query(
      `
      SELECT id, name, stock
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    if (type === "OUT" && product.stock < quantity) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error: `Stock ${product.name} tidak mencukupi`,
        },
        { status: 400 }
      );
    }

    const newStock =
      type === "IN"
        ? product.stock + quantity
        : product.stock - quantity;

    await client.query(
      `
      UPDATE products
      SET stock = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [newStock, product_id]
    );

    const movementResult = await client.query(
      `
      INSERT INTO stock_movements
        (product_id, type, quantity, note)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
      `,
      [product_id, type, quantity, note || null]
    );

    await client.query("COMMIT");

    return NextResponse.json(movementResult.rows[0], {
      status: 201,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("POST STOCK MOVEMENT ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan stock movement" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}