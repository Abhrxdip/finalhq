const authService = require('../services/authService');
const { AppError, asyncHandler } = require('../utils/http');

const register = asyncHandler(async (req, res) => {
  const { email, username, password, displayName, walletAddress } = req.body || {};

  const result = await authService.register({
    email,
    username,
    password,
    displayName,
    walletAddress,
  });

  res.status(201).json({
    token: result.token,
    user: authService.toPublicAuthUser(result.authUser),
    backendUser: result.backendUser,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError(400, 'email and password are required');
  }

  const result = await authService.login({
    email,
    password,
  });

  res.status(200).json({
    token: result.token,
    user: authService.toPublicAuthUser(result.authUser),
    backendUser: result.backendUser,
  });
});

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getSessionProfile(req.authUser);

  res.status(200).json(profile);
});

const linkWallet = asyncHandler(async (req, res) => {
  const { walletAddress } = req.body || {};

  if (!walletAddress) {
    throw new AppError(400, 'walletAddress is required');
  }

  const result = await authService.linkWallet({
    authUserId: req.authUser.id,
    walletAddress,
  });

  res.status(200).json({
    token: result.token,
    user: authService.toPublicAuthUser(result.authUser),
    backendUser: result.backendUser,
  });
});

const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: 'Logged out',
  });
});

module.exports = {
  register,
  login,
  me,
  linkWallet,
  logout,
};
