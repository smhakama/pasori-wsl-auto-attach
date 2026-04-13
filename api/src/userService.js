const db = require('./db');

function upsertUser(uid, name) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (uid, name) VALUES (?, ?)
       ON CONFLICT(uid) DO UPDATE SET name = excluded.name`,
      [uid, name],
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ uid, name });
      }
    );
  });
}

function listUsers() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT uid, name, created_at FROM users ORDER BY created_at DESC`,
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      }
    );
  });
}

module.exports = {
  upsertUser,
  listUsers,
};
