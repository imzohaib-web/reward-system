const express = require('express');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.post('/add', walletController.addReward);
router.post('/use', walletController.useReward);
router.post('/remove', walletController.removeReward);
router.get('/history', walletController.getHistory);
router.get('/balance', walletController.getBalance);
router.post('/expire', walletController.expireRewards);

module.exports = router;