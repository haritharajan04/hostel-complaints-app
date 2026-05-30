const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

module.exports = {
  login: async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
      const db = getDb();
      // Search for user in database
      const user = await db.get('SELECT * FROM users WHERE username = ?', username);
      if (!user) {
        return res.status(401).json({ error: 'Access Denied: Invalid username or credentials' });
      }

      // Verify bcrypt password hash
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Access Denied: Invalid username or credentials' });
      }

      // Generate Access Token (expires in 12 hours)
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token,
        username: user.username,
        role: user.role
      });
    } catch (err) {
      console.error('[Auth Controller] Login Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  register: async (req, res) => {
    const { username, password, role } = req.body;
    
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password and role are required' });
    }

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Role must be 'student' or 'admin'" });
    }

    try {
      const db = getDb();
      
      // Prevent duplicates
      const exists = await db.get('SELECT * FROM users WHERE username = ?', username);
      if (exists) {
        return res.status(400).json({ error: 'Username already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await db.run(
        'INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)',
        [username, passwordHash, role]
      );

      res.status(201).json({ success: true, message: `User '${username}' registered successfully as ${role}` });
    } catch (err) {
      console.error('[Auth Controller] Registration Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
