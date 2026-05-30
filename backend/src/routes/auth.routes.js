const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

// Authentication routes (protected by brute-force limiter)
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);

module.exports = router;
