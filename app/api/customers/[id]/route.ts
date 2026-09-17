import pool from "@/lib/db";

type Params = {
  params: Promise<{ id: string }>;
};

// GET CUSTOMER BY ID
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
      FROM customers
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          message: "Customer tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("GET CUSTOMER ERROR:", error);

    return Response.json(
      {
        message: "Gagal mengambil data customer",
      },
      { status: 500 }
    );
  }
}

// UPDATE CUSTOMER
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      name,
      email,
      phone,
      address,
    } = body;

    if (!name || !email) {
      return Response.json(
        {
          message: "Nama dan email wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      UPDATE customers
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
        email,
        phone || null,
        address || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          message: "Customer tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE CUSTOMER ERROR:", error);

    return Response.json(
      {
        message: "Gagal mengubah customer",
      },
      { status: 500 }
    );
  }
}

// DELETE CUSTOMER
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      DELETE FROM customers
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        {
          message: "Customer tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Customer berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE CUSTOMER ERROR:", error);

    return Response.json(
      {
        message: "Gagal menghapus customer",
      },
      { status: 500 }
    );
  }
}