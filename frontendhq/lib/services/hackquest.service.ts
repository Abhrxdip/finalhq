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

export type AdminUserInfo = {
  username: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
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
  role: "admin" | "user";
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

const AUTH_SESSION_KEY = "hackquest.auth.session";
const WALLET_SESSION_KEY = "hackquest.wallet.session";
const PROFILE_KEY = "hackquest.profile";
const ADMIN_ACCESS_KEY = "HQ-ADMIN-2026";
const DEMO_ADMIN_EMAIL = "admin.demo@hackquest.io";
const DEMO_ADMIN_PASSWORD = "DemoAdmin@123";
const DEMO_ADMIN_USERNAME = "demo_admin";
const DEMO_ADMIN_DISPLAY_NAME = "Demo Admin";
const PERA_TESTNET_CHAIN_ID = 416002;
const COUNTER_GLOBAL_KEY = "COUNT";
const COUNTER_INCREMENT_ARG = "inc";
const COUNTER_APPROVAL_TEAL = `#pragma version 8
txn ApplicationID
int 0
==
bnz init

txna ApplicationArgs 0
byte "inc"
==
bnz increment

int 0
return

init:
byte "COUNT"
int 0
app_global_put
int 1
return

increment:
byte "COUNT"
byte "COUNT"
app_global_get
int 1
+
app_global_put
int 1
return
`;
const COUNTER_CLEAR_TEAL = `#pragma version 8
int 1
`;

let memoryAuthSession: AuthSession | null = null;
let memoryWalletSession: WalletSession | null = null;
let memoryProfile: UserProfile | null = null;
let peraConnectorPromise: Promise<any> | null = null;

const defaultProfile: UserProfile = {
  backendUserId: "user_001",
  authUserId: "auth_001",
  username: "arena_rookie",
  displayName: "Arena Rookie",
  email: "rookie@hackquest.dev",
  walletAddress: "ALGO7B3XQKF9VPNR2MJLCWTZ4DVXHM8YPWQSEJANKQ5K9XZ",
  className: "Architect",
  level: 12,
  rank: 8,
  totalXp: 7420,
  nftCount: 3,
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

const sampleLeaderboard: LeaderboardView[] = [
  {
    rank: 1,
    username: "algo_phoenix",
    displayName: "Algo Phoenix",
    class: "Architect",
    level: 24,
    xp: 18240,
    quests: 42,
    nfts: 12,
    lastActive: "2m ago",
    change: "+1",
  },
  {
    rank: 2,
    username: "block_shaman",
    displayName: "Block Shaman",
    class: "Warrior",
    level: 22,
    xp: 17120,
    quests: 39,
    nfts: 9,
    lastActive: "5m ago",
    change: "-1",
  },
  {
    rank: 3,
    username: "terra_ghost",
    displayName: "Terra Ghost",
    class: "Mage",
    level: 20,
    xp: 15990,
    quests: 35,
    nfts: 8,
    lastActive: "11m ago",
    change: "+0",
  },
  {
    rank: 4,
    username: "void_architect",
    displayName: "Void Architect",
    class: "Phantom",
    level: 18,
    xp: 13850,
    quests: 29,
    nfts: 6,
    lastActive: "18m ago",
    change: "+2",
  },
  {
    rank: 5,
    username: defaultProfile.username,
    displayName: defaultProfile.displayName,
    class: defaultProfile.className,
    level: defaultProfile.level,
    xp: defaultProfile.totalXp,
    quests: 18,
    nfts: defaultProfile.nftCount,
    lastActive: "just now",
    change: "+3",
  },
];

const sampleActivity: ActivityView[] = [
  {
    id: 1,
    type: "quest",
    player: defaultProfile.displayName,
    avatar: null,
    event: "completed quest",
    detail: "Deploy Smart Contract",
    time: "2 min ago",
    reactions: { "👏": 6, "⚡": 3 },
    xp: "+500 XP",
  },
  {
    id: 2,
    type: "nft",
    player: "Algo Phoenix",
    avatar: null,
    event: "minted NFT",
    detail: "Bug Slayer #48",
    time: "15 min ago",
    reactions: { "🔥": 4 },
  },
  {
    id: 3,
    type: "rank",
    player: "Block Shaman",
    avatar: null,
    event: "climbed to",
    detail: "#2 Global",
    time: "1h ago",
    reactions: { "👏": 2 },
  },
];

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

const sampleAdminDirectory: AdminUserInfo[] = [
  {
    username: "algo_phoenix",
    displayName: "Algo Phoenix",
    email: "algo.phoenix@hackquest.io",
    role: "user",
    walletAddress: "ALGO9P1HOENIX7B3XQKFM2JLCWTZ4DVXHM8YPWQSEJANKQ5K",
    level: 24,
    rank: 1,
    totalXp: 18240,
    nftCount: 12,
    lastActive: "2m ago",
    flags: ["high-performer"],
    source: "directory",
  },
  {
    username: "block_shaman",
    displayName: "Block Shaman",
    email: "block.shaman@hackquest.io",
    role: "user",
    walletAddress: "ALGO2SHAMAN7B3XQKFM2JLCWTZ4DVXHM8YPWQSEJANKQ5K9X",
    level: 22,
    rank: 2,
    totalXp: 17120,
    nftCount: 9,
    lastActive: "5m ago",
    flags: ["needs-review:submission-queue"],
    source: "directory",
  },
  {
    username: "terra_ghost",
    displayName: "Terra Ghost",
    email: "terra.ghost@hackquest.io",
    role: "user",
    walletAddress: "ALGO3GHOST7B3XQKFM2JLCWTZ4DVXHM8YPWQSEJANKQ5K9X",
    level: 20,
    rank: 3,
    totalXp: 15990,
    nftCount: 8,
    lastActive: "11m ago",
    flags: [],
    source: "directory",
  },
  {
    username: "ops_admin",
    displayName: "Ops Admin",
    email: "ops.admin@hackquest.io",
    role: "admin",
    walletAddress: "ALGO4ADMIN7B3XQKFM2JLCWTZ4DVXHM8YPWQSEJANKQ5K9X",
    level: 30,
    rank: 7,
    totalXp: 9700,
    nftCount: 2,
    lastActive: "1m ago",
    flags: ["admin-account"],
    source: "directory",
  },
];

function decodeBase64Utf8(value: string) {
  if (!value || typeof window === "undefined" || typeof window.atob !== "function") {
    return "";
  }

  try {
    const binary = window.atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

function getCounterFromAppPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return 0;
  }

  const params = (payload as GenericRecord).params;
  if (!params || typeof params !== "object") {
    return 0;
  }

  const globalState = (params as GenericRecord)["global-state"];
  if (!Array.isArray(globalState)) {
    return 0;
  }

  for (const item of globalState) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const key = (item as GenericRecord).key;
    if (typeof key !== "string") {
      continue;
    }

    if (decodeBase64Utf8(key) !== COUNTER_GLOBAL_KEY) {
      continue;
    }

    const value = (item as GenericRecord).value;
    if (!value || typeof value !== "object") {
      return 0;
    }

    const uintValue = Number((value as GenericRecord).uint ?? 0);
    return Number.isFinite(uintValue) ? uintValue : 0;
  }

  return 0;
}

function getAlgodConfigFromEnv() {
  const server = process.env.NEXT_PUBLIC_ALGOD_SERVER || "https://testnet-api.algonode.cloud";
  const token = process.env.NEXT_PUBLIC_ALGOD_TOKEN || "";
  const rawPort = process.env.NEXT_PUBLIC_ALGOD_PORT || "";
  const numericPort = Number(rawPort);
  const port = rawPort === "" ? "" : Number.isFinite(numericPort) ? numericPort : rawPort;

  return { server, token, port };
}

async function getAlgodContext() {
  const algosdk = await import("algosdk");
  const config = getAlgodConfigFromEnv();
  const algodClient = new algosdk.Algodv2(config.token, config.server, config.port);
  return { algosdk, algodClient };
}

async function getPeraConnector() {
  if (typeof window === "undefined") {
    throw new Error("Wallet provider is only available in browser context.");
  }

  if (!peraConnectorPromise) {
    peraConnectorPromise = import("@perawallet/connect").then((module) => {
      const PeraWalletConnect = module.PeraWalletConnect;
      return new PeraWalletConnect({ chainId: PERA_TESTNET_CHAIN_ID });
    });
  }

  return peraConnectorPromise;
}

function normalizeWalletProviderName(walletProvider: string | null) {
  if (!walletProvider) {
    return null;
  }

  if (walletProvider.toLowerCase() === "pera") {
    return "Pera Wallet";
  }

  return walletProvider;
}

async function getConnectedPeraAddress() {
  const connector = await getPeraConnector();
  const reconnected = await connector.reconnectSession().catch(() => [] as string[]);
  if (Array.isArray(reconnected) && reconnected.length > 0) {
    return reconnected[0];
  }

  const connected = await connector.connect();
  if (!Array.isArray(connected) || connected.length === 0) {
    return null;
  }

  return connected[0];
}

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
}

