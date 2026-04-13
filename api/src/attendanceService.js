const db = require('./db');

function getLastLogByUid(uid) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, action, created_at FROM attendance_logs WHERE uid = ? ORDER BY id DESC LIMIT 1`,
      [uid],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      }
    );
  });
}

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

function hasRecentTap(uid, seconds) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 1 AS exists_flag
       FROM attendance_logs
       WHERE uid = ?
         AND created_at >= datetime('now', ?)
       ORDER BY id DESC
       LIMIT 1`,
      [uid, `-${seconds} seconds`],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(Boolean(row));
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

async function toggleAttendance(uid, options = {}) {
  const guardSeconds = Number.isInteger(options.guardSeconds)
    ? options.guardSeconds
    : 0;

  if (guardSeconds > 0) {
    const recent = await hasRecentTap(uid, guardSeconds);
    if (recent) {
      const lastLog = await getLastLogByUid(uid);
      const error = new Error('tap too soon');
      error.code = 'TAP_TOO_SOON';
      error.details = {
        uid,
        guardSeconds,
        lastLog,
      };
      throw error;
    }
  }

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

function getDailySummary(dateText) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
         l.uid,
         COALESCE(u.name, '') AS name,
         SUM(CASE WHEN l.action = 'IN' THEN 1 ELSE 0 END) AS in_count,
         SUM(CASE WHEN l.action = 'OUT' THEN 1 ELSE 0 END) AS out_count,
         MAX(l.created_at) AS last_tap_at
       FROM attendance_logs l
       LEFT JOIN users u ON u.uid = l.uid
       WHERE date(l.created_at, 'localtime') = ?
       GROUP BY l.uid, u.name
       ORDER BY l.uid ASC`,
      [dateText],
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
  getDailySummary,
};
