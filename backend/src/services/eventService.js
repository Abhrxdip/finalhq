const db = require('../db');

const getEventById = async (eventId) => {
  const { rows } = await db.query(
    `
      SELECT *
      FROM events
      WHERE id = $1
      LIMIT 1
    `,
    [eventId]
  );

  return rows[0] || null;
};

const getEvents = async ({ status = null } = {}) => {
  const filters = [];
  const values = [];

  if (status) {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const { rows } = await db.query(
    `
      SELECT *
      FROM events
      ${whereClause}
      ORDER BY start_date ASC
    `,
    values
  );

  return rows;
};

const ensureParticipant = async (client, { eventId, userId }) => {
  const target = client && typeof client.query === 'function' ? client : db;

  const existing = await target.query(
    `
      SELECT *
      FROM event_participants
      WHERE event_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [eventId, userId]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const inserted = await target.query(
    `
      INSERT INTO event_participants (event_id, user_id, xp_earned)
      VALUES ($1, $2, 0)
      RETURNING *
    `,
    [eventId, userId]
  );

  return inserted.rows[0];
};

module.exports = {
  getEventById,
  getEvents,
  ensureParticipant,
};
