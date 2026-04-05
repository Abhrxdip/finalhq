const express = require('express');
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const userRoutes = require('./userRoutes');
const eventRoutes = require('./eventRoutes');
const questRoutes = require('./questRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const activityRoutes = require('./activityRoutes');
const nftRoutes = require('./nftRoutes');
const blockchainRoutes = require('./blockchainRoutes');
const premiumNftRoutes = require('./premiumNftRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/quests', questRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/activity', activityRoutes);
router.use('/nfts', nftRoutes);
router.use('/algo', blockchainRoutes);
router.use('/', premiumNftRoutes);

module.exports = router;
