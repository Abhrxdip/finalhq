const db = require('../db');
const blockchainService = require('./blockchainService');
const activityService = require('./activityService');

const resolveTarget = (client) => (client && typeof client.query === 'function' ? client : db);

const pickAchievementDefinition = async (client, { eventId = null }) => {
  const target = resolveTarget(client);

  if (eventId) {
    const byEvent = await target.query(
      `
        SELECT *
        FROM nft_definitions
        WHERE event_id = $1
          AND minted_count < COALESCE(total_supply, 1)
        ORDER BY nft_type DESC, created_at ASC
        LIMIT 1
      `,
      [eventId]
    );

    if (byEvent.rows[0]) {
      return byEvent.rows[0];
    }
  }

  const fallback = await target.query(
    `
      SELECT *
      FROM nft_definitions
      WHERE minted_count < COALESCE(total_supply, 1)
      ORDER BY nft_type DESC, created_at ASC
      LIMIT 1
    `
  );

  return fallback.rows[0] || null;
};

const mintAndStoreAchievement = async (
  client,
  {
    user,
    quest,
    trigger,
  }
) => {
  const target = resolveTarget(client);
  const definition = await pickAchievementDefinition(target, {
    eventId: quest.event_id,
  });

  if (!definition) {
    return {
      minted: false,
      reason: 'No NFT definition available for minting',
    };
  }

  const chainResult = await blockchainService.mintAchievementNFT(user, quest, definition);

  const { rows } = await target.query(
    `
      INSERT INTO nft_ownership (
        nft_def_id,
        owner_id,
        algo_audit_tx,
        acquired_via,
        on_chain_tx,
        on_chain_network
      )
      VALUES ($1, $2, $3, 'event_win', $4, $5)
      RETURNING *
    `,
    [
      definition.id,
      user.id,
      chainResult.txId,
      chainResult.txId,
      chainResult.network,
    ]
  );

  await target.query(
    `
      UPDATE nft_definitions
      SET minted_count = COALESCE(minted_count, 0) + 1
      WHERE id = $1
    `,
    [definition.id]
  );

  await target.query(
    `
      UPDATE users
      SET nft_count = COALESCE(nft_count, 0) + 1,
          updated_at = now()
      WHERE id = $1
    `,
    [user.id]
  );

  const activity = await activityService.createActivity(target, {
    userId: user.id,
    activityType: 'nft_earned',
    message: `${user.display_name} earned NFT: ${definition.name}`,
    metadata: {
      trigger,
      questId: quest.id,
      nftDefinitionId: definition.id,
      ownershipId: rows[0].id,
      txId: chainResult.txId,
      simulated: chainResult.simulated,
    },
    isPublic: true,
  });

  return {
    minted: true,
    ownership: rows[0],
    definition,
    chainResult,
    activity,
  };
};

module.exports = {
  pickAchievementDefinition,
  mintAndStoreAchievement,
};
