import pool from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

// GET /api/suppliers/:id
export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
      FROM suppliers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { message: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("GET SUPPLIER ERROR:", error);

    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/:id
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const {
      name,
      email,
      phone,
      address,
    } = await request.json();

    if (!name) {
      return Response.json(
        { message: "Nama supplier wajib diisi" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE suppliers
      SET
        name = $1,
        email = $2,
        phone = $3,
        address = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        name,
        email || null,
        phone || null,
        address || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { message: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("PUT SUPPLIER ERROR:", error);

    return Response.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/:id
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      DELETE FROM suppliers
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { message: "Supplier tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Supplier berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE SUPPLIER ERROR:", error);

    return Response.json(
      {
        message:
          "Supplier tidak dapat dihapus. Pastikan supplier tidak sedang digunakan oleh produk.",
      },
      { status: 500 }
    );
  }
}