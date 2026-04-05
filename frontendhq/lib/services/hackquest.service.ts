type GenericRecord = Record<string, unknown>;

export type QuestView = {
  [key: string]: unknown;
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  description: string;
  difficulty: string;
  xp: number;
  timeLimit: string;
  completions: number;
  status: string;
  progress: number;
  requirements: string[];
  tags: string[];
};

export type UserProfile = {
  [key: string]: unknown;
  backendUserId: string;
  authUserId: string;
  username: string;
  displayName: string;
  email: string;
  walletAddress: string;
  className: string;
  level: number;
  rank: number;
  totalXp: number;
  nftCount: number;
};

export type AccountRole = "admin" | "organizer" | "user";

export type AdminUserInfo = {
  username: string;
  displayName: string;
  email: string;
  role: AccountRole;
  walletAddress: string;
  level: number;
  rank: number;
  totalXp: number;
  nftCount: number;
  lastActive: string;
  flags: string[];
  source: "directory" | "viewer-profile";
};

export type LeaderboardView = {
  [key: string]: unknown;
  rank: number;
  username: string;
  displayName: string;
  class: string;
  level: number;
  xp: number;
  quests: number;
  nfts: number;
  lastActive: string;
  change: string;
};

export type ActivityView = {
  [key: string]: unknown;
  id: number;
  type: string;
  player: string;
  avatar: string | null;
  event: string;
  detail: string;
  time: string;
  reactions: Record<string, number>;
  xp?: string;
};

export type MarketplaceItemView = {
  [key: string]: unknown;
  id: string;
  name: string;
  rarity: string;
  questFrom: string;
  earnedDate: string;
  price: number;
  stock: number;
  icon: string;
  owned: boolean;
  txHash?: string;
};