function createAuthSession(
  email: string,
  username: string,
  displayName: string,
  requestedRole: "admin" | "user" = "user"
): AuthSession {
  const normalizedEmail = email.trim().toLowerCase();
  const isAdminEmail = normalizedEmail.includes("admin") || normalizedEmail.includes("organizer");
  const resolvedRole: "admin" | "user" = requestedRole === "admin" && isAdminEmail ? "admin" : "user";

  return {
    token: `token_${Math.random().toString(36).slice(2, 12)}`,
    authUser: {
      id: `auth_${Math.random().toString(36).slice(2, 10)}`,
      email: normalizedEmail,
      role: resolvedRole,
      username,
      displayName,
      backendUserId: `user_${Math.random().toString(36).slice(2, 10)}`,
    },
  };
}

function isAdminSession() {
  return getAuthSession()?.authUser?.role === "admin";
}

function nowIso() {
  return new Date().toISOString();
}

export const HackquestService = {
  getDemoAdminCredentials() {
    return {
      email: DEMO_ADMIN_EMAIL,
      password: DEMO_ADMIN_PASSWORD,
      accessKey: ADMIN_ACCESS_KEY,
    };
  },

  async login(payload: {
    email: string;
    password: string;
    requestedRole?: "admin" | "user";
    adminAccessKey?: string;
  }) {
    if (!payload.email || !payload.password) {
      return null;
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const isDemoAdminLogin =
      normalizedEmail === DEMO_ADMIN_EMAIL && payload.password === DEMO_ADMIN_PASSWORD;

    const requestedRole = payload.requestedRole ?? "user";
    if (
      requestedRole === "admin" &&
      !isDemoAdminLogin &&
      payload.adminAccessKey !== ADMIN_ACCESS_KEY
    ) {
      return null;
    }

    const baseProfile = getProfile();
    const username = isDemoAdminLogin
      ? DEMO_ADMIN_USERNAME
      : payload.email.split("@")[0] || baseProfile.username;
    const displayName = isDemoAdminLogin
      ? DEMO_ADMIN_DISPLAY_NAME
      : baseProfile.displayName || "HackQuest Player";

    const session = createAuthSession(payload.email, username, displayName, requestedRole);
    if (requestedRole === "admin" && session.authUser?.role !== "admin") {
      return null;
    }

    setAuthSession(session);

    updateProfile({
      authUserId: session.authUser?.id ?? baseProfile.authUserId,
      backendUserId: session.authUser?.backendUserId ?? baseProfile.backendUserId,
      email: session.authUser?.email ?? payload.email,
      username,
      displayName,
    });

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

    const session = createAuthSession(payload.email, payload.username, payload.displayName);
    setAuthSession(session);

    updateProfile({
      authUserId: session.authUser?.id ?? defaultProfile.authUserId,
      backendUserId: session.authUser?.backendUserId ?? defaultProfile.backendUserId,
      displayName: payload.displayName,
      username: payload.username,
      email: payload.email.toLowerCase(),
      walletAddress: payload.walletAddress ?? getProfile().walletAddress,
      rank: 120,
      level: 1,
      totalXp: 0,
      nftCount: 0,
    });

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

    setWalletSession({ walletAddress, walletProvider: normalizeWalletProviderName(walletProvider) });
    updateProfile({ walletAddress });
  },

  clearWalletSession() {
    setWalletSession(null);
  },

  async connectWalletProvider(walletProvider: string) {
    if (!walletProvider) {
      return null;
    }

    const provider = walletProvider.toLowerCase();
    if (provider !== "pera") {
      return null;
    }

    try {
      const address = await getConnectedPeraAddress();
      if (!address) {
        return null;
      }

      this.persistWalletSession(address, "Pera Wallet");
      return {
        walletAddress: address,
        walletProvider: "Pera Wallet",
        network: "testnet",
      };
    } catch {
      return null;
    }
  },

  async disconnectWalletProvider() {
    try {
      const connector = await getPeraConnector();
      await connector.disconnect();
    } catch {
      // Ignore disconnection failures and still clear local wallet state.
    }

    this.clearWalletSession();
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
    const profile = getProfile();
    const walletAddress = this.getCurrentWalletAddress();
    return {
      ...profile,
      walletAddress: walletAddress || profile.walletAddress,
    } as UserProfile;
  },

  async listUsersForAdmin() {
    if (!isAdminSession()) {
      return [] as AdminUserInfo[];
    }

    const users = clone(sampleAdminDirectory);
    const viewer = await this.getCurrentUserProfile();
    if (!users.some((user) => user.username === viewer.username)) {
      users.push({
        username: viewer.username,
        displayName: viewer.displayName,
        email: viewer.email,
        role: getAuthSession()?.authUser?.role === "admin" ? "admin" : "user",
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
    if (!isAdminSession()) {
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
      role: entry.username.includes("admin") ? "admin" : "user",
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
    return clone(sampleQuests);
  },

  async getLeaderboard() {
    const profile = await this.getCurrentUserProfile();
    const merged = clone(sampleLeaderboard);
    const existingIndex = merged.findIndex((entry) => entry.username === profile.username);

    const viewerEntry: LeaderboardView = {
      rank: existingIndex >= 0 ? merged[existingIndex].rank : 5,
      username: profile.username,
      displayName: profile.displayName,
      class: String(profile.className || "Architect"),
      level: Number(profile.level || 1),
      xp: Number(profile.totalXp || 0),
      quests: 18,
      nfts: Number(profile.nftCount || 0),
      lastActive: "just now",
      change: "+0",
    };

    if (existingIndex >= 0) {
      merged[existingIndex] = viewerEntry;
    } else {
      merged.push(viewerEntry);
    }

    return merged.sort((a, b) => a.rank - b.rank);
  },

  async getActivityFeed() {
    return clone(sampleActivity);
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
        network: "testnet",
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
    return [
      { questId: "q-smart-contract", currentValue: 62, targetValue: 100, isCompleted: false },
      { questId: "q-defi-dashboard", currentValue: 12, targetValue: 100, isCompleted: false },
      { questId: "q-technical-docs", currentValue: 100, targetValue: 100, isCompleted: true },
    ];
  },

  async completeQuestForCurrentWallet(questId: string) {
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

    try {
      const { algodClient } = await getAlgodContext();
      const pending = (await algodClient.pendingTransactionInformation(txId).do()) as unknown as GenericRecord;
      const confirmedRound = Number(pending["confirmed-round"] ?? 0);
      const poolError = String(pending["pool-error"] ?? "");

      return {
        result: {
          txId,
          confirmed: confirmedRound > 0,
          confirmedRound,
          poolError,
          network: "testnet",
        },
      };
    } catch {
      // Fall back to deterministic mock response for offline/demo environments.
    }

    return {
      result: {
        txId,
        confirmed: true,
        confirmedRound: 43124567,
      },
    };
  },

  async deployCounterContract(payload?: { senderAddress?: string }) {
    const senderAddress = (payload?.senderAddress || this.getCurrentWalletAddress() || "").trim();
    if (!senderAddress) {
      return null;
    }

    const walletProvider = this.getCurrentWalletProvider();
    if (walletProvider && !walletProvider.toLowerCase().includes("pera")) {
      return {
        result: {
          error: "Pera Wallet is required for wallet-signed on-chain counter deployment.",
        },
      };
    }

    try {
      const [{ algosdk, algodClient }, connector] = await Promise.all([
        getAlgodContext(),
        getPeraConnector(),
      ]);

      const [suggestedParams, approvalResponse, clearResponse] = await Promise.all([
        algodClient.getTransactionParams().do(),
        algodClient.compile(COUNTER_APPROVAL_TEAL).do(),
        algodClient.compile(COUNTER_CLEAR_TEAL).do(),
      ]);

      const approvalProgram = algosdk.base64ToBytes(String((approvalResponse as unknown as GenericRecord).result || ""));
      const clearProgram = algosdk.base64ToBytes(String((clearResponse as unknown as GenericRecord).result || ""));

      const createTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: senderAddress,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram,
        clearProgram,
        numGlobalInts: 1,
        numGlobalByteSlices: 0,
        numLocalInts: 0,
        numLocalByteSlices: 0,
        suggestedParams,
      });

      const signed = await connector.signTransaction(
        [[{ txn: createTxn, signers: [senderAddress], message: "Deploy HackQuest counter contract" }]],
        senderAddress
      );

      const submit = (await algodClient.sendRawTransaction(signed).do()) as unknown as GenericRecord;
      const txId = String(submit.txid || "");
      const confirmation = (await algosdk.waitForConfirmation(algodClient, txId, 8)) as unknown as GenericRecord;
      const appId = Number(confirmation["application-index"] ?? 0);

      let counterValue = 0;
      if (appId > 0) {
        const appPayload = await algodClient.getApplicationByID(appId).do();
        counterValue = getCounterFromAppPayload(appPayload);
      }

      return {
        result: {
          txId,
          appId,
          counterValue,
          confirmedRound: Number(confirmation["confirmed-round"] ?? 0),
          network: "testnet",
        },
      };
    } catch (error) {
      return {
        result: {
          error: String((error as Error).message || error),
        },
      };
    }
  },

  async incrementCounterContract(payload: { appId: number; senderAddress?: string }) {
    const appId = Number(payload.appId);
    const senderAddress = (payload.senderAddress || this.getCurrentWalletAddress() || "").trim();

    if (!Number.isInteger(appId) || appId <= 0 || !senderAddress) {
      return null;
    }

    const walletProvider = this.getCurrentWalletProvider();
    if (walletProvider && !walletProvider.toLowerCase().includes("pera")) {
      return {
        result: {
          error: "Pera Wallet is required for wallet-signed on-chain counter increment.",
        },
      };
    }

    try {
      const [{ algosdk, algodClient }, connector] = await Promise.all([
        getAlgodContext(),
        getPeraConnector(),
      ]);

      const suggestedParams = await algodClient.getTransactionParams().do();
      const incrementTxn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: senderAddress,
        appIndex: appId,
        appArgs: [new TextEncoder().encode(COUNTER_INCREMENT_ARG)],
        suggestedParams,
      });

      const signed = await connector.signTransaction(
        [[{ txn: incrementTxn, signers: [senderAddress], message: "Increment HackQuest counter" }]],
        senderAddress
      );

      const submit = (await algodClient.sendRawTransaction(signed).do()) as unknown as GenericRecord;
      const txId = String(submit.txid || "");
      const confirmation = (await algosdk.waitForConfirmation(algodClient, txId, 8)) as unknown as GenericRecord;
      const appPayload = await algodClient.getApplicationByID(appId).do();
      const counterValue = getCounterFromAppPayload(appPayload);

      return {
        result: {
          txId,
          appId,
          counterValue,
          confirmedRound: Number(confirmation["confirmed-round"] ?? 0),
          network: "testnet",
        },
      };
    } catch (error) {
      return {
        result: {
          error: String((error as Error).message || error),
        },
      };
    }
  },

  async getCounterContractState(appId: number) {
    const normalizedAppId = Number(appId);
    if (!Number.isInteger(normalizedAppId) || normalizedAppId <= 0) {
      return null;
    }

    try {
      const { algodClient } = await getAlgodContext();
      const appPayload = await algodClient.getApplicationByID(normalizedAppId).do();
      const counterValue = getCounterFromAppPayload(appPayload);

      return {
        result: {
          appId: normalizedAppId,
          counterValue,
          network: "testnet",
        },
      };
    } catch (error) {
      return {
        result: {
          error: String((error as Error).message || error),
        },
      };
    }
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
