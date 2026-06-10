import { Router } from 'express';
import { MCQ_QUESTIONS } from '../data/mcqs.seed.js';
import { gradeMcqs, buildMcqReport } from '../services/mcqGrader.js';
import { evaluateSalesAnswers } from '../services/salesEvaluator.js';
import { calculateIeltsPteBand } from '../services/bandCalculator.js';
import { saveAssessmentResult, PASSING_MARK } from '../services/resultStore.js';
import { ASSESSMENT_TIME_MINUTES, TOTAL_MARKS } from '../config/assessment.js';

const router = Router();

/** GET /api/questions — MCQs without answer key (for test UI) */
router.get('/questions', (_req, res) => {
  const questions = MCQ_QUESTIONS.map(({ id, difficulty, type, question, options }) => ({
    id,
    difficulty,
    type,
    question,
    options,
  }));
  res.json({
    questions,
    totalMarks: TOTAL_MARKS,
    passingMark: PASSING_MARK,
    timeLimitMinutes: ASSESSMENT_TIME_MINUTES,
  });
});

/** POST /api/submit-assessment */
router.post('/submit-assessment', async (req, res) => {
  try {
    const { candidate, mcq_answers, sales_answers } = req.body;

    if (!candidate?.name || !candidate?.email) {
      return res.status(400).json({ error: 'Candidate name and email are required.' });
    }
    if (!candidate?.applied_position?.trim()) {
      return res.status(400).json({ error: 'Applied position is required.' });
    }
    if (!mcq_answers || !sales_answers) {
      return res.status(400).json({ error: 'MCQ and sales answers are required.' });
    }

    const { mcq_score, breakdown: mcq_breakdown } = gradeMcqs(mcq_answers);
    const salesEval = await evaluateSalesAnswers(sales_answers);
    const sales_score = salesEval.sales_score;
    const total_score = Math.round((mcq_score + sales_score) * 2) / 2;
    const passed = total_score >= PASSING_MARK;
    const ielts_pte_equivalent_band = calculateIeltsPteBand(total_score);

    const payload = {
      candidate: {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        applied_position: candidate.applied_position.trim(),
        test_date: candidate.test_date,
      },
      mcq_score,
      sales_score,
      total_score,
      passed,
      ielts_pte_equivalent_band,
      sales_feedback: salesEval.sales_feedback,
    };

    const { resultId } = saveAssessmentResult({
      ...payload,
      mcq_answers,
      sales_answers,
      sales_question_scores: salesEval.question_scores,
    });

    res.json({
      ...payload,
      result_id: resultId,
      mcq_breakdown,
      mcq_report: buildMcqReport(mcq_breakdown),
      sales_answers,
      sales_question_scores: salesEval.question_scores,
    });
  } catch (err) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ error: 'Failed to process assessment.', details: err.message });
  }
});

export default router;
