-- English Exam Portal — PostgreSQL schema

CREATE TABLE IF NOT EXISTS candidates (
  id                TEXT PRIMARY KEY,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT NOT NULL,
  applied_position  TEXT NOT NULL DEFAULT '',
  cv_stored_name    TEXT,
  cv_original_name  TEXT,
  test_date         TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id                        TEXT PRIMARY KEY,
  candidate_id              TEXT NOT NULL REFERENCES candidates(id),
  mcq_score                 INTEGER NOT NULL,
  listening_score           INTEGER NOT NULL DEFAULT 0,
  sales_score               DOUBLE PRECISION NOT NULL,
  typing_score              DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_score               DOUBLE PRECISION NOT NULL,
  passed                    BOOLEAN NOT NULL,
  ielts_pte_equivalent_band TEXT NOT NULL,
  sales_feedback            TEXT NOT NULL,
  mcq_answers               TEXT NOT NULL,
  listening_answers         TEXT NOT NULL DEFAULT '{}',
  sales_answers             TEXT NOT NULL,
  sales_question_scores     TEXT,
  typing_result             TEXT,
  session_assignment        TEXT,
  submitted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_sessions (
  id               TEXT PRIMARY KEY,
  assignment_json  TEXT NOT NULL,
  consumed         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_candidate ON assessment_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_results_submitted ON assessment_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON assessment_sessions(created_at DESC);
