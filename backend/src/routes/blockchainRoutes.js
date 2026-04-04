const express = require('express');
const blockchainController = require('../controllers/blockchainController');

const router = express.Router();

router.post('/deploy', blockchainController.deployXpRegistry);
router.post('/mint-nft', blockchainController.mintNft);
router.post('/record-xp', blockchainController.recordXp);
router.get('/user-assets/:wallet', blockchainController.getUserAssets);
router.get('/user-xp/:wallet', blockchainController.getUserXp);
router.get('/verify-tx/:txId', blockchainController.verifyTx);

module.exports = router;
