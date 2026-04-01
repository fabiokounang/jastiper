const pool = require("../config/db");
const productModel = require("./productModel");

exports.createOrder = async (payload, db = pool) => {
  const [result] = await db.execute(
    `
      INSERT INTO orders (
        order_code,
        buyer_id,
        guest_email,
        guest_phone,
        checkout_mode,
        jastiper_id,
        trip_id,
        receiver_name,
        receiver_phone,
        shipping_address,
        province,
        city,
        postal_code,
        checkout_notes,
        status,
        payment_status,
        subtotal_amount,
        jastip_fee_amount,
        total_amount,
        currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.order_code,
      payload.buyer_id || null,
      payload.guest_email || null,
      payload.guest_phone || null,
      payload.checkout_mode || "guest",
      payload.jastiper_id,
      payload.trip_id,
      payload.receiver_name,
      payload.receiver_phone,
      payload.shipping_address,
      payload.province,
      payload.city,
      payload.postal_code,
      payload.checkout_notes || null,
      payload.status || "pending",
      payload.payment_status || "unpaid",
      payload.subtotal_amount,
      payload.jastip_fee_amount,
      payload.total_amount,
      payload.currency || "IDR",
    ],
  );

  return result.insertId;
};

exports.createOrderItems = async (orderId, items, db = pool) => {
  for (const item of items) {
    await db.execute(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_variant_id,
          product_name_snapshot,
          variant_snapshot,
          quantity,
          unit_price,
          jastip_fee,
          line_total,
          note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderId,
        item.product_id,
        item.product_variant_id || null,
        item.product_name_snapshot,
        item.variant_snapshot || null,
        item.quantity,
        item.unit_price,
        item.jastip_fee,
        item.line_total,
        item.note || null,
      ],
    );
  }
};

exports.generateOrderCode = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `JTP-${Date.now()}-${random}`;
};

exports.getProductsForCheckout = async (productIds, db = pool) => {
  const ids = (productIds || [])
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (!ids.length) {
    return [];
  }

  return productModel.findPublicByIds(ids, db);
};

exports.createOrderWithItems = async (orderPayload, items, db = pool) => {
  const connection = db === pool ? await pool.getConnection() : db;
  const ownsTransaction = db === pool;

  try {
    if (ownsTransaction) {
      await connection.beginTransaction();
    }

    const orderId = await exports.createOrder(orderPayload, connection);
    await exports.createOrderItems(orderId, items, connection);

    if (ownsTransaction) {
      await connection.commit();
    }

    return orderId;
  } catch (error) {
    if (ownsTransaction) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (ownsTransaction) {
      connection.release();
    }
  }
};

exports.findOrderWithItemsById = async (orderId, db = pool) => {
  const [orders] = await db.execute(
    `
      SELECT
        id,
        order_code,
        checkout_mode,
        receiver_name,
        receiver_phone,
        shipping_address,
        province,
        city,
        postal_code,
        checkout_notes,
        status,
        payment_status,
        subtotal_amount,
        jastip_fee_amount,
        total_amount,
        currency,
        ordered_at
      FROM orders
      WHERE id = ?
      LIMIT 1
    `,
    [orderId],
  );

  if (!orders.length) {
    return null;
  }

  const order = orders[0];
  const [items] = await db.execute(
    `
      SELECT
        id,
        product_id,
        product_name_snapshot,
        variant_snapshot,
        quantity,
        unit_price,
        jastip_fee,
        line_total,
        note
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
    `,
    [orderId],
  );

  return {
    ...order,
    items,
  };
};

