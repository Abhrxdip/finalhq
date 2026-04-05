const express = require('express');
const premiumNftController = require('../controllers/premiumNftController');

const router = express.Router();

router.post('/generate-nft', premiumNftController.generateNft);
router.get('/nfts/marketplace', premiumNftController.listMarketplaceNfts);
router.get('/nfts/inventory/:ownerId', premiumNftController.listOwnerInventory);
router.post('/nfts/claim/:nftId', premiumNftController.claimNft);

module.exports = router;
