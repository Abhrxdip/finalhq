const express = require('express');
const blockchainController = require('../controllers/blockchainController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

router.post('/deploy', requireAdmin, blockchainController.deployXpRegistry);
router.post('/mint-nft', blockchainController.mintNft);
router.post('/record-xp', blockchainController.recordXp);
router.get('/user-assets/:wallet', blockchainController.getUserAssets);
router.get('/user-xp/:wallet', blockchainController.getUserXp);
router.get('/verify-tx/:txId', blockchainController.verifyTx);

module.exports = router;
