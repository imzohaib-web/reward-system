const express = require('express');
const customerController = require('../controllers/customerController');
const customerAuth = require('../middleware/customerAuth');

const router = express.Router();

router.get('/wallet', customerAuth, customerController.getWallet);
router.get('/history', customerAuth, customerController.getHistory);
router.post('/use', customerAuth, customerController.useReward);

module.exports = router;
