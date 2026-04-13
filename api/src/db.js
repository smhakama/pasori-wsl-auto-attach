const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'attendance.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT NOT NULL,
      action TEXT NOT NULL CHECK(action IN ('IN', 'OUT')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
