const premiumNftService = require('../services/premiumNftService');
const { AppError, asyncHandler } = require('../utils/http');

const requireValue = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new AppError(400, `${fieldName} is required`);
  }
  return value;
};

const generateNft = asyncHandler(async (req, res) => {
  const category = requireValue(req.body.category, 'category');

  const result = await premiumNftService.generateNft({
    id: req.body.id || null,
    name: req.body.name || null,
    category,
    prompt: req.body.prompt || null,
    ownerId: req.body.ownerId || req.body.owner_id || null,
    isMinted: req.body.isMinted ?? req.body.is_minted ?? false,
    algoAssetId: req.body.algoAssetId || req.body.algo_asset_id || null,
  });

  res.status(201).json({
    success: true,
    nft: result.nft,
    storagePath: result.storagePath,
  });
});

const listMarketplaceNfts = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const nfts = await premiumNftService.listMarketplaceNfts({ limit });

  res.status(200).json({
    nfts,
  });
});

const listOwnerInventory = asyncHandler(async (req, res) => {
  const ownerId = requireValue(req.params.ownerId, 'ownerId');
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const nfts = await premiumNftService.listOwnerInventory({ ownerId, limit });

  res.status(200).json({
    ownerId,
    nfts,
  });
});

const claimNft = asyncHandler(async (req, res) => {
  const nftId = requireValue(req.params.nftId, 'nftId');
  const ownerId = requireValue(req.body.ownerId || req.body.owner_id, 'ownerId');

  const nft = await premiumNftService.claimNft({
    nftId,
    ownerId,
    algoAssetId: req.body.algoAssetId || req.body.algo_asset_id || null,
  });

  res.status(200).json({
    success: true,
    nft,
  });
});

module.exports = {
  generateNft,
  listMarketplaceNfts,
  listOwnerInventory,
  claimNft,
};
