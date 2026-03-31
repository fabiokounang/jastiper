const pool = require("../config/db");

const baseSelect = `
  SELECT
    id,
    role,
    email,
    phone,
    password_hash,
    status,
    verification_status,
    last_login_at,
    created_at,
    updated_at
  FROM users
`;

exports.findByEmail = async (email, db = pool) => {
  const [rows] = await db.execute(`${baseSelect} WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
};

exports.findByPhone = async (phone, db = pool) => {
  const [rows] = await db.execute(`${baseSelect} WHERE phone = ? LIMIT 1`, [phone]);
  return rows[0] || null;
};

exports.findById = async (id, db = pool) => {
  const [rows] = await db.execute(`${baseSelect} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

exports.createUser = async (payload, db = pool) => {
  const { role, email, phone, passwordHash, status, verificationStatus } = payload;
  const [result] = await db.execute(
    `
      INSERT INTO users (role, email, phone, password_hash, status, verification_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [role, email, phone, passwordHash, status, verificationStatus],
  );

  return result.insertId;
};

exports.updateLastLoginAt = async (id, db = pool) => {
  await db.execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [id]);
};

// Backward-compatible aliases used by controllers.
exports.create = exports.createUser;
exports.updateLastLogin = exports.updateLastLoginAt;
