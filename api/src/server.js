const express = require('express');
const path = require('path');
const { toggleAttendance, listLogs } = require('./attendanceService');
const { upsertUser, listUsers } = require('./userService');

const app = express();
const port = process.env.PORT || 3000;

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

    const result = await toggleAttendance(uid);
    res.status(201).json(result);
  } catch (error) {
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

app.listen(port, () => {
  console.log(`Attendance API listening on http://localhost:${port}`);
});
