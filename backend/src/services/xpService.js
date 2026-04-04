const db = require('../db');

const XP_MILESTONES = [100, 500, 1000];

const resolveTarget = (client) => (client && typeof client.query === 'function' ? client : db);

const getLevelFromXp = (xp) => {
  const xpPerLevel = Number(process.env.XP_PER_LEVEL || 100);
  const normalizedXp = Number(xp || 0);
  return Math.max(1, Math.floor(normalizedXp / xpPerLevel) + 1);
};

const awardQuestXp = async (
  client,
  {
    user,
    quest,
    source = 'quest',
    sourceId = null,
    algoTxId = null,
  }
) => {
  const target = resolveTarget(client);
  const xpAmount = Number(quest.xp_reward || 0);
  const previousXp = Number(user.total_xp || 0);
  const nextXp = previousXp + xpAmount;
  const previousLevel = Number(user.player_level || 1);
  const nextLevel = getLevelFromXp(nextXp);

  const { rows: updatedRows } = await target.query(
    `
      UPDATE users
      SET total_xp = $2,
          cumulative_xp = COALESCE(cumulative_xp, 0) + $3,
          player_level = $4,
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [user.id, nextXp, xpAmount, nextLevel]
  );

  await target.query(
    `
      INSERT INTO xp_logs (user_id, amount, source, source_id, algo_tx_id)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [user.id, xpAmount, source, sourceId, algoTxId]
  );

  const milestonesReached = XP_MILESTONES.filter(
    (milestone) => previousXp < milestone && nextXp >= milestone
  );

  return {
    updatedUser: updatedRows[0],
    xpAmount,
    previousXp,
    nextXp,
    previousLevel,
    nextLevel,
    levelUp: nextLevel > previousLevel,
    milestonesReached,
  };
};

module.exports = {
  XP_MILESTONES,
  getLevelFromXp,
  awardQuestXp,
};
