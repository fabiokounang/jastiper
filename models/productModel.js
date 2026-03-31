const pool = require("../config/db");

exports.countByUser = async (userId, db = pool) => {
  const [rows] = await pool.execute(
    `
      SELECT
        COUNT(*) AS total_products,
        SUM(CASE WHEN product_status = 'published' THEN 1 ELSE 0 END) AS published_products,
        SUM(CASE WHEN product_status = 'sold_out' THEN 1 ELSE 0 END) AS sold_out_products
      FROM products
      WHERE user_id = ?
    `,
    [userId],
  );

  return (
    rows[0] || {
      total_products: 0,
      published_products: 0,
      sold_out_products: 0,
    }
  );
};

exports.findByTrip = async (tripId, userId, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        p.id,
        p.trip_id,
        p.user_id,
        p.name,
        p.slug,
        p.category,
        p.brand,
        p.sku,
        p.description,
        p.base_price,
        p.jastip_fee,
        p.final_price_estimate,
        p.currency,
        p.stock,
        p.weight,
        p.purchase_location,
        p.preorder_type,
        p.availability_status,
        p.product_status,
        p.notes,
        p.tags,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.trip_id = ? AND p.user_id = ?
      ORDER BY p.created_at DESC
    `,
    [tripId, userId],
  );
  return rows;
};

exports.findById = async (id, userId, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        p.id,
        p.trip_id,
        p.user_id,
        p.name,
        p.slug,
        p.category,
        p.brand,
        p.sku,
        p.description,
        p.base_price,
        p.jastip_fee,
        p.final_price_estimate,
        p.currency,
        p.stock,
        p.weight,
        p.purchase_location,
        p.preorder_type,
        p.availability_status,
        p.product_status,
        p.notes,
        p.tags,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.id = ? AND p.user_id = ?
      LIMIT 1
    `,
    [id, userId],
  );
  return rows[0] || null;
};

exports.findByTripAndSlugPublic = async (tripId, slug, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        p.id,
        p.trip_id,
        p.user_id,
        p.name,
        p.slug,
        p.category,
        p.brand,
        p.sku,
        p.description,
        p.base_price,
        p.jastip_fee,
        p.final_price_estimate,
        p.currency,
        p.stock,
        p.weight,
        p.purchase_location,
        p.preorder_type,
        p.availability_status,
        p.product_status,
        p.notes,
        p.tags,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.trip_id = ? AND p.slug = ? AND p.product_status IN ('published', 'sold_out')
      LIMIT 1
    `,
    [tripId, slug],
  );
  return rows[0] || null;
};

exports.slugExistsForTrip = async (tripId, slug, excludeId = null, db = pool) => {
  if (excludeId) {
    const [rows] = await db.execute(
      "SELECT id FROM products WHERE trip_id = ? AND slug = ? AND id <> ? LIMIT 1",
      [tripId, slug, excludeId],
    );
    return rows.length > 0;
  }

  const [rows] = await db.execute(
    "SELECT id FROM products WHERE trip_id = ? AND slug = ? LIMIT 1",
    [tripId, slug],
  );
  return rows.length > 0;
};

exports.create = async (payload, db = pool) => {
  const [result] = await db.execute(
    `
      INSERT INTO products (
        trip_id,
        user_id,
        name,
        slug,
        category,
        brand,
        sku,
        description,
        base_price,
        jastip_fee,
        final_price_estimate,
        currency,
        stock,
        weight,
        purchase_location,
        preorder_type,
        availability_status,
        product_status,
        notes,
        tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.trip_id,
      payload.user_id,
      payload.name,
      payload.slug,
      payload.category || null,
      payload.brand || null,
      payload.sku || null,
      payload.description || null,
      payload.base_price,
      payload.jastip_fee,
      payload.final_price_estimate,
      payload.currency || "IDR",
      payload.stock || 0,
      payload.weight || null,
      payload.purchase_location || null,
      payload.preorder_type || null,
      payload.availability_status || "available",
      payload.product_status || "draft",
      payload.notes || null,
      payload.tags || null,
    ],
  );

  return result.insertId;
};

