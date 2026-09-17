import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
      FROM suppliers
      ORDER BY id DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("GET SUPPLIERS ERROR:", error);

    return Response.json(
      {
        message: "Gagal mengambil data supplier",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      phone,
      address,
    } = await request.json();

    if (!name) {
      return Response.json(
        {
          message: "Nama supplier wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO suppliers (
        name,
        email,
        phone,
        address
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        email || null,
        phone || null,
        address || null,
      ]
    );

    return Response.json(
      result.rows[0],
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST SUPPLIER ERROR:", error);

    return Response.json(
      {
        message: "Gagal membuat supplier",
      },
      {
        status: 500,
      }
    );
  }
}