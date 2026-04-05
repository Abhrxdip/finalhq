const crypto = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const { AppError } = require('../utils/http');

const PREMIUM_CATEGORY_MAP = {
  singularity: 'Singularity',
  void: 'Void',
  cipher: 'Cipher',
  titan: 'Titan',
  ether: 'Ether',
};

const GENERAL_PROMPT =
  'include dragons or mythical legendary creatures as the core subject, no text, no letters, no logo, no human face, no watermark, no frame text, collectible card art, sharp focus, cinematic fantasy lighting';

const CATEGORY_PROMPTS = {
  Singularity:
    'ultra-premium fantasy collectible NFT card art, legendary cosmic dragon coiled around a singularity core, radiant scales, celestial nebula storm, arcane particles, dramatic rim light, high detail, centered composition, heroic mythic atmosphere, elite game reward quality',
  Void:
    'ultra-premium fantasy collectible NFT card art, abyssal shadow dragon emerging from a void rift, obsidian horns, crimson and violet smoke, cursed relic fragments, dark epic background, high detail, centered composition, intimidating legendary creature mood',
  Cipher:
    'ultra-premium fantasy collectible NFT card art, runic dragon guardian with floating glyph tablets, enchanted sapphire fire, mystic code sigils, ancient temple ambience, high detail, centered composition, arcane legendary creature design',
  Titan:
    'ultra-premium fantasy collectible NFT card art, colossal armored drake and titan beast fusion, molten chest core, volcanic sparks, battle-scarred scales, cinematic smoke, high detail, centered composition, mythic warlord creature aesthetic',
  Ether:
    'ultra-premium fantasy collectible NFT card art, celestial phoenix-griffin spirit with luminous wings, floating crystal halo, moonlit clouds, pearl and cyan aura, sacred wind trails, high detail, centered composition, elegant mythical creature style',
};

let cachedSupabaseClient = null;

const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new AppError(500, 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  if (!cachedSupabaseClient) {
    cachedSupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  return cachedSupabaseClient;
};

const getSupabaseTable = () => process.env.SUPABASE_NFT_TABLE || 'nfts';
const getSupabaseBucket = () => process.env.SUPABASE_NFT_BUCKET || 'nfts';

const isMissingTableError = (error) => {
  const message = String(error?.details || error?.message || '').toLowerCase();
  return (
    message.includes('could not find the table') ||
    message.includes('schema cache') ||
    message.includes('relation')
  );
};

const normalizeCategory = (value) => {
  const raw = String(value || '').trim().toLowerCase();
  const resolved = PREMIUM_CATEGORY_MAP[raw];

  if (!resolved) {
    throw new AppError(
      400,
      `category must be one of: ${Object.keys(PREMIUM_CATEGORY_MAP).join(', ')}`
    );
  }

  return resolved;
};

const buildPrompt = ({ category, prompt = '' }) => {
  const trimmedPrompt = String(prompt || '').trim();
  const basePrompt = trimmedPrompt || CATEGORY_PROMPTS[category];
  return `${basePrompt}, ${GENERAL_PROMPT}`;
};

const callStabilityCore = async ({ prompt }) => {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new AppError(500, 'STABILITY_API_KEY is not configured');
  }

  const form = new FormData();
  form.append('prompt', prompt);
  form.append('aspect_ratio', '2:3');
  form.append('output_format', 'png');

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*',
    },
    body: form,
  });

  if (!response.ok) {
    const responseText = await response.text();
    const statusCode = response.status === 402 ? 402 : 502;
    throw new AppError(
      statusCode,
      `Stability AI image generation failed with status ${response.status}`,
      responseText.slice(0, 600)
    );
  }

  const imageArrayBuffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') || 'image/png';

  return {
    imageBuffer: Buffer.from(imageArrayBuffer),
    mimeType,
  };
};

