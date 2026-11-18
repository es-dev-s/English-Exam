# English Exam Portal — Frontend (UI)

Self-contained React (Vite) app. Deploy this folder alone.

## Setup

```bash
cd client
npm install
cp .env.example .env
```

Set API URL in `.env`:

```env
VITE_API_URL=http://10.80.80.220:3010
```

Or leave unset to auto-use `http://<same-hostname>:3010`.

## Run

```bash
npm run dev       # http://localhost:5173
npm run build     # production build → dist/
npm run preview   # serve dist (default preview port may be 4173)
```

## Production

```bash
cd client
npm install
# Ensure VITE_API_URL points at your live API before build
npm run build
npm run preview
# or serve the dist/ folder with nginx / IIS / any static host
```

Listening audio files live in `public/audio/` and ship with the build.
