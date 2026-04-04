const leaderboardService = require('../services/leaderboardService');
const { asyncHandler } = require('../utils/http');

const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const leaderboard = await leaderboardService.getLeaderboard(limit);

  res.status(200).json({
    leaderboard,
  });
});

module.exports = {
  getLeaderboard,
};
