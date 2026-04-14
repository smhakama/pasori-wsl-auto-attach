const express = require('express');
const path = require('path');
const { toggleAttendance, listLogs, getDailySummary, getMonthlySummary, exportLogsCsv } = require('./attendanceService');
const parseYearMonth = (str) => {
  const m = /^([0-9]{4})-([0-9]{2})$/.exec(str);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) };
};
// CSVエクスポートAPI
app.get('/api/logs.csv', async (req, res) => {
  try {
    const { from, to } = req.query;
    const csv = await exportLogsCsv({ from, to });
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_logs.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'internal error' });
  }
});

// 月次サマリーAPI
app.get('/api/summary/monthly', async (req, res) => {
  try {
    const ym = String(req.query.ym || '').trim();
    const parsed = parseYearMonth(ym);
    if (!parsed) {
      res.status(400).json({ error: 'ym must be YYYY-MM' });
      return;
    }
    const rows = await getMonthlySummary(parsed.year, parsed.month);
    res.json({ ym, rows });
  } catch (error) {
    res.status(500).json({ error: 'internal error' });
  }
});
const { upsertUser, listUsers } = require('./userService');

const app = express();
const port = process.env.PORT || 3000;
const tapGuardSeconds = Number.parseInt(process.env.TAP_GUARD_SECONDS || '3', 10);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'pasori-attendance-api' });
});

app.post('/api/tap', async (req, res) => {
  try {
    const uid = String(req.body.uid || '').trim();

    if (!uid) {
      res.status(400).json({ error: 'uid is required' });
      return;
    }

    const result = await toggleAttendance(uid, { guardSeconds: tapGuardSeconds });
    res.status(201).json(result);
  } catch (error) {
    if (error && error.code === 'TAP_TOO_SOON') {
      res.status(429).json({
        error: 'tap too soon',
        guardSeconds: tapGuardSeconds,
        details: error.details,
      });
      return;
    }

    res.status(500).json({ error: 'internal error' });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const limit = Number.parseInt(req.query.limit, 10) || 100;
    const safeLimit = Math.min(Math.max(limit, 1), 1000);
    const logs = await listLogs(safeLimit);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'internal error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const uid = String(req.body.uid || '').trim();
    const name = String(req.body.name || '').trim();

    if (!uid || !name) {
      res.status(400).json({ error: 'uid and name are required' });
      return;
    }

    const user = await upsertUser(uid, name);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'internal error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'internal error' });
  }
});

app.get('/api/summary/daily', async (req, res) => {
  try {
    const date = String(req.query.date || '').trim();
    const targetDate = date || new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      res.status(400).json({ error: 'date must be YYYY-MM-DD' });
      return;
    }

    const rows = await getDailySummary(targetDate);
    res.json({ date: targetDate, users: rows });
  } catch (error) {
    res.status(500).json({ error: 'internal error' });
  }
});

app.listen(port, () => {
  console.log(`Attendance API listening on http://localhost:${port}`);
});