const uploadToSupabaseStorage = async ({ imageBuffer, mimeType, filePrefix }) => {
  const supabase = getSupabaseClient();
  const bucket = getSupabaseBucket();
  const dateSegment = new Date().toISOString().slice(0, 10);
  const fileName = `${filePrefix}-${crypto.randomUUID()}.png`;
  const storagePath = `prime-artifacts/${dateSegment}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, imageBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) {
    throw new AppError(502, 'Failed to upload generated NFT image to Supabase Storage', uploadError.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
};

const insertNftMetadata = async (metadataRow) => {
  const supabase = getSupabaseClient();
  const table = getSupabaseTable();

  const { data, error } = await supabase.from(table).insert([metadataRow]).select('*').single();

  if (error) {
    throw new AppError(502, 'Failed to insert generated NFT metadata into Supabase table', error.message);
  }

  return data;
};

const generateNft = async ({
  name,
  category,
  prompt,
  ownerId = null,
  isMinted = false,
  algoAssetId = null,
  id = null,
}) => {
  const resolvedCategory = normalizeCategory(category);
  const resolvedPrompt = buildPrompt({
    category: resolvedCategory,
    prompt,
  });

  const { imageBuffer, mimeType } = await callStabilityCore({
    prompt: resolvedPrompt,
  });

  const { storagePath, publicUrl } = await uploadToSupabaseStorage({
    imageBuffer,
    mimeType,
    filePrefix: resolvedCategory.toLowerCase(),
  });

  const metadataRow = {
    ...(id ? { id } : {}),
    name: String(name || `${resolvedCategory} Prime Artifact`),
    category: resolvedCategory.toLowerCase(),
    prompt: resolvedPrompt,
    image_url: publicUrl,
    owner_id: ownerId,
    is_minted: Boolean(isMinted),
    algo_asset_id: algoAssetId,
    created_at: new Date().toISOString(),
  };

  let nft;
  let metadataPersisted = true;
  let warning = null;

  try {
    nft = await insertNftMetadata(metadataRow);
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }

    // Keep generation usable when storage is healthy but metadata table has not been created yet.
    metadataPersisted = false;
    warning = `Supabase table '${getSupabaseTable()}' is missing. Run backend/sql/supabase_nfts_table.sql to enable persistent NFT metadata.`;

    nft = {
      id: id || crypto.randomUUID(),
      ...metadataRow,
    };
  }

  return {
    nft,
    storagePath,
    metadataPersisted,
    warning,
  };
};

const listMarketplaceNfts = async ({ limit = 100 } = {}) => {
  const supabase = getSupabaseClient();
  const table = getSupabaseTable();
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 100;

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new AppError(502, 'Failed to fetch NFT marketplace records', error.message);
  }

  return data || [];
};

const listOwnerInventory = async ({ ownerId, limit = 100 } = {}) => {
  if (!ownerId) {
    throw new AppError(400, 'ownerId is required');
  }

  const supabase = getSupabaseClient();
  const table = getSupabaseTable();
  const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 100;

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new AppError(502, 'Failed to fetch owner NFT inventory', error.message);
  }

  return data || [];
};

const claimNft = async ({ nftId, ownerId, algoAssetId = null } = {}) => {
  if (!nftId) {
    throw new AppError(400, 'nftId is required');
  }

  if (!ownerId) {
    throw new AppError(400, 'ownerId is required');
  }

  const supabase = getSupabaseClient();
  const table = getSupabaseTable();

  const updatePayload = {
    owner_id: ownerId,
    is_minted: true,
    ...(algoAssetId ? { algo_asset_id: algoAssetId } : {}),
  };

  const { data, error } = await supabase
    .from(table)
    .update(updatePayload)
    .eq('id', nftId)
    .select('*')
    .single();

  if (error) {
    throw new AppError(502, 'Failed to claim NFT record', error.message);
  }

  return data;
};

module.exports = {
  PREMIUM_CATEGORY_MAP,
  CATEGORY_PROMPTS,
  GENERAL_PROMPT,
  normalizeCategory,
  buildPrompt,
  generateNft,
  listMarketplaceNfts,
  listOwnerInventory,
  claimNft,
};
