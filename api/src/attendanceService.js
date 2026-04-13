const db = require('./db');

function getLastActionByUid(uid) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT action FROM attendance_logs WHERE uid = ? ORDER BY id DESC LIMIT 1`,
      [uid],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row ? row.action : null);
      }
    );
  });
}

function insertLog(uid, action) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO attendance_logs (uid, action) VALUES (?, ?)`,
      [uid, action],
      function onInsert(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, uid, action });
      }
    );
  });
}

async function toggleAttendance(uid) {
  const lastAction = await getLastActionByUid(uid);
  const action = lastAction === 'IN' ? 'OUT' : 'IN';
  return insertLog(uid, action);
}

function listLogs(limit = 100) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT l.id, l.uid, u.name, l.action, l.created_at
       FROM attendance_logs l
       LEFT JOIN users u ON u.uid = l.uid
       ORDER BY l.id DESC
       LIMIT ?`,
      [limit],
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
  toggleAttendance,
  listLogs,
};
