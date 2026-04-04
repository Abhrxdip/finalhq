const express = require('express');
const healthRoutes = require('./healthRoutes');
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const questRoutes = require('./questRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const activityRoutes = require('./activityRoutes');
const nftRoutes = require('./nftRoutes');
const blockchainRoutes = require('./blockchainRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/quests', questRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/activity', activityRoutes);
router.use('/nfts', nftRoutes);
router.use('/algo', blockchainRoutes);

module.exports = router;
