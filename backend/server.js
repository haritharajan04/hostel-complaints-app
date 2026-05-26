const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Initialize SQLite database
async function initDb() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('SQLite Database Connected');
}

initDb().catch(err => console.error('Database connection error:', err));

// Routes
// Get all complaints
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await db.all('SELECT * FROM complaints ORDER BY createdAt DESC');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const result = await db.run(
      'INSERT INTO complaints (title, description, category) VALUES (?, ?, ?)',
      [title, description, category || 'Other']
    );

    const savedComplaint = await db.get('SELECT * FROM complaints WHERE id = ?', result.lastID);
    res.status(201).json(savedComplaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