export type NotificationView = {
  [key: string]: unknown;
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export type WalletTransactionView = {
  [key: string]: unknown;
  hash: string;
  type: string;
  amount: string;
  date: string;
  status: string;
};

type AuthUser = {
  id: string;
  email: string;
  role: AccountRole;
  username: string;
  displayName: string;
  backendUserId: string;
};

type AuthSession = {
  token: string;
  authUser: AuthUser | null;
};

type WalletSession = {
  walletAddress: string;
  walletProvider: string | null;
};

type RegisteredPlayer = UserProfile & {
  role: AccountRole;
  password: string;
  createdAt: string;
  lastActiveAt: string;
};

const AUTH_SESSION_KEY = "hackquest.auth.session";
const WALLET_SESSION_KEY = "hackquest.wallet.session";
const PROFILE_KEY = "hackquest.profile";
const PLAYERS_KEY = "hackquest.players.v1";
const ADMIN_ACCESS_KEY = "HQ-ADMIN-2026";

let memoryAuthSession: AuthSession | null = null;
let memoryWalletSession: WalletSession | null = null;
let memoryProfile: UserProfile | null = null;
let memoryPlayers: RegisteredPlayer[] | null = null;

const defaultProfile: UserProfile = {
  backendUserId: "user_default",
  authUserId: "auth_default",
  username: "player",
  displayName: "Player",
  email: "player@hackquest.dev",
  walletAddress: "ALGO_PLAYER_DEFAULT",
  className: "Architect",
  level: 1,
  rank: 1,
  totalXp: 0,
  nftCount: 0,
};

const sampleQuests: QuestView[] = [
  {
    id: "q-smart-contract",
    title: "Deploy Smart Contract",
    category: "Building",
    categoryColor: "#00ff41",
    description: "Build and deploy an Algorand smart contract using PyTeal or Beaker.",
    difficulty: "MEDIUM",
    xp: 500,
    timeLimit: "48h",
    completions: 112,
    status: "In Progress",
    progress: 62,
    requirements: [
      "Deploy contract to testnet",
      "Ship test coverage > 80%",
      "Provide public repository",
    ],
    tags: ["smart-contract", "algorand", "pyteal"],
  },
  {
    id: "q-defi-dashboard",
    title: "DeFi Dashboard",
    category: "Deploy",
    categoryColor: "#3b82f6",
    description: "Create a live dashboard that consumes on-chain activity metrics.",
    difficulty: "HARD",
    xp: 900,
    timeLimit: "72h",
    completions: 49,
    status: "Available",
    progress: 0,
    requirements: ["Live demo", "Wallet connect", "Responsive UI"],
    tags: ["defi", "frontend", "analytics"],
  },
  {
    id: "q-technical-docs",
    title: "Write Technical Documentation",
    category: "Documentation",
    categoryColor: "#a855f7",
    description: "Produce architecture docs and contribution guidelines for your project.",
    difficulty: "EASY",
    xp: 150,
    timeLimit: "24h",
    completions: 231,
    status: "Completed",
    progress: 100,
    requirements: ["Architecture diagram", "Readme update", "API reference"],
    tags: ["docs", "architecture", "readme"],
  },
  {
    id: "q-social-campaign",
    title: "Social Awareness Campaign",
    category: "Social",
    categoryColor: "#f97316",
    description: "Run a social campaign for your project and report impact metrics.",
    difficulty: "EASY",
    xp: 300,
    timeLimit: "36h",
    completions: 187,
    status: "Locked",
    progress: 0,
    requirements: ["Campaign thread", "Analytics screenshot", "Summary post"],
    tags: ["community", "growth", "marketing"],
  },
];

const sampleLeaderboard: LeaderboardView[] = [];

const sampleActivity: ActivityView[] = [];

const sampleMarketplace: MarketplaceItemView[] = [
  {
    id: "nft-genesis-badge",
    name: "Genesis Hacker Badge",
    rarity: "LEGENDARY",
    questFrom: "Deploy Smart Contract",
    earnedDate: "Apr 4, 2026",
    price: 800,
    stock: 12,
    icon: "🎮",
    owned: true,
    txHash: "TX9A2C...1F7B",
  },
  {
    id: "nft-chain-master",
    name: "Chain Master #31",
    rarity: "EPIC",
    questFrom: "DeFi Dashboard",
    earnedDate: "Apr 3, 2026",
    price: 600,
    stock: 37,
    icon: "⛓️",
    owned: false,
  },
  {
    id: "nft-doc-writer",
    name: "Doc Writer #203",
    rarity: "RARE",
    questFrom: "Write Technical Documentation",
    earnedDate: "Apr 2, 2026",
    price: 300,
    stock: 98,
    icon: "📄",
    owned: true,
    txHash: "TX4D7E...A912",
  },
];

const sampleNotifications: NotificationView[] = [
  {
    id: "n1",
    type: "xp",
    title: "Quest Reward Added",
    description: "You earned +500 XP for Deploy Smart Contract.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "nft",
    title: "NFT Mint Successful",
    description: "Genesis Hacker Badge has been minted to your wallet.",
    time: "15 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "rank",
    title: "Rank Updated",
    description: "You climbed to #5 on the global leaderboard.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Maintenance Window",
    description: "Blockchain sync jobs will run at 02:00 UTC.",
    time: "3 days ago",
    read: true,
  },
];

const sampleTransactions: WalletTransactionView[] = [
  {
    hash: "TX9A2C1F7B5D66AB3F987C112233445566778899AABBCCDDEEFF001122334455",
    type: "XP Reward",
    amount: "+500 XP",
    date: "Apr 4",
    status: "CONFIRMED",
  },
  {
    hash: "TX4D7EA912CC99AB3F987C00112233445566778899AABBCCDDEEFF001122AA77",
    type: "NFT Mint",
    amount: "-800 XP",
    date: "Apr 3",
    status: "CONFIRMED",
  },
  {
    hash: "TX1BC822A17F77AB3F987C00112233445566778899AABBCCDDEEFF001122BB88",
    type: "Transfer",
    amount: "12.5 ALGO",
    date: "Apr 2",
    status: "CONFIRMED",
  },
];

const sampleEvents = [
  {
    id: "event-genesis-s01",
    name: "HackQuest Genesis",
    status: "live",
    participantCount: 1247,
    startDate: "2026-04-01T00:00:00.000Z",
    endDate: "2026-04-04T23:59:59.000Z",
    teamSize: "1-4",
    prizePool: "8,500 ALGO",
  },
];

const sampleAdminDirectory: AdminUserInfo[] = [];

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readStoredJson<T>(key: string): T | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStoredJson<T>(key: string, value: T | null) {
  if (!canUseStorage()) {
    return;
  }

  try {
    if (value === null) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures in restrictive browser contexts.
  }
}

function getAuthSession(): AuthSession | null {
  const fromStorage = readStoredJson<AuthSession>(AUTH_SESSION_KEY);
  if (fromStorage) {
    memoryAuthSession = fromStorage;
    return fromStorage;
  }
  return memoryAuthSession;
}

function setAuthSession(session: AuthSession | null) {
  memoryAuthSession = session;
  writeStoredJson(AUTH_SESSION_KEY, session);
}

function getWalletSession(): WalletSession | null {
  const fromStorage = readStoredJson<WalletSession>(WALLET_SESSION_KEY);
  if (fromStorage) {
    memoryWalletSession = fromStorage;
    return fromStorage;
  }
  return memoryWalletSession;
}

function setWalletSession(session: WalletSession | null) {
  memoryWalletSession = session;
  writeStoredJson(WALLET_SESSION_KEY, session);
}

function getProfile(): UserProfile {
  const fromStorage = readStoredJson<UserProfile>(PROFILE_KEY);
  if (fromStorage) {
    memoryProfile = fromStorage;
    return fromStorage;
  }

  if (memoryProfile) {
    return memoryProfile;
  }

  memoryProfile = clone(defaultProfile);
  return memoryProfile;
}

function setProfile(profile: UserProfile) {
  memoryProfile = profile;
  writeStoredJson(PROFILE_KEY, profile);
}

function updateProfile(partial: Partial<UserProfile>) {
  const next = { ...getProfile(), ...partial };
  setProfile(next);

  const session = getAuthSession();
  if (session?.authUser) {
    syncPlayerDirectory(next, session.authUser.role);
  }
}

function getRoleIdPrefixes(role: AccountRole) {
  if (role === "admin") {
    return { authPrefix: "auth_adm", backendPrefix: "admin" };
  }

  if (role === "organizer") {
    return { authPrefix: "auth_org", backendPrefix: "org" };
  }

  return { authPrefix: "auth_usr", backendPrefix: "user" };
}

function createAuthUserIdForRole(role: AccountRole) {
  const { authPrefix } = getRoleIdPrefixes(role);
  return `${authPrefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createBackendUserIdForRole(role: AccountRole) {
  const { backendPrefix } = getRoleIdPrefixes(role);
  return `${backendPrefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createAuthSession(
  email: string,
  username: string,
  displayName: string,
  requestedRole: AccountRole = "user",
  identifiers?: { authUserId?: string; backendUserId?: string }
): AuthSession {
  const normalizedEmail = email.trim().toLowerCase();

  return {
    token: `token_${Math.random().toString(36).slice(2, 12)}`,
    authUser: {
      id: identifiers?.authUserId || createAuthUserIdForRole(requestedRole),
      email: normalizedEmail,
      role: requestedRole,
      username,
      displayName,
      backendUserId: identifiers?.backendUserId || createBackendUserIdForRole(requestedRole),
    },
  };
}

function isPrivilegedSession() {
  const role = getAuthSession()?.authUser?.role;
  return role === "admin" || role === "organizer";
}

function getCurrentRole(): AccountRole {
  return getAuthSession()?.authUser?.role ?? "user";
}

function canRolePlayGames(role: AccountRole) {
  return role !== "admin";
}

function canCurrentRolePlayGames() {
  return canRolePlayGames(getCurrentRole());
}

function nowIso() {
  return new Date().toISOString();
}

function toDisplayName(username: string) {
  return username
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function createWalletAddress(seed: string) {
  const normalized = seed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16) || "PLAYER";
  return `ALGO_${normalized}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function formatLastActive(isoValue: string) {
  const time = new Date(isoValue).getTime();
  if (!Number.isFinite(time)) {
    return "just now";
  }

  const diffMs = Math.max(0, Date.now() - time);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function readPlayers() {
  const fromStorage = readStoredJson<RegisteredPlayer[]>(PLAYERS_KEY);
  if (fromStorage) {
    memoryPlayers = fromStorage;
    return fromStorage;
  }

  if (memoryPlayers) {
    return memoryPlayers;
  }

  memoryPlayers = [];
  return memoryPlayers;
}

function writePlayers(players: RegisteredPlayer[]) {
  memoryPlayers = players;
  writeStoredJson(PLAYERS_KEY, players);
}

function rankPlayers(players: RegisteredPlayer[]) {
  const ranked = [...players]
    .sort((left, right) => Number(right.totalXp || 0) - Number(left.totalXp || 0));

  return ranked.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}

function findPlayerByEmail(email: string) {
  const lookup = email.trim().toLowerCase();
  return readPlayers().find((player) => player.email.trim().toLowerCase() === lookup) || null;
}

function findPlayerByUsername(username: string) {
  const lookup = username.trim().toLowerCase();
  return readPlayers().find((player) => player.username.trim().toLowerCase() === lookup) || null;
}

function syncPlayerDirectory(
  profile: UserProfile,
  role: AccountRole,
  password?: string
) {
  const players = readPlayers();
  const normalizedUsername = String(profile.username || "").trim().toLowerCase();
  const normalizedEmail = String(profile.email || "").trim().toLowerCase();

  const existingIndex = players.findIndex(
    (player) =>
      player.username.trim().toLowerCase() === normalizedUsername ||
      player.email.trim().toLowerCase() === normalizedEmail
  );

  const existing = existingIndex >= 0 ? players[existingIndex] : null;

  const merged: RegisteredPlayer = {
    ...profile,
    username: normalizedUsername,
    displayName: profile.displayName || toDisplayName(normalizedUsername),
    email: normalizedEmail,
    walletAddress: profile.walletAddress || createWalletAddress(normalizedUsername),
    className: profile.className || "Architect",
    level: Math.max(1, Number(profile.level || 1)),
    totalXp: Math.max(0, Number(profile.totalXp || 0)),
    nftCount: Math.max(0, Number(profile.nftCount || 0)),
    authUserId:
      profile.authUserId ||
      existing?.authUserId ||
      createAuthUserIdForRole(role),
    backendUserId:
      profile.backendUserId ||
      existing?.backendUserId ||
      createBackendUserIdForRole(role),
    role,
    password: password ?? existing?.password ?? "",
    createdAt: existing?.createdAt || nowIso(),
    lastActiveAt: nowIso(),
  };

  const nextPlayers = [...players];
  if (existingIndex >= 0) {
    nextPlayers[existingIndex] = merged;
  } else {
    nextPlayers.push(merged);
  }

  const ranked = rankPlayers(nextPlayers);
  writePlayers(ranked);

  const saved =
    ranked.find(
      (player) =>
        player.username.trim().toLowerCase() === normalizedUsername ||
        player.email.trim().toLowerCase() === normalizedEmail
    ) || merged;

  setProfile({ ...saved });
  return saved;
}

export const HackquestService = {
  async login(payload: {
    email: string;
    password: string;
    requestedRole?: AccountRole;
    adminAccessKey?: string;
  }) {
    if (!payload.email || !payload.password) {
      return null;
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const requestedRole = payload.requestedRole ?? "user";
    if (requestedRole !== "user" && payload.adminAccessKey !== ADMIN_ACCESS_KEY) {
      return null;
    }

    let player = findPlayerByEmail(normalizedEmail);

    if (player?.password && player.password !== payload.password) {
      return null;
    }

    if (!player && requestedRole === "user") {
      return null;
    }

    if (!player && requestedRole !== "user") {
      const bootstrapUsername =
        normalizedEmail.split("@")[0]?.toLowerCase() || `${requestedRole}_${Math.random().toString(36).slice(2, 6)}`;

      const bootstrapProfile: UserProfile = {
        authUserId: createAuthUserIdForRole(requestedRole),
        backendUserId: createBackendUserIdForRole(requestedRole),
        username: bootstrapUsername,
        displayName: toDisplayName(bootstrapUsername),
        email: normalizedEmail,
        walletAddress: createWalletAddress(bootstrapUsername),
        className: "Architect",
        level: 1,
        rank: 1,
        totalXp: 0,
        nftCount: 0,
      };

      player = syncPlayerDirectory(bootstrapProfile, requestedRole, payload.password);
    }

    if (!player) {
      return null;
    }

    if (requestedRole === "user" && player.role !== "user") {
      return null;
    }

    if (requestedRole !== "user" && player.role !== requestedRole) {
      return null;
    }

    const resolvedRole: AccountRole = requestedRole === "user" ? player.role : requestedRole;
    const syncedPlayer = syncPlayerDirectory(player, resolvedRole, payload.password);

    const session = createAuthSession(
      syncedPlayer.email,
      syncedPlayer.username,
      syncedPlayer.displayName,
      resolvedRole,
      {
        authUserId: syncedPlayer.authUserId,
        backendUserId: syncedPlayer.backendUserId,
      }
    );

    setAuthSession(session);
    setProfile({ ...syncedPlayer });

    return session;
  },

  async register(payload: {
    displayName: string;
    username: string;
    email: string;
    password: string;
    walletAddress?: string | null;
  }) {
    if (!payload.displayName || !payload.username || !payload.email || !payload.password) {
      return null;
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedUsername = payload.username.trim().toLowerCase();

    if (findPlayerByEmail(normalizedEmail) || findPlayerByUsername(normalizedUsername)) {
      return null;
    }

    const session = createAuthSession(
      normalizedEmail,
      normalizedUsername,
      payload.displayName,
      "user"
    );

    const registeredProfile: UserProfile = {
      authUserId: session.authUser?.id ?? `auth_${Math.random().toString(36).slice(2, 10)}`,
      backendUserId: session.authUser?.backendUserId ?? `user_${Math.random().toString(36).slice(2, 10)}`,
      displayName: payload.displayName,
      username: normalizedUsername,
      email: normalizedEmail,
      walletAddress: payload.walletAddress || createWalletAddress(normalizedUsername),
      className: "Architect",
      rank: 1,
      level: 1,
      totalXp: 0,
      nftCount: 0,
    };

    const savedPlayer = syncPlayerDirectory(registeredProfile, "user", payload.password);
    setAuthSession(session);
    setProfile({ ...savedPlayer });

    return session;
  },

  async logout() {
    setAuthSession(null);
  },

  isAuthenticated() {
    const session = getAuthSession();
    return Boolean(session?.authUser);
  },

  clearAuthSession() {
    setAuthSession(null);
  },

  async getAuthMe() {
    const session = getAuthSession();
    if (!session?.authUser) {
      return { authUser: null };
    }
    return { authUser: session.authUser };
  },

  persistWalletSession(walletAddress: string, walletProvider: string | null) {
    if (!walletAddress) {
      return;
    }

    setWalletSession({ walletAddress, walletProvider });
    updateProfile({ walletAddress });
  },

  clearWalletSession() {
    setWalletSession(null);
  },

  getCurrentWalletAddress() {
    const wallet = getWalletSession();
    if (wallet?.walletAddress) {
      return wallet.walletAddress;
    }
    return getProfile().walletAddress;
  },

  getCurrentWalletProvider() {
    const wallet = getWalletSession();
    return wallet?.walletProvider ?? null;
  },

  async linkWallet(walletAddress: string) {
    if (!walletAddress) {
      return false;
    }

    this.persistWalletSession(walletAddress, this.getCurrentWalletProvider());
    return true;
  },

  async getCurrentUserProfile() {
    const session = getAuthSession();
    if (session?.authUser) {
      const player =
        readPlayers().find(
          (entry) =>
            entry.authUserId === session.authUser?.id ||
            entry.email.toLowerCase() === session.authUser?.email.toLowerCase()
        ) || null;

      if (player) {
        setProfile({ ...player });
      }
    }

    const profile = getProfile();
    const walletAddress = this.getCurrentWalletAddress();
    return {
      ...profile,
      walletAddress: walletAddress || profile.walletAddress,
    } as UserProfile;
  },

  async addBonusXp(amount: number, source = 'bonus') {
    if (!canCurrentRolePlayGames()) {
      return this.getCurrentUserProfile();
    }

    const safeAmount = Number(amount || 0);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      return this.getCurrentUserProfile();
    }

    const profile = getProfile();
    const nextTotalXp = Number(profile.totalXp || 0) + safeAmount;
    const xpPerLevel = Number(process.env.NEXT_PUBLIC_XP_PER_LEVEL || 100);
    const nextLevel = Math.max(1, Math.floor(nextTotalXp / xpPerLevel) + 1);

    updateProfile({
      totalXp: nextTotalXp,
      level: nextLevel,
      className: profile.className,
    });

    await this.getActivityFeed();

    return {
      source,
      amount: safeAmount,
      profile: await this.getCurrentUserProfile(),
    };
  },

  async incrementNftCount(amount = 1) {
    if (!canCurrentRolePlayGames()) {
      return this.getCurrentUserProfile();
    }

    const safeAmount = Number(amount || 0);
    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      return this.getCurrentUserProfile();
    }

    const profile = getProfile();
    updateProfile({
      nftCount: Number(profile.nftCount || 0) + safeAmount,
    });

    return this.getCurrentUserProfile();
  },

  async listUsersForAdmin() {
    if (!isPrivilegedSession()) {
      return [] as AdminUserInfo[];
    }

    const users: AdminUserInfo[] = readPlayers().map((player) => ({
      username: player.username,
      displayName: player.displayName,
      email: player.email,
      role: player.role,
      walletAddress: player.walletAddress,
      level: Number(player.level || 1),
      rank: Number(player.rank || 1),
      totalXp: Number(player.totalXp || 0),
      nftCount: Number(player.nftCount || 0),
      lastActive: formatLastActive(player.lastActiveAt),
      flags:
        player.role === "admin"
          ? ["admin-account"]
          : player.role === "organizer"
          ? ["organizer-account"]
          : [],
      source: "directory",
    }));

    const viewer = await this.getCurrentUserProfile();
    if (!users.some((user) => user.username === viewer.username)) {
      users.push({
        username: viewer.username,
        displayName: viewer.displayName,
        email: viewer.email,
        role: getCurrentRole(),
        walletAddress: viewer.walletAddress,
        level: viewer.level,
        rank: viewer.rank,
        totalXp: viewer.totalXp,
        nftCount: viewer.nftCount,
        lastActive: "just now",
        flags: ["viewer-profile"],
        source: "viewer-profile",
      });
    }

    return users.sort((a, b) => a.rank - b.rank);
  },

  async getUserInfoForAdmin(username: string) {
    if (!isPrivilegedSession()) {
      return null;
    }

    const lookup = username.trim().toLowerCase();
    if (!lookup) {
      return null;
    }

    const users = await this.listUsersForAdmin();
    const directMatch = users.find((user) => user.username.toLowerCase() === lookup);
    if (directMatch) {
      return directMatch;
    }

    const leaderboard = await this.getLeaderboard();
    const entry = leaderboard.find((item) => item.username.toLowerCase() === lookup);
    if (!entry) {
      return null;
    }

    return {
      username: entry.username,
      displayName: entry.displayName,
      email: `${entry.username}@hackquest.io`,
      role: entry.username.includes("admin")
        ? "admin"
        : entry.username.includes("organizer") || entry.username.includes("org")
        ? "organizer"
        : "user",
      walletAddress: `ALGO_${entry.username.toUpperCase()}_${entry.rank}`,
      level: entry.level,
      rank: entry.rank,
      totalXp: entry.xp,
      nftCount: entry.nfts,
      lastActive: entry.lastActive,
      flags: [],
      source: "directory",
    } as AdminUserInfo;
  },

  async getQuests() {
    if (!canCurrentRolePlayGames()) {
      return [] as QuestView[];
    }

    return clone(sampleQuests);
  },

  async getLeaderboard() {
    const profile = await this.getCurrentUserProfile();
    const role = getAuthSession()?.authUser?.role ?? "user";
    syncPlayerDirectory(profile, role);

    const rankedPlayers = rankPlayers(readPlayers());
    writePlayers(rankedPlayers);

    return rankedPlayers.map((player) => ({
      rank: Number(player.rank || 1),
      username: player.username,
      displayName: player.displayName,
      class: String(player.className || "Architect"),
      level: Number(player.level || 1),
      xp: Number(player.totalXp || 0),
      quests: Math.max(0, Math.round(Number(player.level || 1) * 2)),
      nfts: Number(player.nftCount || 0),
      lastActive: formatLastActive(player.lastActiveAt),
      change: "+0",
    }));
  },

  async getActivityFeed() {
    const leaderboard = await this.getLeaderboard();
    const feedSource = leaderboard.slice(0, 5);

    return feedSource.map((entry, index) => {
      const variant = index % 3;

      if (variant === 0) {
        return {
          id: index + 1,
          type: "quest",
          player: entry.displayName,
          avatar: null,
          event: "completed quest",
          detail: sampleQuests[index % sampleQuests.length]?.title || "Quest Completed",
          time: `${index + 2} min ago`,
          reactions: { "👏": 3 + index, "⚡": 2 + index },
          xp: `+${Math.max(50, Math.round(entry.level * 20))} XP`,
        } as ActivityView;
      }

      if (variant === 1) {
        return {
          id: index + 1,
          type: "nft",
          player: entry.displayName,
          avatar: null,
          event: "minted NFT",
          detail: `Mythic Relic #${index + 10}`,
          time: `${(index + 1) * 8} min ago`,
          reactions: { "🔥": 2 + index },
        } as ActivityView;
      }

      return {
        id: index + 1,
        type: "rank",
        player: entry.displayName,
        avatar: null,
        event: "climbed to",
        detail: `#${entry.rank} Global`,
        time: `${(index + 1) * 12} min ago`,
        reactions: { "👏": 2 + index },
      } as ActivityView;
    });
  },

  async getMarketplaceItems() {
    return clone(sampleMarketplace);
  },

  async getNotifications() {
    return clone(sampleNotifications);
  },

  async getWalletTransactions(_walletAddress?: string) {
    return clone(sampleTransactions);
  },

  async getUserNfts(_backendUserId: string) {
    return clone(sampleMarketplace.filter((item) => item.owned));
  },

  async getUserXp(walletAddress: string) {
    const profile = await this.getCurrentUserProfile();
    return {
      result: {
        wallet: walletAddress,
        totalXp: Number(profile.totalXp || 0),
        updatedAt: nowIso(),
      },
    };
  },

  async getUserAssets(walletAddress: string) {
    return {
      result: {
        wallet: walletAddress,
        network: "Mainnet",
        assets: [
          { assetId: 101, amount: 1 },
          { assetId: 102, amount: 2 },
          { assetId: 103, amount: 1 },
        ],
        raw: {
          algo_balance: 124370000,
        },
      },
    };
  },

  async getQuestProgressForCurrentWallet() {
    if (!canCurrentRolePlayGames()) {
      return [] as Array<{ questId: string; currentValue: number; targetValue: number; isCompleted: boolean }>;
    }

    return [
      { questId: "q-smart-contract", currentValue: 62, targetValue: 100, isCompleted: false },
      { questId: "q-defi-dashboard", currentValue: 12, targetValue: 100, isCompleted: false },
      { questId: "q-technical-docs", currentValue: 100, targetValue: 100, isCompleted: true },
    ];
  },

  async completeQuestForCurrentWallet(questId: string) {
    if (!canCurrentRolePlayGames()) {
      return null;
    }

    if (!questId) {
      return null;
    }

    const profile = await this.getCurrentUserProfile();
    const bonusXp = 250;
    updateProfile({
      totalXp: Number(profile.totalXp || 0) + bonusXp,
    });

    return {
      result: {
        questId,
        txId: `TX${Math.random().toString(16).slice(2).toUpperCase()}`,
        xpAwarded: bonusXp,
        completedAt: nowIso(),
      },
    };
  },

  async deployXpRegistry() {
    return {
      deployment: {
        txId: `DEPLOY_${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
        appId: 912345,
      },
    };
  },

  async recordXp(payload: { userWallet: string; xp: number; questId: string }) {
    if (!payload.userWallet || !payload.questId) {
      return null;
    }

    return {
      result: {
        txId: `XP_${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
        wallet: payload.userWallet,
        questId: payload.questId,
        xp: payload.xp,
      },
    };
  },

  async mintNft(payload: { userWallet: string; nftName: string }) {
    if (!payload.userWallet || !payload.nftName) {
      return null;
    }

    return {
      result: {
        txId: `MINT_${Math.random().toString(36).slice(2, 12).toUpperCase()}`,
        wallet: payload.userWallet,
        nftName: payload.nftName,
      },
    };
  },

  async verifyTransaction(txId: string) {
    if (!txId) {
      return null;
    }

    return {
      result: {
        txId,
        confirmed: true,
        confirmedRound: 43124567,
      },
    };
  },

  async getHealth() {
    return {
      status: "ok",
      timestamp: nowIso(),
    };
  },

  async getEvents() {
    return clone(sampleEvents);
  },

  async getEventById(eventId: string) {
    const event = sampleEvents.find((item) => item.id === eventId);
    return event ? clone(event) : null;
  },
} as const;

export type HackquestApiPayload = GenericRecord;
