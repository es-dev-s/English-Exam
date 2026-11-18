# English Exam Portal — Backend (API)

Self-contained Express API. Deploy this folder alone.

## Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env — required: DATABASE_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
```

## Run

```bash
npm run seed    # optional verify banks
npm run dev     # development (watch)
npm start       # production (NODE_ENV=production)
```

Default: `http://0.0.0.0:3010`

| Check | URL |
|-------|-----|
| Health + DB | `GET /health` |
| Questions | `GET /api/questions` |
| Admin login | `POST /api/admin/login` |

## Production `.env` checklist

- `HOST=0.0.0.0`
- `PORT=3010`
- `DATABASE_URL=postgresql://...`
- Strong `JWT_SECRET` (not the dev default)
- Strong `ADMIN_PASSWORD`
- Optional: `CLIENT_ORIGIN=http://YOUR_FRONTEND_HOST:5173` (LAN IPs are auto-allowed)

## PM2 example

```bash
cd server
npm install
npm start
# or: pm2 start npm --name exam-api -- start
```

## Optional: regenerate listening audio

```bash
npm run generate:audio
```

Writes into sibling `../client/public/audio` when present, otherwise `./generated-audio`.  
Override with `AUDIO_OUT_DIR=/path/to/client/public/audio`.
