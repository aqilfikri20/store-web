import pool from "@/lib/db";

// GET /api/sales
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.customer_id,
        c.name AS customer_name,
        s.total,
        s.created_at
      FROM sales s
      LEFT JOIN customers c
        ON s.customer_id = c.id
      ORDER BY s.id DESC
    `);

    return Response.json(result.rows);
  } catch (error) {
    console.error("GET SALES ERROR:", error);

    return Response.json(
      {
        message: "Gagal mengambil data transaksi",
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/sales
export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const {
      customer_id,
      items,
    } = await request.json();

    // Validasi customer
    if (!customer_id) {
      return Response.json(
        {
          message: "Customer wajib dipilih",
        },
        {
          status: 400,
        }
      );
    }

    // Validasi items
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        {
          message: "Minimal harus ada satu produk",
        },
        {
          status: 400,
        }
      );
    }

    await client.query("BEGIN");

    let total = 0;

    const preparedItems: {
      productId: number;
      quantity: number;
      price: number;
      subtotal: number;
    }[] = [];

    // ==========================================
    // 1. CEK PRODUCT DAN STOCK
    // ==========================================

    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        throw new Error(
          "Product tidak valid"
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error(
          "Quantity harus lebih dari 0"
        );
      }

      // Lock product selama transaksi
      const productResult = await client.query(
        `
        SELECT
          id,
          name,
          selling_price,
          stock
        FROM products
        WHERE id = $1
        FOR UPDATE
        `,
        [productId]
      );

      if (productResult.rows.length === 0) {
        throw new Error(
          `Product dengan ID ${productId} tidak ditemukan`
        );
      }

      const product = productResult.rows[0];

      // Cek stock
      if (product.stock < quantity) {
        throw new Error(
          `Stock ${product.name} tidak mencukupi. Tersedia: ${product.stock}`
        );
      }

      const price = Number(
        product.selling_price
      );

      const subtotal = price * quantity;

      total += subtotal;

      preparedItems.push({
        productId,
        quantity,
        price,
        subtotal,
      });
    }

    // ==========================================
    // 2. BUAT SALES
    // ==========================================

    const saleResult = await client.query(
      `
      INSERT INTO sales (
        customer_id,
        total
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [
        customer_id,
        total,
      ]
    );

    const sale = saleResult.rows[0];

    // ==========================================
    // 3. SIMPAN SALE ITEMS
    // 4. KURANGI STOCK
    // 5. CATAT STOCK MOVEMENT
    // ==========================================

    for (const item of preparedItems) {
      // Simpan item transaksi
      await client.query(
        `
        INSERT INTO sale_items (
          sale_id,
          product_id,
          quantity,
          price,
          subtotal
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          sale.id,
          item.productId,
          item.quantity,
          item.price,
          item.subtotal,
        ]
      );

      // Kurangi stock
      await client.query(
        `
        UPDATE products
        SET
          stock = stock - $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [
          item.quantity,
          item.productId,
        ]
      );

      // Catat movement OUT
      await client.query(
        `
        INSERT INTO stock_movements (
          product_id,
          type,
          quantity,
          reference_id,
          note
        )
        VALUES ($1, 'OUT', $2, $3, $4)
        `,
        [
          item.productId,
          item.quantity,
          sale.id,
          `Penjualan #${sale.id}`,
        ]
      );
    }

    // ==========================================
    // 6. SELESAI
    // ==========================================

    await client.query("COMMIT");

    return Response.json(
      {
        message: "Transaksi berhasil dibuat",
        sale,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "POST SALES ERROR:",
      error
    );

    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat transaksi",
      },
      {
        status: 400,
      }
    );
  } finally {
    client.release();
  }
}