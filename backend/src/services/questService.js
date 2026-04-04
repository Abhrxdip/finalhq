const db = require('../db');
const { AppError } = require('../utils/http');
const xpService = require('./xpService');
const nftService = require('./nftService');
const leaderboardService = require('./leaderboardService');
const blockchainService = require('./blockchainService');
const activityService = require('./activityService');
const eventService = require('./eventService');
const { emitEvent } = require('../sockets');

const getQuestById = async (client, questId) => {
  const target = client && typeof client.query === 'function' ? client : db;
  const { rows } = await target.query(
    `
      SELECT *
      FROM quests
      WHERE id = $1
      LIMIT 1
    `,
    [questId]
  );

  return rows[0] || null;
};

const getQuests = async ({ eventId = null, userId = null, activeOnly = true } = {}) => {
  const values = [];
  const filters = [];

  if (activeOnly) {
    filters.push('q.is_active = true');
  }

  if (eventId) {
    values.push(eventId);
    filters.push(`q.event_id = $${values.length}`);
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  if (userId) {
    values.push(userId);
    const userIdParam = `$${values.length}`;

    const { rows } = await db.query(
      `
        SELECT
          q.*,
          qp.current_value,
          qp.is_completed,
          qp.completed_at
        FROM quests q
        LEFT JOIN quest_progress qp
          ON qp.quest_id = q.id
         AND qp.user_id = ${userIdParam}
        ${whereClause}
        ORDER BY q.created_at ASC
      `,
      values
    );

    return rows;
  }

  const { rows } = await db.query(
    `
      SELECT q.*
      FROM quests q
      ${whereClause}
      ORDER BY q.created_at ASC
    `,
    values
  );

  return rows;
};

const getEventQuestCount = async (client, eventId) => {
  const target = client && typeof client.query === 'function' ? client : db;
  const { rows } = await target.query(
    `
      SELECT COUNT(*)::int AS total
      FROM quests
      WHERE event_id = $1
    `,
    [eventId]
  );

  return rows[0] ? Number(rows[0].total) : 0;
};

const getCompletedQuestCountForEvent = async (client, userId, eventId) => {
  const target = client && typeof client.query === 'function' ? client : db;
  const { rows } = await target.query(
    `
      SELECT COUNT(*)::int AS total
      FROM quest_progress qp
      INNER JOIN quests q ON q.id = qp.quest_id
      WHERE qp.user_id = $1
        AND q.event_id = $2
        AND qp.is_completed = true
    `,
    [userId, eventId]
  );

  return rows[0] ? Number(rows[0].total) : 0;
};

const completeQuest = async ({ userId, questId }) => {
  if (!userId || !questId) {
    throw new AppError(400, 'userId and questId are required');
  }

  const txnResult = await db.withTransaction(async (client) => {
    const userRes = await client.query(
      `
        SELECT *
        FROM users
        WHERE id = $1
        LIMIT 1
        FOR UPDATE
      `,
      [userId]
    );

    const user = userRes.rows[0];
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const quest = await getQuestById(client, questId);
    if (!quest || !quest.is_active) {
      throw new AppError(404, 'Active quest not found');
    }

    const event = await eventService.getEventById(quest.event_id);
    if (!event) {
      throw new AppError(404, 'Event linked to quest was not found');
    }

    const progressRes = await client.query(
      `
        SELECT *
        FROM quest_progress
        WHERE user_id = $1 AND quest_id = $2
        LIMIT 1
        FOR UPDATE
      `,
      [userId, questId]
    );

    if (progressRes.rows[0] && progressRes.rows[0].is_completed) {
      throw new AppError(409, 'Quest already completed');
    }

    let questProgress = progressRes.rows[0];
    if (questProgress) {
      const updateProgress = await client.query(
        `
          UPDATE quest_progress
          SET current_value = 1,
              is_completed = true,
              completed_at = now(),
              updated_at = now()
          WHERE id = $1
          RETURNING *
        `,
        [questProgress.id]
      );
      questProgress = updateProgress.rows[0];
    } else {
      const insertProgress = await client.query(
        `
          INSERT INTO quest_progress (quest_id, user_id, current_value, is_completed, completed_at)
          VALUES ($1, $2, 1, true, now())
          RETURNING *
        `,
        [questId, userId]
      );
      questProgress = insertProgress.rows[0];
    }

    await eventService.ensureParticipant(client, {
      eventId: quest.event_id,
      userId,
    });

    const completedQuestCount = await client.query(
      `
        SELECT COUNT(*)::int AS total
        FROM quest_progress
        WHERE user_id = $1 AND is_completed = true
      `,
      [userId]
    );
    const totalCompleted = Number(completedQuestCount.rows[0].total);
    const isFirstQuest = totalCompleted === 1;

    const shouldRecordProof =
      isFirstQuest || Number(quest.xp_reward || 0) >= 100;

    let proofResult = null;
    if (shouldRecordProof) {
      proofResult = await blockchainService.recordProofTransaction(
        user,
        quest,
        Number(quest.xp_reward || 0)
      );
    }

    const xpOutcome = await xpService.awardQuestXp(client, {
      user,
      quest,
      source: 'quest',
      sourceId: quest.id,
      algoTxId: proofResult ? proofResult.txId : null,
    });

    await client.query(
      `
        UPDATE event_participants
        SET xp_earned = COALESCE(xp_earned, 0) + $3
        WHERE event_id = $1 AND user_id = $2
      `,
      [quest.event_id, userId, xpOutcome.xpAmount]
    );

    const questActivity = await activityService.createActivity(client, {
      userId,
      activityType: 'quest_completed',
      message: `${user.display_name} completed quest ${quest.name}`,
      metadata: {
        questId: quest.id,
        eventId: quest.event_id,
        xpAwarded: xpOutcome.xpAmount,
        proofTxId: proofResult ? proofResult.txId : null,
      },
      isPublic: true,
    });

    await leaderboardService.recomputeRanks(client);
    const rankSnapshot = await leaderboardService.getUserRank(client, userId);

    const totalEventQuests = await getEventQuestCount(client, quest.event_id);
    const completedEventQuests = await getCompletedQuestCountForEvent(
      client,
      userId,
      quest.event_id
    );

    const eventCompleted =
      totalEventQuests > 0 && completedEventQuests >= totalEventQuests;

    const nftTriggers = [];
    if (isFirstQuest) {
      nftTriggers.push('first_quest');
    }
    if (xpOutcome.milestonesReached.length > 0) {
      for (const milestone of xpOutcome.milestonesReached) {
        nftTriggers.push(`xp_${milestone}`);
      }
    }
    if (eventCompleted) {
      nftTriggers.push('event_completion');
    }
    if (rankSnapshot && Number(rankSnapshot.rank_position) > 0 && Number(rankSnapshot.rank_position) <= 3) {
      nftTriggers.push(`top_rank_${rankSnapshot.rank_position}`);
    }

    let mintedNft = null;
    if (nftTriggers.length > 0) {
      mintedNft = await nftService.mintAndStoreAchievement(client, {
        user: {
          ...user,
          ...xpOutcome.updatedUser,
        },
        quest,
        trigger: nftTriggers[0],
      });
    }

    return {
      quest,
      progress: questProgress,
      xpOutcome,
      proofResult,
      rankSnapshot,
      questActivity,
      mintedNft,
      nftTriggers,
    };
  });

  const leaderboard = await leaderboardService.broadcastLeaderboard(20);
  emitEvent('activity:update', txnResult.questActivity);

  if (txnResult.mintedNft && txnResult.mintedNft.minted) {
    emitEvent('activity:update', txnResult.mintedNft.activity);
    emitEvent('nft:minted', {
      ownership: txnResult.mintedNft.ownership,
      nftDefinition: txnResult.mintedNft.definition,
      chain: txnResult.mintedNft.chainResult,
      trigger: txnResult.nftTriggers[0],
    });
  }

  return {
    message: 'Quest completed successfully',
    quest: txnResult.quest,
    progress: txnResult.progress,
    xp: {
      gained: txnResult.xpOutcome.xpAmount,
      total: txnResult.xpOutcome.nextXp,
      level: txnResult.xpOutcome.nextLevel,
      levelUp: txnResult.xpOutcome.levelUp,
      milestonesReached: txnResult.xpOutcome.milestonesReached,
    },
    proof: txnResult.proofResult,
    nft: txnResult.mintedNft,
    rank: txnResult.rankSnapshot,
    leaderboard,
  };
};

const getQuestProgressByUser = async ({ userId, eventId = null }) => {
  const values = [userId];
  let extraFilter = '';

  if (eventId) {
    values.push(eventId);
    extraFilter = `AND q.event_id = $${values.length}`;
  }

  const { rows } = await db.query(
    `
      SELECT
        q.id AS quest_id,
        q.name,
        q.description,
        q.event_id,
        q.xp_reward,
        qp.current_value,
        qp.is_completed,
        qp.completed_at
      FROM quests q
      LEFT JOIN quest_progress qp
        ON qp.quest_id = q.id
       AND qp.user_id = $1
      WHERE q.is_active = true
      ${extraFilter}
      ORDER BY q.created_at ASC
    `,
    values
  );

  return rows;
};

module.exports = {
  getQuests,
  getQuestById,
  completeQuest,
  getQuestProgressByUser,
};
