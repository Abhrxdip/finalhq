const userService = require('../services/userService');
const { AppError, asyncHandler } = require('../utils/http');

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.status(200).json({
    user,
  });
});

const getUserByWallet = asyncHandler(async (req, res) => {
  const wallet = req.query.wallet || req.params.wallet;

  if (!wallet) {
    throw new AppError(400, 'wallet is required');
  }

  const user = await userService.getUserByWallet(wallet);
  if (!user) {
    throw new AppError(404, 'User not found for wallet');
  }

  res.status(200).json({ user });
});

module.exports = {
  getUserById,
  getUserByWallet,
};
