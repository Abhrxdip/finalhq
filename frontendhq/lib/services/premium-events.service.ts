import { HackquestService } from '@/lib/services/hackquest.service';

export type PremiumNftCategory = 'Singularity' | 'Void' | 'Cipher' | 'Titan' | 'Ether';

export type PrimeArtifactItem = {
  id: string;
  name: string;
  category: PremiumNftCategory;
  prompt: string;
  imageUrl: string;
  ownerId: string | null;
  isMinted: boolean;
  algoAssetId: string | null;
  createdAt: string;
  claimedAt: string | null;
};

export type OrganizerRankingRow = {
  rank: number;
  playerId: string;
  xpAwarded: number;
  isWinner: boolean;
  badgeText: string;
};

export type OrganizerEvent = {
  id: string;
  posterUrl: string;
  eventName: string;
  eventDateTime: string;
  premiumNftCategory: PremiumNftCategory;
  rankings: OrganizerRankingRow[];
  createdAt: string;
  updatedAt: string;
};

export type PendingReward = {
  id: string;
  eventId: string;
  eventName: string;
  playerId: string;
  rank: number;
  xpAwarded: number;
  isWinner: boolean;
  premiumNftCategory: PremiumNftCategory | null;
  status: 'pending' | 'claimed';
  createdAt: string;
  claimedAt: string | null;
};

type CreateOrUpdateEventInput = {
  posterUrl: string;
  eventName: string;
  eventDateTime: string;
  premiumNftCategory: PremiumNftCategory;
};

type RankingInput = {
  rank: number;
  playerId: string;
};

type GeneratePrimeArtifactInput = {
  name?: string;
  category: PremiumNftCategory;
  prompt?: string;
  ownerId?: string | null;
  isMinted?: boolean;
  algoAssetId?: string | null;
};

const ORGANIZER_EVENTS_KEY = 'hackquest.organizer.events.v1';
const PRIME_ARTIFACTS_KEY = 'hackquest.prime.artifacts.v1';
const PENDING_REWARDS_KEY = 'hackquest.pending.rewards.v1';

const XP_BY_RANK = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];

const PREMIUM_CATEGORIES: PremiumNftCategory[] = ['Singularity', 'Void', 'Cipher', 'Titan', 'Ether'];

const CATEGORY_PROMPTS: Record<PremiumNftCategory, string> = {
  Singularity:
    'ultra-premium futuristic collectible NFT card art, centered legendary artifact, dark cinematic background, glowing energy aura, holographic detailing, elite game reward design, high detail, symmetrical composition, dramatic lighting, no text, no humans, no watermark, collectible rarity aesthetic, a divine singularity core floating in the center, white-gold cosmic orb with violet energy rings, gravitational distortion field, event horizon fragments, radiant collapse energy, celestial black hole technology relic, ultra-rare god-tier artifact',
  Void:
    'ultra-premium futuristic collectible NFT card art, centered legendary artifact, dark cinematic background, glowing energy aura, holographic detailing, elite game reward design, high detail, symmetrical composition, dramatic lighting, no text, no humans, no watermark, collectible rarity aesthetic, a forbidden void relic floating in the center, black obsidian shard with deep purple and crimson corruption aura, fractured space geometry, abyssal energy pulses, shadow distortion field, dark anti-energy crystal, legendary cursed artifact',
  Cipher:
    'ultra-premium futuristic collectible NFT card art, centered legendary artifact, dark cinematic background, glowing energy aura, holographic detailing, elite game reward design, high detail, symmetrical composition, dramatic lighting, no text, no humans, no watermark, collectible rarity aesthetic, an encrypted cyber relic floating in the center, glowing cyan holographic cube with matrix glyphs and data shards, neon code streams, quantum intelligence aura, futuristic hacker artifact, digital secret core, legendary encoded object',
  Titan:
    'ultra-premium futuristic collectible NFT card art, centered legendary artifact, dark cinematic background, glowing energy aura, holographic detailing, elite game reward design, high detail, symmetrical composition, dramatic lighting, no text, no humans, no watermark, collectible rarity aesthetic, a battle-forged titan relic floating in the center, massive metallic armored core with red-orange reactor glow, forged steel plates, mechanical power field, war-engine energy, ancient futuristic weaponized artifact, legendary domination object',
  Ether:
    'ultra-premium futuristic collectible NFT card art, centered legendary artifact, dark cinematic background, glowing energy aura, holographic detailing, elite game reward design, high detail, symmetrical composition, dramatic lighting, no text, no humans, no watermark, collectible rarity aesthetic, an ethereal celestial relic floating in the center, translucent crystal core with cyan and pearl white light, divine flowing particles, spiritual energy ribbons, heavenly sci-fi aura, ascended intelligence artifact, legendary elegant object',
};

