# Attendance API (Phase 2)

Minimal attendance app API using Express + SQLite.

## Requirements

- Node.js 20+
- npm 10+

## Setup

```powershell
cd api
npm install
npm start
```

Server starts at `http://localhost:3000`.

## Endpoints

### Health check

```http
GET /health
```

### Tap card UID (IN/OUT toggle)

```http
POST /api/tap
Content-Type: application/json

{
  "uid": "0123456789AB"
}
```

Response example:

```json
{
  "id": 1,
  "uid": "0123456789AB",
  "action": "IN"
}
```

### List logs

```http
GET /api/logs?limit=100
```
