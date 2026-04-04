const db = require('../db');

const resolveTarget = (client) => (client && typeof client.query === 'function' ? client : db);

const createActivity = async (
  client,
  {
    userId = null,
    activityType,
    message,
    metadata = {},
    isPublic = true,
  }
) => {
  const target = resolveTarget(client);
  const { rows } = await target.query(
    `
      INSERT INTO activity_feed (user_id, activity_type, message, metadata, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [userId, activityType, message, metadata, isPublic]
  );

  return rows[0];
};

const getPublicFeed = async (limit = 30) => {
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 30;

  const { rows } = await db.query(
    `
      SELECT af.*, u.username, u.display_name, u.avatar_url
      FROM activity_feed af
      LEFT JOIN users u ON u.id = af.user_id
      WHERE af.is_public = true
      ORDER BY af.created_at DESC
      LIMIT $1
    `,
    [safeLimit]
  );

  return rows;
};

module.exports = {
  createActivity,
  getPublicFeed,
};
