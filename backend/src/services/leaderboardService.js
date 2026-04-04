const db = require('../db');
const { emitEvent } = require('../sockets');

const resolveTarget = (client) => (client && typeof client.query === 'function' ? client : db);

const recomputeRanks = async (client = db) => {
  const target = resolveTarget(client);

  await target.query(`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY total_xp DESC, cumulative_xp DESC, created_at ASC) AS next_rank
      FROM users
      WHERE is_active = true
    )
    UPDATE users u
    SET rank_position = r.next_rank,
        updated_at = now()
    FROM ranked r
    WHERE u.id = r.id
  `);
};

const fetchLeaderboard = async ({ client = db, limit = 50, skipRecompute = false } = {}) => {
  const target = resolveTarget(client);
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 50;

  if (!skipRecompute) {
    await recomputeRanks(target);
  }

  const { rows } = await target.query(
    `
      SELECT
        id,
        username,
        display_name,
        avatar_url,
        total_xp,
        player_level,
        rank_position
      FROM users
      WHERE is_active = true
      ORDER BY rank_position ASC NULLS LAST, total_xp DESC
      LIMIT $1
    `,
    [safeLimit]
  );

  return rows;
};

const getLeaderboard = async (limit = 50) => fetchLeaderboard({ limit });

const getUserRank = async (client, userId) => {
  const target = resolveTarget(client);
  const { rows } = await target.query(
    `
      SELECT id, rank_position, total_xp, player_level
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};

const broadcastLeaderboard = async (limit = 20) => {
  const leaderboard = await getLeaderboard(limit);
  emitEvent('leaderboard:update', leaderboard);
  return leaderboard;
};

module.exports = {
  recomputeRanks,
  fetchLeaderboard,
  getLeaderboard,
  getUserRank,
  broadcastLeaderboard,
};
