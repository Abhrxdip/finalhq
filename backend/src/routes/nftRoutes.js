const express = require('express');
const nftController = require('../controllers/nftController');

const router = express.Router();

router.get('/user/:userId', nftController.getUserNfts);

module.exports = router;
