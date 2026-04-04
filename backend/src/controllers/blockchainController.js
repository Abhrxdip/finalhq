const blockchainService = require('../services/blockchainService');
const { AppError, asyncHandler } = require('../utils/http');

const requireValue = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new AppError(400, `${fieldName} is required`);
  }
  return value;
};

const deployXpRegistry = asyncHandler(async (req, res) => {
  const deployment = await blockchainService.deployXpRegistry();
  res.status(200).json({ deployment });
});

const mintNft = asyncHandler(async (req, res) => {
  const userWallet = requireValue(req.body.userWallet || req.body.user_wallet, 'userWallet');
  const nftName = requireValue(req.body.nftName || req.body.nft_name, 'nftName');
  const ipfsHash = requireValue(req.body.ipfsHash || req.body.ipfs_hash, 'ipfsHash');

  const result = await blockchainService.mintNftForWallet({
    userWallet,
    nftName,
    ipfsHash,
  });

  res.status(200).json({
    result,
  });
});

const recordXp = asyncHandler(async (req, res) => {
  const userWallet = requireValue(req.body.userWallet || req.body.user_wallet, 'userWallet');
  const xp = Number(requireValue(req.body.xp, 'xp'));
  const questId = requireValue(req.body.questId || req.body.quest_id, 'questId');
  const appId = req.body.appId || req.body.app_id || null;

  if (!Number.isFinite(xp) || xp <= 0) {
    throw new AppError(400, 'xp must be a positive number');
  }

  const result = await blockchainService.recordXpForWallet({
    userWallet,
    xp,
    questId,
    appId,
  });

  res.status(200).json({
    result,
  });
});

const getUserAssets = asyncHandler(async (req, res) => {
  const wallet = requireValue(req.params.wallet, 'wallet');
  const result = await blockchainService.getUserAssets(wallet);
  res.status(200).json({ result });
});

const getUserXp = asyncHandler(async (req, res) => {
  const wallet = requireValue(req.params.wallet, 'wallet');
  const result = await blockchainService.getUserXp(wallet);
  res.status(200).json({ result });
});

const verifyTx = asyncHandler(async (req, res) => {
  const txId = requireValue(req.params.txId, 'txId');
  const result = await blockchainService.verifyTransaction(txId);
  res.status(200).json({ result });
});

module.exports = {
  deployXpRegistry,
  mintNft,
  recordXp,
  getUserAssets,
  getUserXp,
  verifyTx,
};
