import pool from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Ambil informasi transaksi
    const saleResult = await pool.query(
      `
      SELECT
        s.id,
        s.customer_id,
        s.total,
        s.created_at,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone
      FROM sales s
      LEFT JOIN customers c
        ON s.customer_id = c.id
      WHERE s.id = $1
      `,
      [id]
    );

    if (saleResult.rows.length === 0) {
      return Response.json(
        {
          message: "Penjualan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Ambil item transaksi
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
      ORDER BY si.id ASC
      `,
      [id]
    );

    return Response.json({
      sale: saleResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (error) {
    console.error("GET SALE DETAIL ERROR:", error);

    return Response.json(
      {
        message: "Gagal mengambil detail penjualan",
      },
      { status: 500 }
    );
  }
}