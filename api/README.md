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

## Dashboard

Open this page in browser after startup:

`http://localhost:3000`

You can:

- register users (`UID` + `name`)
- test card tap (`UID`)
- view recent logs

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

### Register or update user

```http
POST /api/users
Content-Type: application/json

{
  "uid": "0123456789AB",
  "name": "Makoto"
}
```

### List users

```http
GET /api/users
```

### List logs

```http
GET /api/logs?limit=100
```

Response contains `name` when UID is registered.
