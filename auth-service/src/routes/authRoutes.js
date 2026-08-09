const express = require('express');
const authController = require('../controllers/authController');
const jwtAuth = require('../middleware/jwtAuth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', jwtAuth, authController.getMe);

module.exports = router;
