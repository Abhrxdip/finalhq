const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/wallet', userController.getUserByWallet);
router.get('/wallet/:wallet', userController.getUserByWallet);
router.get('/:userId', userController.getUserById);

module.exports = router;
