const pool = require("../config/db");

exports.createProfile = async (payload, db = pool) => {
  const sql = `
    INSERT INTO user_profiles (
      user_id,
      full_name,
      username_slug,
      shop_name,
      instagram_username,
      bio,
      profile_photo,
      address,
      city,
      province,
      bank_account_name,
      bank_account_number,
      bank_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    payload.user_id,
    payload.full_name,
    payload.username_slug || null,
    payload.shop_name || null,
    payload.instagram_username || null,
    payload.bio || null,
    payload.profile_photo || null,
    payload.address,
    payload.city,
    payload.province,
    payload.bank_account_name || null,
    payload.bank_account_number || null,
    payload.bank_name || null,
  ];

  const [result] = await db.execute(sql, params);
  return result.insertId;
};

exports.createProfileTx = async (payload, db = pool) => {
  const sql = `
    INSERT INTO user_profiles (
      user_id,
      full_name,
      username_slug,
      shop_name,
      instagram_username,
      bio,
      profile_photo,
      address,
      city,
      province,
      bank_account_name,
      bank_account_number,
      bank_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    payload.user_id,
    payload.full_name,
    payload.username_slug || null,
    payload.shop_name || null,
    payload.instagram_username || null,
    payload.bio || null,
    payload.profile_photo || null,
    payload.address,
    payload.city,
    payload.province,
    payload.bank_account_name || null,
    payload.bank_account_number || null,
    payload.bank_name || null,
  ];

  const [result] = await db.execute(sql, params);
  return result.insertId;
};
