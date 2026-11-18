import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../db/database.js';
import { PASSING_MARK } from '../config/assessment.js';

const RESULT_SELECT = `
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
    r.listening_score,
    r.sales_score,
    r.typing_score,
    r.total_score,
    r.passed,
    r.ielts_pte_equivalent_band,
    r.sales_feedback,
    r.mcq_answers,
    r.listening_answers,
    r.sales_answers,
    r.sales_question_scores,
    r.typing_result,
    r.session_assignment,
    r.submitted_at
  FROM assessment_results r
  JOIN candidates c ON c.id = r.candidate_id
`;

function parseJsonField(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error('Failed to parse stored JSON field:', err.message);
    return fallback;
  }
}

function toIso(value) {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapResultRow(row) {
  return {
    ...row,
    listening_score: row.listening_score ?? 0,
    typing_score: row.typing_score ?? 0,
    passed: Boolean(row.passed),
    mcq_answers: parseJsonField(row.mcq_answers, {}),
    listening_answers: parseJsonField(row.listening_answers, {}),
    sales_answers: parseJsonField(row.sales_answers, {}),
    sales_question_scores: parseJsonField(row.sales_question_scores, null),
    typing_result: parseJsonField(row.typing_result, null),
    session_assignment: parseJsonField(row.session_assignment, null),
    submitted_at: toIso(row.submitted_at),
  };
}

export async function saveAssessmentResult({
  candidate,
  mcq_score,
  listening_score = 0,
  sales_score,
  typing_score = 0,
  total_score,
  passed,
  ielts_pte_equivalent_band,
  sales_feedback,
  mcq_answers,
  listening_answers = {},
  sales_answers,
  sales_question_scores,
  typing_result = null,
  session_assignment = null,
}) {
  const candidateId = uuidv4();
  const resultId = uuidv4();

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO candidates (id, full_name, email, phone, applied_position, test_date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        candidateId,
        candidate.name,
        candidate.email,
        candidate.phone || '',
        candidate.applied_position || '',
        candidate.test_date || new Date().toISOString().split('T')[0],
      ]
    );

    await client.query(
      `INSERT INTO assessment_results (
        id, candidate_id, mcq_score, listening_score, sales_score, typing_score, total_score, passed,
        ielts_pte_equivalent_band, sales_feedback, mcq_answers, listening_answers, sales_answers,
        sales_question_scores, typing_result, session_assignment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        resultId,
        candidateId,
        mcq_score,
        listening_score,
        sales_score,
        typing_score,
        total_score,
        Boolean(passed),
        ielts_pte_equivalent_band,
        sales_feedback,
        JSON.stringify(mcq_answers),
        JSON.stringify(listening_answers),
        JSON.stringify(sales_answers),
        JSON.stringify(sales_question_scores),
        typing_result ? JSON.stringify(typing_result) : null,
        session_assignment ? JSON.stringify(session_assignment) : null,
      ]
    );
  });

  return { candidateId, resultId };
}

export async function getAllResults() {
  const { rows } = await query(`${RESULT_SELECT} ORDER BY r.submitted_at DESC`);
  return rows.map(mapResultRow);
}

export async function getResultById(resultId) {
  const { rows } = await query(`${RESULT_SELECT} WHERE r.id = $1`, [resultId]);
  return rows[0] ? mapResultRow(rows[0]) : null;
}

export async function getCandidateIdByResultId(resultId) {
  const { rows } = await query(
    'SELECT candidate_id FROM assessment_results WHERE id = $1',
    [resultId]
  );
  return rows[0]?.candidate_id ?? null;
}

export async function updateCandidateCv(candidateId, storedName, originalName) {
  await query(
    `UPDATE candidates SET cv_stored_name = $1, cv_original_name = $2 WHERE id = $3`,
    [storedName, originalName, candidateId]
  );
}

export async function getCandidateCv(candidateId) {
  const { rows } = await query(
    'SELECT cv_stored_name, cv_original_name FROM candidates WHERE id = $1',
    [candidateId]
  );
  return rows[0] ?? null;
}

export { PASSING_MARK };
