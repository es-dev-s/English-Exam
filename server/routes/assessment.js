import { Router } from 'express';
import { MCQ_QUESTIONS } from '../data/mcqs.seed.js';
import { gradeMcqs } from '../services/mcqGrader.js';
import { evaluateSalesAnswers } from '../services/salesEvaluator.js';
import { calculateIeltsPteBand } from '../services/bandCalculator.js';
import { saveAssessmentResult } from '../services/resultStore.js';
import { ASSESSMENT_TIME_MINUTES, TOTAL_MARKS, PASSING_MARK } from '../config/assessment.js';
import { SUBMIT_ASSESSMENT_RATE_LIMIT } from '../config/rateLimit.js';
import { validateAssessmentSubmission } from '../validators/assessment.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const submitAssessmentLimiter = createRateLimiter(SUBMIT_ASSESSMENT_RATE_LIMIT);

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
router.post('/submit-assessment', submitAssessmentLimiter, async (req, res) => {
  try {
    const validationErrors = validateAssessmentSubmission(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors[0] });
    }

    const { candidate, mcq_answers, sales_answers } = req.body;

    const { mcq_score } = gradeMcqs(mcq_answers);
    const salesEval = await evaluateSalesAnswers(sales_answers);
    const sales_score = salesEval.sales_score;
    const total_score = Math.round((mcq_score + sales_score) * 2) / 2;
    const passed = total_score >= PASSING_MARK;
    const ielts_pte_equivalent_band = calculateIeltsPteBand(total_score);

    const payload = {
      candidate: {
        name: candidate.name.trim(),
        email: candidate.email.trim(),
        phone: candidate.phone.trim(),
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
    });
  } catch (err) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ error: 'Failed to process assessment.' });
  }
});

export default router;