exports.update = async (id, userId, payload, db = pool) => {
  const [result] = await db.execute(
    `
      UPDATE products
      SET
        name = ?,
        slug = ?,
        category = ?,
        brand = ?,
        sku = ?,
        description = ?,
        base_price = ?,
        jastip_fee = ?,
        final_price_estimate = ?,
        currency = ?,
        stock = ?,
        weight = ?,
        purchase_location = ?,
        preorder_type = ?,
        availability_status = ?,
        product_status = ?,
        notes = ?,
        tags = ?
      WHERE id = ? AND user_id = ?
    `,
    [
      payload.name,
      payload.slug,
      payload.category || null,
      payload.brand || null,
      payload.sku || null,
      payload.description || null,
      payload.base_price,
      payload.jastip_fee,
      payload.final_price_estimate,
      payload.currency || "IDR",
      payload.stock || 0,
      payload.weight || null,
      payload.purchase_location || null,
      payload.preorder_type || null,
      payload.availability_status || "available",
      payload.product_status || "draft",
      payload.notes || null,
      payload.tags || null,
      id,
      userId,
    ],
  );

  return result.affectedRows > 0;
};

exports.updateStatus = async (id, userId, status, db = pool) => {
  const [result] = await db.execute(
    "UPDATE products SET product_status = ? WHERE id = ? AND user_id = ?",
    [status, id, userId],
  );
  return result.affectedRows > 0;
};

exports.remove = async (id, userId, db = pool) => {
  const [result] = await db.execute("DELETE FROM products WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
  return result.affectedRows > 0;
};

exports.addImage = async (productId, imagePath, isPrimary = false, db = pool) => {
  const [result] = await db.execute(
    `
      INSERT INTO product_images (product_id, image_path, is_primary, sort_order)
      VALUES (?, ?, ?, 0)
    `,
    [productId, imagePath, isPrimary ? 1 : 0],
  );
  return result.insertId;
};

exports.clearPrimaryImage = async (productId, db = pool) => {
  await db.execute("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", [productId]);
};

exports.listImagesByProductId = async (productId, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT id, product_id, image_path, is_primary, sort_order, created_at
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, sort_order ASC, id ASC
    `,
    [productId],
  );
  return rows;
};

exports.listPublicByTripId = async (tripId, db = pool) => {
  const [rows] = await db.execute(
    `
      SELECT
        p.id,
        p.trip_id,
        p.name,
        p.slug,
        p.category,
        p.brand,
        p.description,
        p.base_price,
        p.jastip_fee,
        p.final_price_estimate,
        p.currency,
        p.stock,
        p.availability_status,
        p.product_status,
        p.preorder_type,
        p.notes,
        p.tags,
        (
          SELECT pi.image_path
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS primary_image
      FROM products p
      WHERE p.trip_id = ?
        AND p.product_status IN ('published', 'sold_out')
      ORDER BY p.created_at DESC
    `,
    [tripId],
  );
  return rows;
};

exports.findPublicByTripAndSlug = async (tripId, slug, db = pool) => {
  const product = await exports.findByTripAndSlugPublic(tripId, slug, db);
  if (!product) {
    return null;
  }

  const images = await exports.listImagesByProductId(product.id, db);
  return {
    ...product,
    primary_image: images[0]?.image_path || null,
  };
};

exports.findByTripIdAndUser = exports.findByTrip;
exports.findByIdAndUser = exports.findById;
exports.findByTripAndSlug = async (tripId, slug, db = pool) => {
  const [rows] = await db.execute(
    "SELECT id, trip_id, slug FROM products WHERE trip_id = ? AND slug = ? LIMIT 1",
    [tripId, slug],
  );
  return rows[0] || null;
};
exports.createProduct = exports.create;
exports.updateProduct = exports.update;
exports.setProductStatus = exports.updateStatus;
exports.deleteProduct = exports.remove;
exports.markSoldOut = async (id, userId, db = pool) => {
  const [result] = await db.execute(
    "UPDATE products SET product_status = 'sold_out', availability_status = 'sold_out' WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.affectedRows > 0;
};
