const express = require('express');
const questController = require('../controllers/questController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', questController.listQuests);
router.post('/complete', requireAuth, questController.completeQuest);
router.get('/progress/:userId', requireAuth, questController.getQuestProgress);

module.exports = router;
