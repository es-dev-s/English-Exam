-- English Exam Portal — Assessment Results Schema

CREATE TABLE IF NOT EXISTS candidates (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  applied_position  TEXT NOT NULL DEFAULT '',
  cv_stored_name    TEXT,
  cv_original_name  TEXT,
  test_date         TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id                        TEXT PRIMARY KEY,
  candidate_id              TEXT NOT NULL REFERENCES candidates(id),
  mcq_score                 INTEGER NOT NULL,
  sales_score               REAL NOT NULL,
  total_score               REAL NOT NULL,
  passed                    INTEGER NOT NULL,
  ielts_pte_equivalent_band TEXT NOT NULL,
  sales_feedback            TEXT NOT NULL,
  mcq_answers               TEXT NOT NULL,
  sales_answers             TEXT NOT NULL,
  sales_question_scores     TEXT,
  submitted_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_results_candidate ON assessment_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_results_submitted ON assessment_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
