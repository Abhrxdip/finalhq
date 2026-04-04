const authService = require('../services/authService');
const { AppError } = require('../utils/http');

const parseBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const requireAuth = async (req, res, next) => {
  try {
    const token = parseBearerToken(req);
    if (!token) {
      throw new AppError(401, 'Authorization token is required');
    }

    const decoded = authService.verifyAuthToken(token);
    const authUser = await authService.findAuthUserById(decoded.sub);

    if (!authUser) {
      throw new AppError(401, 'Auth user not found for token');
    }

    req.auth = decoded;
    req.authUser = authUser;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.authUser || req.authUser.role !== 'admin') {
    next(new AppError(403, 'Admin role required'));
    return;
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
};
