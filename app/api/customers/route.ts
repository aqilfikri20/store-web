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
      FROM customers
      ORDER BY id DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);

    return Response.json(
      {
        message: "Gagal mengambil data customer",
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
          message: "Nama customer wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO customers (
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
    console.error("POST CUSTOMER ERROR:", error);

    return Response.json(
      {
        message: "Gagal membuat customer",
      },
      {
        status: 500,
      }
    );
  }
}