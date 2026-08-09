const express = require('express');
const rewardController = require('../controllers/rewardController');

const router = express.Router();

router.post('/order', rewardController.processOrder);
router.post('/cancel', rewardController.cancelOrder);
router.post('/referral', rewardController.processReferral);

router.get('/rules', rewardController.getRules);
router.put('/rules/:ruleKey', rewardController.updateRule);

module.exports = router;