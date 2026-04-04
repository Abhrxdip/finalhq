const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/wallet', requireAuth, userController.getUserByWallet);
router.get('/wallet/:wallet', requireAuth, userController.getUserByWallet);
router.get('/:userId', requireAuth, userController.getUserById);

module.exports = router;
