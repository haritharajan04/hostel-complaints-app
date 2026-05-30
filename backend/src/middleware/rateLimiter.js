const rateLimit = require('express-rate-limit');

// Strict rate limiter for Authentication/Login endpoints (prevent brute-force scans)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Max 10 attempts
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Standard limiter for general API routes (prevent resource DOS abuse)
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 100, // Max 100 requests per 5 minutes
  message: {
    error: 'Too many request queries sent. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter
};
