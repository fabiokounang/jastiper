const pool = require("../config/db");

exports.countSlug = async (baseSlug, userId, excludeTripId = null, db = pool) => {
  let sql = "SELECT COUNT(*) AS total FROM trips WHERE user_id = ? AND slug LIKE ?";
  const params = [userId, `${baseSlug}%`];

  if (excludeTripId) {
    sql += " AND id != ?";
    params.push(excludeTripId);
  }

  const [rows] = await db.execute(sql, params);
  return rows[0]?.total || 0;
};

exports.createTrip = async (payload, db = pool) => {
  const sql = `
    INSERT INTO trips (
      user_id,
      title,
      slug,
      destination_country,
      destination_city,
      cover_image,
      start_date,
      end_date,
      estimated_arrival_date,
      order_deadline,
      description,
      notes,
      jastip_fee_policy,
      currency,
      status,
      is_public,
      published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    payload.user_id,
    payload.title,
    payload.slug,
    payload.destination_country,
    payload.destination_city,
    payload.cover_image || null,
    payload.start_date,
    payload.end_date,
    payload.estimated_arrival_date || null,
    payload.order_deadline || null,
    payload.description || null,
    payload.notes || null,
    payload.jastip_fee_policy || null,
    payload.currency || "IDR",
    payload.status || "draft",
    payload.is_public ? 1 : 0,
    payload.published_at || null,
  ];

  const [result] = await db.execute(sql, params);
  return result.insertId;
};

exports.getDashboardSummary = async (userId, db = pool) => {
  const [tripRows] = await db.execute(
    `
      SELECT
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_trips,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_trips,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_trips
      FROM trips
      WHERE user_id = ?
    `,
    [userId],
  );

  const [productRows] = await db.execute(
    `
      SELECT COUNT(*) AS total_products
      FROM products
      WHERE user_id = ?
    `,
    [userId],
  );

  const [orderRows] = await db.execute(
    `
      SELECT COUNT(*) AS active_orders
      FROM orders
      WHERE jastiper_id = ?
        AND status IN ('pending','awaiting_payment','paid','confirmed','purchasing','purchased','shipped')
    `,
    [userId],
  );

  return {
    draft_trips: Number(tripRows[0]?.draft_trips || 0),
    published_trips: Number(tripRows[0]?.published_trips || 0),
    active_trips: Number(tripRows[0]?.active_trips || 0),
    total_products: Number(productRows[0]?.total_products || 0),
    active_orders: Number(orderRows[0]?.active_orders || 0),
  };
};

exports.getTripsByUser = async (userId, filters = {}, db = pool) => {
  let sql = `
    SELECT
      t.id,
      t.title,
      t.slug,
      t.destination_country,
      t.destination_city,
      t.start_date,
      t.end_date,
      t.order_deadline,
      t.currency,
      t.status,
      t.is_public,
      t.published_at,
      t.created_at,
      (SELECT COUNT(*) FROM products p WHERE p.trip_id = t.id) AS product_count
    FROM trips t
    WHERE t.user_id = ?
  `;
  const params = [userId];

  if (filters.status) {
    sql += " AND t.status = ?";
    params.push(filters.status);
  }

  sql += " ORDER BY t.created_at DESC";

  const [rows] = await db.execute(sql, params);
  return rows;
};

exports.findByUserId = async (userId, filters = {}, db = pool) => {
  return exports.getTripsByUser(userId, filters, db);
};

exports.findBySlug = async (slug, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        user_id,
        title,
        slug,
        destination_country,
        destination_city,
        cover_image,
        start_date,
        end_date,
        estimated_arrival_date,
        order_deadline,
        description,
        notes,
        jastip_fee_policy,
        currency,
        status,
        is_public,
        published_at
      FROM trips
      WHERE slug = ?
      LIMIT 1
    `,
    [slug],
  );

  return rows[0] || null;
};

exports.getTripByIdAndUser = async (tripId, userId, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        user_id,
        title,
        slug,
        destination_country,
        destination_city,
        cover_image,
        start_date,
        end_date,
        estimated_arrival_date,
        order_deadline,
        description,
        notes,
        jastip_fee_policy,
        currency,
        status,
        is_public,
        published_at,
        created_at,
        updated_at
      FROM trips
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [tripId, userId],
  );
  return rows[0] || null;
};

exports.findByIdAndUser = async (tripId, userId, db = pool) => {
  return exports.getTripByIdAndUser(tripId, userId, db);
};

exports.updateTrip = async (tripId, userId, payload, db = pool) => {
  const sql = `
    UPDATE trips
    SET
      title = ?,
      slug = ?,
      destination_country = ?,
      destination_city = ?,
      cover_image = ?,
      start_date = ?,
      end_date = ?,
      estimated_arrival_date = ?,
      order_deadline = ?,
      description = ?,
      notes = ?,
      jastip_fee_policy = ?,
      currency = ?,
      status = ?,
      is_public = ?,
      published_at = ?
    WHERE id = ? AND user_id = ?
  `;

  const params = [
    payload.title,
    payload.slug,
    payload.destination_country,
    payload.destination_city,
    payload.cover_image || null,
    payload.start_date,
    payload.end_date,
    payload.estimated_arrival_date || null,
    payload.order_deadline || null,
    payload.description || null,
    payload.notes || null,
    payload.jastip_fee_policy || null,
    payload.currency || "IDR",
    payload.status || "draft",
    payload.is_public ? 1 : 0,
    payload.published_at || null,
    tripId,
    userId,
  ];

  const [result] = await db.execute(sql, params);
  return result.affectedRows > 0;
};

exports.updateTripStatus = async (tripId, userId, status, isPublic, db = pool) => {
  const [result] = await db.execute(
    `
      UPDATE trips
      SET
        status = ?,
        is_public = ?,
        published_at = CASE
          WHEN ? = 'published' THEN NOW()
          ELSE published_at
        END
      WHERE id = ? AND user_id = ?
    `,
    [status, isPublic ? 1 : 0, status, tripId, userId],
  );

  return result.affectedRows > 0;
};

exports.setTripStatus = async (tripId, userId, status, db = pool) => {
  const publicStatuses = new Set(["published", "active"]);
  return exports.updateTripStatus(tripId, userId, status, publicStatuses.has(status), db);
};

exports.deleteTrip = async (tripId, userId, db = pool) => {
  const [result] = await db.execute("DELETE FROM trips WHERE id = ? AND user_id = ?", [
    tripId,
    userId,
  ]);
  return result.affectedRows > 0;
};

exports.getPublicTripBySlug = async (slug, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        t.id,
        t.user_id,
        t.title,
        t.slug,
        t.destination_country,
        t.destination_city,
        t.cover_image,
        t.start_date,
        t.end_date,
        t.estimated_arrival_date,
        t.order_deadline,
        t.description,
        t.notes,
        t.jastip_fee_policy,
        t.currency,
        t.status,
        t.is_public,
        up.shop_name,
        up.instagram_username,
        up.full_name
      FROM trips t
      LEFT JOIN user_profiles up ON up.user_id = t.user_id
      WHERE t.slug = ?
        AND t.is_public = 1
        AND t.status IN ('published','active')
      LIMIT 1
    `,
    [slug],
  );
  return rows[0] || null;
};

exports.findPublicBySlug = async (slug, db = pool) => {
  return exports.getPublicTripBySlug(slug, db);
};