const GENERAL_PROMPT =
  'centered object, no text, no letters, no logo, no human face, no character portrait, no watermark, no frame text, dark premium background, collectible card art, sharp focus, cinematic lighting';

const CATEGORY_COLORS: Record<PremiumNftCategory, { primary: string; secondary: string }> = {
  Singularity: { primary: '#f4d35e', secondary: '#7b2fff' },
  Void: { primary: '#32003f', secondary: '#c1121f' },
  Cipher: { primary: '#00d1ff', secondary: '#0a2342' },
  Titan: { primary: '#ef233c', secondary: '#6c757d' },
  Ether: { primary: '#c8f7ff', secondary: '#00a6fb' },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, '')}/api`
  : 'http://localhost:4000/api';

const nowIso = () => new Date().toISOString();

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const readStoredJson = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeStoredJson = <T,>(key: string, value: T) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write issues in restrictive browser contexts.
  }
};

const toCategory = (value: unknown): PremiumNftCategory => {
  const normalized = String(value || '').trim().toLowerCase();

  switch (normalized) {
    case 'singularity':
      return 'Singularity';
    case 'void':
      return 'Void';
    case 'cipher':
      return 'Cipher';
    case 'titan':
      return 'Titan';
    case 'ether':
      return 'Ether';
    default:
      return 'Singularity';
  }
};

const createPlaceholderImage = (category: PremiumNftCategory) => {
  const palette = CATEGORY_COLORS[category];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="orb" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.95"/><stop offset="45%" stop-color="${palette.secondary}" stop-opacity="0.55"/><stop offset="100%" stop-color="#020617" stop-opacity="1"/></radialGradient><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#020617"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="768" height="1024" fill="url(#bg)"/><ellipse cx="384" cy="430" rx="230" ry="260" fill="url(#orb)"/><circle cx="384" cy="430" r="120" fill="none" stroke="${palette.primary}" stroke-opacity="0.8" stroke-width="4"/><circle cx="384" cy="430" r="180" fill="none" stroke="${palette.secondary}" stroke-opacity="0.45" stroke-width="3"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const createDefaultPrimeArtifacts = (): PrimeArtifactItem[] =>
  PREMIUM_CATEGORIES.map((category, index) => ({
    id: `prime-${category.toLowerCase()}`,
    name: `${category} Prime Artifact`,
    category,
    prompt: `${CATEGORY_PROMPTS[category]}, ${GENERAL_PROMPT}`,
    imageUrl: createPlaceholderImage(category),
    ownerId: null,
    isMinted: false,
    algoAssetId: null,
    createdAt: new Date(Date.now() - index * 1000).toISOString(),
    claimedAt: null,
  }));

const readOrganizerEvents = () => readStoredJson<OrganizerEvent[]>(ORGANIZER_EVENTS_KEY, []);
const writeOrganizerEvents = (events: OrganizerEvent[]) => writeStoredJson(ORGANIZER_EVENTS_KEY, events);

const readPrimeArtifacts = () =>
  readStoredJson<PrimeArtifactItem[]>(PRIME_ARTIFACTS_KEY, createDefaultPrimeArtifacts());

const writePrimeArtifacts = (artifacts: PrimeArtifactItem[]) => writeStoredJson(PRIME_ARTIFACTS_KEY, artifacts);

const readPendingRewards = () => readStoredJson<PendingReward[]>(PENDING_REWARDS_KEY, []);
const writePendingRewards = (rewards: PendingReward[]) => writeStoredJson(PENDING_REWARDS_KEY, rewards);

const getPromptForCategory = (category: PremiumNftCategory, customPrompt?: string) => {
  const prompt = String(customPrompt || '').trim();
  const base = prompt || CATEGORY_PROMPTS[category];
  return `${base}, ${GENERAL_PROMPT}`;
};

const mergeMarketplaceArtifacts = (
  localArtifacts: PrimeArtifactItem[],
  remoteArtifacts: PrimeArtifactItem[]
): PrimeArtifactItem[] => {
  const byId = new Map<string, PrimeArtifactItem>();

  localArtifacts.forEach((artifact) => {
    byId.set(artifact.id, artifact);
  });

  remoteArtifacts.forEach((artifact) => {
    const existing = byId.get(artifact.id);
    byId.set(artifact.id, existing ? { ...existing, ...artifact } : artifact);
  });

  PREMIUM_CATEGORIES.forEach((category) => {
    const alreadyPresent = Array.from(byId.values()).some((artifact) => artifact.category === category);
    if (!alreadyPresent) {
      const seed = createDefaultPrimeArtifacts().find((item) => item.category === category);
      if (seed) {
        byId.set(seed.id, seed);
      }
    }
  });

  return Array.from(byId.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
};

const mapBackendNftToPrimeArtifact = (record: Record<string, unknown>): PrimeArtifactItem => {
  const category = toCategory(record.category);

  return {
    id: String(record.id || createId()),
    name: String(record.name || `${category} Prime Artifact`),
    category,
    prompt: String(record.prompt || getPromptForCategory(category)),
    imageUrl: String(record.image_url || createPlaceholderImage(category)),
    ownerId: record.owner_id ? String(record.owner_id) : null,
    isMinted: Boolean(record.is_minted),
    algoAssetId: record.algo_asset_id ? String(record.algo_asset_id) : null,
    createdAt: String(record.created_at || nowIso()),
    claimedAt: record.claimed_at ? String(record.claimed_at) : null,
  };
};

const getXpForRank = (rank: number) => {
  if (rank <= 1) {
    return 0;
  }

  const index = rank - 2;
  return XP_BY_RANK[index] ?? 10;
};

const postJson = async <TResponse,>(path: string, body: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorPayload = (await response.json()) as Record<string, unknown>;
      if (typeof errorPayload.message === 'string' && errorPayload.message) {
        errorMessage = errorPayload.message;
      }
    } catch {
      // Ignore parse failures and use generic message.
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as TResponse;
};

const getJson = async <TResponse,>(path: string): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
};

export const PremiumEventsService = {
  getPremiumNftCategories() {
    return [...PREMIUM_CATEGORIES];
  },

  getPromptForCategory(category: PremiumNftCategory, customPrompt?: string) {
    return getPromptForCategory(category, customPrompt);
  },

  getXpForRank(rank: number) {
    return getXpForRank(rank);
  },

  async getOrganizerEvents() {
    return [...readOrganizerEvents()].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  },

  async createOrganizerEvent(input: CreateOrUpdateEventInput) {
    if (!input.posterUrl || !input.eventName || !input.eventDateTime) {
      throw new Error('poster, event name, and date/time are required');
    }

    const events = readOrganizerEvents();
    const now = nowIso();

    const next: OrganizerEvent = {
      id: createId(),
      posterUrl: input.posterUrl,
      eventName: input.eventName.trim(),
      eventDateTime: input.eventDateTime,
      premiumNftCategory: input.premiumNftCategory,
      rankings: [],
      createdAt: now,
      updatedAt: now,
    };

    const merged = [next, ...events];
    writeOrganizerEvents(merged);

    return next;
  },

  async updateOrganizerEvent(eventId: string, input: CreateOrUpdateEventInput) {
    if (!eventId) {
      throw new Error('eventId is required');
    }

    const events = readOrganizerEvents();
    const targetIndex = events.findIndex((event) => event.id === eventId);

    if (targetIndex < 0) {
      throw new Error('Event not found');
    }

    const updatedEvent: OrganizerEvent = {
      ...events[targetIndex],
      posterUrl: input.posterUrl,
      eventName: input.eventName.trim(),
      eventDateTime: input.eventDateTime,
      premiumNftCategory: input.premiumNftCategory,
      updatedAt: nowIso(),
    };

    const nextEvents = [...events];
    nextEvents[targetIndex] = updatedEvent;
    writeOrganizerEvents(nextEvents);

    return updatedEvent;
  },

  async saveEventRankings(eventId: string, rankingsInput: RankingInput[]) {
    if (!eventId) {
      throw new Error('eventId is required');
    }

    const events = readOrganizerEvents();
    const eventIndex = events.findIndex((event) => event.id === eventId);
    if (eventIndex < 0) {
      throw new Error('Event not found');
    }

    const normalizedRankings = rankingsInput
      .map((entry) => ({
        rank: Number(entry.rank),
        playerId: String(entry.playerId || '').trim(),
      }))
      .filter((entry) => Number.isFinite(entry.rank) && entry.rank > 0 && entry.playerId)
      .sort((left, right) => left.rank - right.rank);

    if (normalizedRankings.length === 0) {
      throw new Error('At least one ranking entry is required');
    }

    const rankings: OrganizerRankingRow[] = normalizedRankings.map((entry) => {
      const isWinner = entry.rank === 1;
      const xpAwarded = isWinner ? 0 : getXpForRank(entry.rank);

      return {
        rank: entry.rank,
        playerId: entry.playerId,
        xpAwarded,
        isWinner,
        badgeText: isWinner ? 'WINNER • Premium NFT' : `${xpAwarded} XP`,
      };
    });

    const nextEvents = [...events];
    const updatedEvent: OrganizerEvent = {
      ...nextEvents[eventIndex],
      rankings,
      updatedAt: nowIso(),
    };
    nextEvents[eventIndex] = updatedEvent;
    writeOrganizerEvents(nextEvents);

    const existingRewards = readPendingRewards();
    const dedupedExisting = existingRewards.filter((reward) => reward.eventId !== updatedEvent.id);

    const newRewards: PendingReward[] = rankings.map((entry) => ({
      id: createId(),
      eventId: updatedEvent.id,
      eventName: updatedEvent.eventName,
      playerId: entry.playerId,
      rank: entry.rank,
      xpAwarded: entry.xpAwarded,
      isWinner: entry.isWinner,
      premiumNftCategory: entry.isWinner ? updatedEvent.premiumNftCategory : null,
      status: 'pending',
      createdAt: nowIso(),
      claimedAt: null,
    }));

    writePendingRewards([...dedupedExisting, ...newRewards]);

    return {
      event: updatedEvent,
      rewards: newRewards,
    };
  },

  async getPrimeArtifactsMarketplace() {
    const localArtifacts = readPrimeArtifacts();

    try {
      const payload = await getJson<{ nfts: Record<string, unknown>[] }>('/nfts/marketplace');
      const remoteArtifacts = (payload.nfts || []).map(mapBackendNftToPrimeArtifact);
      const merged = mergeMarketplaceArtifacts(localArtifacts, remoteArtifacts);
      writePrimeArtifacts(merged);
      return merged;
    } catch {
      return localArtifacts;
    }
  },

  async generatePrimeArtifact(input: GeneratePrimeArtifactInput) {
    const payload = await postJson<{ nft: Record<string, unknown> }>('/generate-nft', {
      name: input.name || `${input.category} Prime Artifact`,
      category: input.category,
      prompt: getPromptForCategory(input.category, input.prompt),
      ownerId: input.ownerId || null,
      isMinted: input.isMinted ?? false,
      algoAssetId: input.algoAssetId || null,
    });

    const generated = mapBackendNftToPrimeArtifact(payload.nft || {});

    const current = readPrimeArtifacts();
    const merged = mergeMarketplaceArtifacts(current, [generated]);
    writePrimeArtifacts(merged);

    return generated;
  },

  async claimPrimeArtifact(artifactId: string, playerId: string) {
    if (!artifactId) {
      throw new Error('artifactId is required');
    }

    if (!playerId || !playerId.trim()) {
      throw new Error('playerId is required');
    }

    let claimed: PrimeArtifactItem | null = null;

    try {
      const payload = await postJson<{ nft: Record<string, unknown> }>(`/nfts/claim/${artifactId}`, {
        ownerId: playerId,
      });
      claimed = mapBackendNftToPrimeArtifact(payload.nft || {});
    } catch {
      const local = readPrimeArtifacts();
      const idx = local.findIndex((artifact) => artifact.id === artifactId);
      if (idx >= 0) {
        claimed = {
          ...local[idx],
          ownerId: playerId,
          isMinted: true,
          claimedAt: nowIso(),
        };
      }
    }

    if (!claimed) {
      throw new Error('Artifact not found');
    }

    const localArtifacts = readPrimeArtifacts();
    const merged = mergeMarketplaceArtifacts(localArtifacts, [
      {
        ...claimed,
        ownerId: playerId,
        isMinted: true,
        claimedAt: claimed.claimedAt || nowIso(),
      },
    ]);

    writePrimeArtifacts(merged);
    return merged.find((artifact) => artifact.id === claimed?.id) || claimed;
  },

  async getInventoryForOwner(ownerId: string) {
    if (!ownerId || !ownerId.trim()) {
      return [] as PrimeArtifactItem[];
    }

    try {
      const payload = await getJson<{ nfts: Record<string, unknown>[] }>(
        `/nfts/inventory/${encodeURIComponent(ownerId)}`
      );

      const mapped = (payload.nfts || []).map(mapBackendNftToPrimeArtifact);
      const merged = mergeMarketplaceArtifacts(readPrimeArtifacts(), mapped);
      writePrimeArtifacts(merged);

      return mapped;
    } catch {
      return readPrimeArtifacts().filter((artifact) => artifact.ownerId === ownerId);
    }
  },

  async getPendingRewardForCurrentUser() {
    const profile = await HackquestService.getCurrentUserProfile();
    const username = String(profile?.username || '').trim().toLowerCase();
    if (!username) {
      return null;
    }

    const pending = readPendingRewards()
      .filter(
        (reward) =>
          reward.status === 'pending' &&
          String(reward.playerId || '').trim().toLowerCase() === username
      )
      .sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );

    return pending[0] || null;
  },

  async consumePendingReward(rewardId: string) {
    const rewards = readPendingRewards();
    const index = rewards.findIndex((reward) => reward.id === rewardId);

    if (index < 0) {
      throw new Error('Reward not found');
    }

    if (rewards[index].status === 'claimed') {
      return rewards[index];
    }

    if (rewards[index].xpAwarded > 0) {
      await HackquestService.addBonusXp(rewards[index].xpAwarded, 'event_ranking');
    }

    const nextReward: PendingReward = {
      ...rewards[index],
      status: 'claimed',
      claimedAt: nowIso(),
    };

    const nextRewards = [...rewards];
    nextRewards[index] = nextReward;
    writePendingRewards(nextRewards);

    return nextReward;
  },

  async grantWinnerNftFromReward(reward: PendingReward) {
    if (!reward.isWinner || !reward.premiumNftCategory) {
      throw new Error('This reward is not a winner NFT reward');
    }

    const generated = await this.generatePrimeArtifact({
      category: reward.premiumNftCategory,
      name: `${reward.eventName} Winner Artifact`,
      ownerId: reward.playerId,
      isMinted: true,
    });

    await this.claimPrimeArtifact(generated.id, reward.playerId);
    await HackquestService.incrementNftCount(1);

    return generated;
  },
};
