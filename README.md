# Entegra Assessment Portal

Production-ready web application for **English Proficiency & Sales Assessment** — 50 marks total (35 to pass), aligned with IELTS/PTE Academic standards and sales hiring questionnaires.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| AI Grading | OpenAI API (Part 2 descriptive answers) |

## Assessment Structure

- **Part 1 — English Proficiency (40 marks):** 40 MCQs (20 simple, 10 intermediate, 10 advanced)
- **Part 2 — Sales Acumen (10 marks):** 5 descriptive questions × 2 marks (LLM-evaluated)
- **Time limit:** 45 minutes with auto-submit
- **Passing mark:** 35/50

## Quick Start

```bash
# Install dependencies
npm install
npm install --prefix server
npm install --prefix client

# Configure environment
cp server/.env.example server/.env
# Add your OPENAI_API_KEY for full LLM grading (optional for demo)

# Verify MCQ seed
npm run seed

# Run dev (API :3010 + Vite :5173)
npm run dev
```

| Portal | URL | Access |
|--------|-----|--------|
| **Portal selection** | [http://localhost:5173](http://localhost:5173) | Choose Candidate or Admin |
| **Candidate** | Select on home page | Fill onboarding form to start exam |
| **Admin** | Select on home page | Login required (see `.env`) |

Default admin credentials: `admin` / `changeme` (change in `server/.env` before production).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/questions` | MCQs for test UI (no answer key) |
| POST | `/api/submit-assessment` | Grade & store submission |
| POST | `/api/admin/login` | Admin login (returns JWT) |
| GET | `/api/admin/results` | All results (auth required) |
| GET | `/api/admin/results/:id` | Single result with MCQ breakdown (auth required) |
| GET | `/api/admin/me` | Verify admin session (auth required) |
| POST | `/api/admin/results/:id/cv` | Upload candidate CV (auth required) |
| GET | `/api/admin/results/:id/cv` | Download candidate CV (auth required) |

### Submit Response Schema

```json
{
  "candidate": { "name": "string", "email": "string" },
  "mcq_score": 32,
  "sales_score": 7.5,
  "total_score": 39.5,
  "passed": true,
  "ielts_pte_equivalent_band": "IELTS 6.0–6.5 / PTE 50–64 (Competent — Pass)",
  "sales_feedback": "string"
}
```

## Project Structure

```
├── shared/                 # Shared constants (assessment, sales questions, positions)
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Onboarding, Test, Result, Admin
│       ├── components/     # Timer, MCQ pages, word counter
│       └── api/            # API client
├── server/
│   ├── data/mcqs.seed.js   # 40 MCQs + answer key
│   ├── prompts/            # LLM evaluation prompt
│   ├── services/           # Grading, LLM, band calculator
│   ├── routes/             # Express routes
│   └── db/
│       ├── schema.sql      # Database schema
│       └── database.js     # SQLite connection
└── package.json            # Root scripts
```

## Production Build

```bash
npm run build          # Builds client to client/dist
npm start              # Serves API + static client on PORT (default 3010)
```

Set `NODE_ENV=production` and configure `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` before deploying. The server refuses to start in production without these values.

## Tests

```bash
npm test               # Runs server unit tests (Node built-in test runner)
```

Coverage includes assessment validation, MCQ grading, band mapping, and rate limiting middleware.

## Rate Limiting

Per-IP limits protect public write endpoints:

| Endpoint | Default limit |
|----------|----------------|
| `POST /api/submit-assessment` | 10 requests / 15 minutes |
| `POST /api/admin/login` | 10 requests / 15 minutes |

Tune via `RATE_LIMIT_SUBMIT_*` and `RATE_LIMIT_LOGIN_*` in `server/.env`. Set `TRUST_PROXY=true` when deployed behind a reverse proxy so client IPs are read correctly.

## LLM Grading

Without `OPENAI_API_KEY`, Part 2 uses heuristic demo grading. With a key set, the exact prompt in `server/prompts/salesEvaluation.prompt.js` is used to score each answer on sales strategy (1 mark) and English proficiency (1 mark).

## License

Private — internal hiring assessment use.
