const db = require("../config/db");

const createVerification = async (payload, conn = db) => {
  const query = `
    INSERT INTO user_verifications (
      user_id,
      ktp_number,
      ktp_photo_path,
      selfie_with_ktp_path,
      status
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    payload.userId,
    payload.ktpNumber,
    payload.ktpPhotoPath,
    payload.selfieWithKtpPath || null,
    payload.status || "pending",
  ];

  const [result] = await conn.execute(query, values);
  return result.insertId;
};

module.exports = {
  createVerification,
};
