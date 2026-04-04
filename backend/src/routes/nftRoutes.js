const express = require('express');
const nftController = require('../controllers/nftController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/user/:userId', requireAuth, nftController.getUserNfts);

module.exports = router;
