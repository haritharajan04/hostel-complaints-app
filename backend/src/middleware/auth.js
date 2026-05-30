const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-9988';

module.exports = {
  verifyToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Access Denied: Missing Authorization Header' });
    }

    const token = authHeader.split(' ')[1]; // Extract from "Bearer <token>"
    if (!token) {
      return res.status(401).json({ error: 'Access Denied: Missing Token Credentials' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Attach user context (id, username, role)
      next();
    } catch (err) {
      res.status(403).json({ error: 'Access Denied: Invalid or Expired Token' });
    }
  },
  
  JWT_SECRET
};
