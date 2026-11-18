import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/database.js';
import { MCQ_QUESTIONS } from '../data/mcqs.seed.js';
import { LISTENING_BANK } from '../data/listening.bank.js';
import { SALES_QUESTION_BANK } from '../shared/salesQuestions.js';
import { TYPING_PASSAGES } from '../shared/typingPassages.js';
import {
  MCQ_COUNT,
  WRITING_COUNT,
  LISTENING_MAX_PLAYS,
} from '../config/assessment.js';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickDistinct(items, count) {
  return shuffle(items).slice(0, count);
}

export async function createAssessmentSession() {
  const mcqIds = pickDistinct(MCQ_QUESTIONS.map((q) => q.id), MCQ_COUNT);
  const listeningId = pickDistinct(LISTENING_BANK.map((d) => d.id), 1)[0];
  const writingIds = pickDistinct(SALES_QUESTION_BANK.map((q) => q.id), WRITING_COUNT);
  const typingPassageId = pickDistinct(TYPING_PASSAGES.map((p) => p.id), 1)[0];

  const sessionId = uuidv4();
  const assignment = { mcqIds, listeningId, writingIds, typingPassageId };

  await query(
    `INSERT INTO assessment_sessions (id, assignment_json)
     VALUES ($1, $2)`,
    [sessionId, JSON.stringify(assignment)]
  );

  return { sessionId, assignment };
}

export async function getAssessmentSession(sessionId) {
  if (!sessionId) return null;
  const { rows } = await query(
    `SELECT id, assignment_json, consumed
     FROM assessment_sessions WHERE id = $1`,
    [sessionId]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    consumed: Boolean(row.consumed),
    assignment: JSON.parse(row.assignment_json),
  };
}

export async function consumeAssessmentSession(sessionId) {
  await query(`UPDATE assessment_sessions SET consumed = TRUE WHERE id = $1`, [sessionId]);
}

export function buildPublicPaper(assignment) {
  const mcqById = Object.fromEntries(MCQ_QUESTIONS.map((q) => [q.id, q]));
  const dialogue = LISTENING_BANK.find((d) => d.id === assignment.listeningId);
  const writingById = Object.fromEntries(SALES_QUESTION_BANK.map((q) => [q.id, q]));
  const typing = TYPING_PASSAGES.find((p) => p.id === assignment.typingPassageId);

  const questions = assignment.mcqIds.map((id, index) => {
    const q = mcqById[id];
    return {
      id: index + 1,
      poolId: id,
      difficulty: q.difficulty,
      type: q.type,
      question: q.question,
      options: q.options,
    };
  });

  const writingQuestions = assignment.writingIds.map((id, index) => {
    const q = writingById[id];
    return {
      ...q,
      displayLabel: `Q${index + 1}. ${q.prompt}`,
      slot: `q${index + 1}`,
    };
  });

  return {
    questions,
    listening: {
      dialogue: {
        id: dialogue.id,
        title: dialogue.title,
        scenario: dialogue.scenario,
        speakers: dialogue.speakers.map(({ id, name, role, voice }) => ({ id, name, role, voice })),
        audioUrl: dialogue.audioUrl,
        maxPlays: LISTENING_MAX_PLAYS,
      },
      questions: dialogue.questions.map(({ id, difficulty, type, question, options }) => ({
        id,
        difficulty,
        type,
        question,
        options,
      })),
    },
    writingQuestions,
    typing: {
      id: typing.id,
      title: typing.title,
      text: typing.text,
    },
  };
}
