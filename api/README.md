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

## PaSoRi自動打刻連携

PaSoRiリーダーでICカードをかざすと自動で /api/tap へPOSTします。

### 使い方

1. 依存インストール
  ```powershell
  cd api
  npm install
  ```
2. 勤怠APIサーバ起動
  ```powershell
  npm start
  ```
3. 新しいターミナルでPaSoRi連携スクリプト起動
  ```powershell
  node nfc-tap-poster.js
  ```
4. カードをかざすと自動で打刻されます

環境変数でAPI URLやガード秒数を変更可能:

```
API_URL=http://localhost:3000/api/tap TAP_GUARD_SECONDS=5 node nfc-tap-poster.js
```

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

Tap guard is enabled by default (3 seconds) to prevent accidental duplicate taps.

You can change it with environment variable:

TAP_GUARD_SECONDS=5 npm start

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

### Daily summary

```http
GET /api/summary/daily?date=2026-04-14
```

`date` is optional. If omitted, today is used.
