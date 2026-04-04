const activityService = require('../services/activityService');
const { asyncHandler } = require('../utils/http');

const getPublicActivity = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 30;
  const activity = await activityService.getPublicFeed(limit);

  res.status(200).json({
    activity,
  });
});

module.exports = {
  getPublicActivity,
};
