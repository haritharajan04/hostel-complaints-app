const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

let db;

async function initDb() {
  db = await open({
    filename: path.join(__dirname, '..', '..', 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create Users Table (for RBAC authentication)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Complaints Table (with all operational and attachment columns)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      studentName TEXT NOT NULL,
      roomNumber TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      priority TEXT NOT NULL DEFAULT 'Medium',
      assignedTo TEXT DEFAULT '',
      remarks TEXT DEFAULT '',
      fileUrl TEXT DEFAULT '',
      historyLog TEXT NOT NULL, -- JSON string representing historic updates
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Auto-initialize a default Admin user if none exists
  const adminExists = await db.get('SELECT * FROM users WHERE role = ?', 'admin');
  if (!adminExists) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)',
      ['admin', adminPasswordHash, 'admin']
    );
    console.log('[Database] Default Admin created: admin / admin123');
  }

  // Auto-initialize a default Student user for testing
  const studentExists = await db.get('SELECT * FROM users WHERE role = ?', 'student');
  if (!studentExists) {
    const studentPasswordHash = await bcrypt.hash('student123', 10);
    await db.run(
      'INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)',
      ['student', studentPasswordHash, 'student']
    );
    console.log('[Database] Default Student created: student / student123');
  }

  console.log('[Database] SQLite persistent schema connected successfully');
  return db;
}

module.exports = {
  initDb,
  getDb: () => {
    if (!db) throw new Error('Database not initialized! Call initDb() first.');
    return db;
  }
};
