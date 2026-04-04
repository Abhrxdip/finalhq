const { asyncHandler } = require('../utils/http');

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'HackQuest Backend',
    timestamp: new Date().toISOString(),
  });
});

module.exports = {
  healthCheck,
};
