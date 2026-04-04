const db = require('../db');

const getUserById = async (userId) => {
  const { rows } = await db.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const getUserByWallet = async (walletAddress) => {
  const { rows } = await db.query(
    `
      SELECT *
      FROM users
      WHERE algorand_wallet = $1
      LIMIT 1
    `,
    [walletAddress]
  );

  return rows[0] || null;
};

module.exports = {
  getUserById,
  getUserByWallet,
};
