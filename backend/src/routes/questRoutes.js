const express = require('express');
const questController = require('../controllers/questController');

const router = express.Router();

router.get('/', questController.listQuests);
router.post('/complete', questController.completeQuest);
router.get('/progress/:userId', questController.getQuestProgress);

module.exports = router;
