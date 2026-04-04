const questService = require('../services/questService');
const { AppError, asyncHandler } = require('../utils/http');

const listQuests = asyncHandler(async (req, res) => {
  const { eventId, userId } = req.query;
  const quests = await questService.getQuests({
    eventId: eventId || null,
    userId: userId || null,
    activeOnly: true,
  });

  res.status(200).json({
    quests,
  });
});

const completeQuest = asyncHandler(async (req, res) => {
  const { userId, questId } = req.body || {};

  if (!userId || !questId) {
    throw new AppError(400, 'userId and questId are required');
  }

  const result = await questService.completeQuest({ userId, questId });

  res.status(200).json(result);
});

const getQuestProgress = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const eventId = req.query.eventId || null;
  const progress = await questService.getQuestProgressByUser({ userId, eventId });

  res.status(200).json({
    userId,
    eventId,
    progress,
  });
});

module.exports = {
  listQuests,
  completeQuest,
  getQuestProgress,
};
