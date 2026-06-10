import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/database.js';

const PASSING_MARK = 35;

export function saveAssessmentResult({
  candidate,
  mcq_score,
  sales_score,
  total_score,
  passed,
  ielts_pte_equivalent_band,
  sales_feedback,
  mcq_answers,
  sales_answers,
  sales_question_scores,
}) {
  const db = getDb();
  const candidateId = uuidv4();
  const resultId = uuidv4();

  const insertCandidate = db.prepare(`
    INSERT INTO candidates (id, full_name, email, phone, applied_position, test_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertResult = db.prepare(`
    INSERT INTO assessment_results (
      id, candidate_id, mcq_score, sales_score, total_score, passed,
      ielts_pte_equivalent_band, sales_feedback, mcq_answers, sales_answers,
      sales_question_scores
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertCandidate.run(
      candidateId,
      candidate.name,
      candidate.email,
      candidate.phone || '',
      candidate.applied_position || '',
      candidate.test_date || new Date().toISOString().split('T')[0]
    );
    insertResult.run(
      resultId,
      candidateId,
      mcq_score,
      sales_score,
      total_score,
      passed ? 1 : 0,
      ielts_pte_equivalent_band,
      sales_feedback,
      JSON.stringify(mcq_answers),
      JSON.stringify(sales_answers),
      JSON.stringify(sales_question_scores)
    );
  });

  transaction();

  return { candidateId, resultId };
}

export function getAllResults() {
  const db = getDb();
  return db
    .prepare(
      `
    SELECT
      r.id AS result_id,
      c.id AS candidate_id,
      c.full_name,
      c.email,
      c.phone,
      c.applied_position,
      c.cv_stored_name,
      c.cv_original_name,
      c.test_date,
      r.mcq_score,
      r.sales_score,
      r.total_score,
      r.passed,
      r.ielts_pte_equivalent_band,
      r.sales_feedback,
      r.mcq_answers,
      r.sales_answers,
      r.sales_question_scores,
      r.submitted_at
    FROM assessment_results r
    JOIN candidates c ON c.id = r.candidate_id
    ORDER BY r.submitted_at DESC
  `
    )
    .all()
    .map((row) => ({
      ...row,
      passed: Boolean(row.passed),
      mcq_answers: JSON.parse(row.mcq_answers),
      sales_answers: JSON.parse(row.sales_answers),
      sales_question_scores: row.sales_question_scores
        ? JSON.parse(row.sales_question_scores)
        : null,
    }));
}

export function getResultById(resultId) {
  const results = getAllResults();
  return results.find((r) => r.result_id === resultId) ?? null;
}

export function getCandidateIdByResultId(resultId) {
  const db = getDb();
  const row = db
    .prepare('SELECT candidate_id FROM assessment_results WHERE id = ?')
    .get(resultId);
  return row?.candidate_id ?? null;
}

export function updateCandidateCv(candidateId, storedName, originalName) {
  const db = getDb();
  db.prepare(
    `UPDATE candidates SET cv_stored_name = ?, cv_original_name = ? WHERE id = ?`
  ).run(storedName, originalName, candidateId);
}

export function getCandidateCv(candidateId) {
  const db = getDb();
  return db
    .prepare('SELECT cv_stored_name, cv_original_name FROM candidates WHERE id = ?')
    .get(candidateId);
}

export { PASSING_MARK };
