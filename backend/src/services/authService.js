const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { AppError } = require('../utils/http');

const JWT_SECRET = process.env.JWT_SECRET || 'hackquest-dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'hackquest-backend';
const SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 10);
const ADMIN_EMAILS = new Set(
  String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean)
);

let schemaReady = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,32}$/;

const ensureAuthSchema = async () => {
  if (schemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      wallet_address TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'user',
      backend_user_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_auth_users_wallet_address
    ON auth_users (wallet_address)
  `);

  schemaReady = true;
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizeUsername = (value) => String(value || '').trim();
const normalizeWallet = (value) => {
  const trimmed = String(value || '').trim();
  return trimmed || null;
};

const validateRegisterPayload = ({ email, username, password, displayName }) => {
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError(400, 'A valid email is required');
  }

  if (!USERNAME_REGEX.test(username)) {
    throw new AppError(400, 'Username must be 3-32 chars and use letters, numbers, underscore only');
  }

  if (String(password || '').length < 8) {
    throw new AppError(400, 'Password must be at least 8 characters');
  }

  if (!String(displayName || '').trim()) {
    throw new AppError(400, 'displayName is required');
  }
};

const resolveRoleForEmail = (email) => {
  return ADMIN_EMAILS.has(normalizeEmail(email)) ? 'admin' : 'user';
};

const toPublicAuthUser = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name,
    walletAddress: row.wallet_address,
    role: row.role,
    backendUserId: row.backend_user_id,
    createdAt: row.created_at,
  };
};

const issueAuthToken = (authUser) => {
  return jwt.sign(
    {
      sub: authUser.id,
      email: authUser.email,
      role: authUser.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
    }
  );
};

const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });
  } catch (error) {
    throw new AppError(401, 'Invalid or expired auth token');
  }
};

const findAuthUserByEmail = async (email) => {
  await ensureAuthSchema();
  const { rows } = await db.query(
    `
      SELECT *
      FROM auth_users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const findAuthUserByUsername = async (username) => {
  await ensureAuthSchema();
  const { rows } = await db.query(
    `
      SELECT *
      FROM auth_users
      WHERE username = $1
      LIMIT 1
    `,
    [username]
  );

  return rows[0] || null;
};

const findAuthUserById = async (id) => {
  await ensureAuthSchema();
  const { rows } = await db.query(
    `
      SELECT *
      FROM auth_users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

const resolveBackendUserByWallet = async (walletAddress) => {
  if (!walletAddress) {
    return null;
  }

  try {
    const { rows } = await db.query(
      `
        SELECT *
        FROM users
        WHERE algorand_wallet = $1
        LIMIT 1
      `,
      [walletAddress]
    );

    return rows[0] || null;
  } catch {
    return null;
  }
};

const resolveBackendUserById = async (userId) => {
  if (!userId) {
    return null;
  }

  try {
    const { rows } = await db.query(
      `
        SELECT *
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  } catch {
    return null;
  }
};

const resolveBackendUserByUsername = async (username) => {
  if (!username) {
    return null;
  }

  try {
    const { rows } = await db.query(
      `
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1
      `,
      [username]
    );

    return rows[0] || null;
  } catch {
    return null;
  }
};

const resolveBackendUser = async ({ backendUserId, walletAddress, username }) => {
  const byId = await resolveBackendUserById(backendUserId);
  if (byId) {
    return byId;
  }

  const byWallet = await resolveBackendUserByWallet(walletAddress);
  if (byWallet) {
    return byWallet;
  }

  return resolveBackendUserByUsername(username);
};

const register = async ({ email, username, password, displayName, walletAddress = null }) => {
  await ensureAuthSchema();

  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = normalizeUsername(username);
  const normalizedWallet = normalizeWallet(walletAddress);

  validateRegisterPayload({
    email: normalizedEmail,
    username: normalizedUsername,
    password,
    displayName,
  });

  const emailConflict = await findAuthUserByEmail(normalizedEmail);
  if (emailConflict) {
    throw new AppError(409, 'Email is already registered');
  }

  const usernameConflict = await findAuthUserByUsername(normalizedUsername);
  if (usernameConflict) {
    throw new AppError(409, 'Username is already taken');
  }

  const backendUser = await resolveBackendUser({
    backendUserId: null,
    walletAddress: normalizedWallet,
    username: normalizedUsername,
  });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = crypto.randomUUID();
  const role = resolveRoleForEmail(normalizedEmail);

  const { rows } = await db.query(
    `
      INSERT INTO auth_users (
        id,
        email,
        username,
        display_name,
        password_hash,
        wallet_address,
        role,
        backend_user_id,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
      RETURNING *
    `,
    [
      id,
      normalizedEmail,
      normalizedUsername,
      String(displayName || '').trim(),
      passwordHash,
      normalizedWallet,
      role,
      backendUser ? String(backendUser.id) : null,
    ]
  );

  const authUser = rows[0];

  return {
    authUser,
    token: issueAuthToken(authUser),
    backendUser: backendUser || null,
  };
};

const login = async ({ email, password }) => {
  await ensureAuthSchema();

  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError(400, 'A valid email is required');
  }

  const authUser = await findAuthUserByEmail(normalizedEmail);
  if (!authUser) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(String(password || ''), authUser.password_hash);
  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const backendUser = await resolveBackendUser({
    backendUserId: authUser.backend_user_id,
    walletAddress: authUser.wallet_address,
    username: authUser.username,
  });

  if (backendUser && String(backendUser.id) !== String(authUser.backend_user_id || '')) {
    await db.query(
      `
        UPDATE auth_users
        SET backend_user_id = $2,
            updated_at = now()
        WHERE id = $1
      `,
      [authUser.id, String(backendUser.id)]
    );
    authUser.backend_user_id = String(backendUser.id);
  }

  return {
    authUser,
    token: issueAuthToken(authUser),
    backendUser: backendUser || null,
  };
};

const linkWallet = async ({ authUserId, walletAddress }) => {
  await ensureAuthSchema();

  const normalizedWallet = normalizeWallet(walletAddress);
  if (!normalizedWallet) {
    throw new AppError(400, 'walletAddress is required');
  }

  const backendUser = await resolveBackendUserByWallet(normalizedWallet);

  const { rows } = await db.query(
    `
      UPDATE auth_users
      SET wallet_address = $2,
          backend_user_id = COALESCE($3, backend_user_id),
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [authUserId, normalizedWallet, backendUser ? String(backendUser.id) : null]
  );

  const authUser = rows[0] || null;
  if (!authUser) {
    throw new AppError(404, 'Auth user not found');
  }

  return {
    authUser,
    backendUser: backendUser || null,
    token: issueAuthToken(authUser),
  };
};

const getSessionProfile = async (authUser) => {
  const backendUser = await resolveBackendUser({
    backendUserId: authUser.backend_user_id,
    walletAddress: authUser.wallet_address,
    username: authUser.username,
  });

  return {
    authUser: toPublicAuthUser(authUser),
    backendUser: backendUser || null,
  };
};

module.exports = {
  ensureAuthSchema,
  toPublicAuthUser,
  issueAuthToken,
  verifyAuthToken,
  findAuthUserById,
  register,
  login,
  linkWallet,
  getSessionProfile,
};
