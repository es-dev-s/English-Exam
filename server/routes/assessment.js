import { Router } from 'express';
import { gradeMcqs } from '../services/mcqGrader.js';
import { gradeListening } from '../services/listeningGrader.js';
import { gradeTyping } from '../services/typingGrader.js';
import { evaluateSalesAnswers } from '../services/salesEvaluator.js';
import { calculateIeltsPteBand } from '../services/bandCalculator.js';
import { saveAssessmentResult } from '../services/resultStore.js';
import {
  createAssessmentSession,
  getAssessmentSession,
  consumeAssessmentSession,
  buildPublicPaper,
} from '../services/assessmentSession.js';
import { TYPING_PASSAGES } from '../shared/typingPassages.js';
import { SALES_QUESTION_BANK } from '../shared/salesQuestions.js';
import {
  ASSESSMENT_TIME_MINUTES,
  TOTAL_MARKS,
  PASSING_MARK,
  MCQ_MARKS,
  LISTENING_MARKS,
  SALES_MARKS,
  TYPING_MARKS,
} from '../config/assessment.js';
import { SUBMIT_ASSESSMENT_RATE_LIMIT } from '../config/rateLimit.js';
import { validateAssessmentSubmission } from '../validators/assessment.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const submitAssessmentLimiter = createRateLimiter(SUBMIT_ASSESSMENT_RATE_LIMIT);

/** GET /api/questions — unique randomized paper per candidate */
router.get('/questions', async (_req, res) => {
  try {
    const { sessionId, assignment } = await createAssessmentSession();
    const paper = buildPublicPaper(assignment);

    res.json({
      sessionId,
      ...paper,
      sections: {
        mcq: { marks: MCQ_MARKS, count: paper.questions.length },
        listening: { marks: LISTENING_MARKS, count: paper.listening.questions.length },
        writing: { marks: SALES_MARKS, count: paper.writingQuestions.length },
        typing: { marks: TYPING_MARKS },
      },
      totalMarks: TOTAL_MARKS,
      passingMark: PASSING_MARK,
      timeLimitMinutes: ASSESSMENT_TIME_MINUTES,
    });
  } catch (err) {
    console.error('Create assessment session error:', err);
    res.status(500).json({ error: 'Failed to create assessment session.' });
  }
});

/** POST /api/submit-assessment */
router.post('/submit-assessment', submitAssessmentLimiter, async (req, res) => {
  try {
    const validationErrors = validateAssessmentSubmission(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors[0] });
    }

    const {
      candidate,
      session_id: sessionId,
      mcq_answers,
      listening_answers,
      sales_answers,
      typing,
    } = req.body;

    const session = await getAssessmentSession(sessionId);
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired assessment session. Please restart the test.' });
    }
    if (session.consumed) {
      return res.status(400).json({ error: 'This assessment session was already submitted.' });
    }

    const { mcqIds, listeningId, writingIds, typingPassageId } = session.assignment;
    const writingQuestions = writingIds.map((id, index) => {
      const q = SALES_QUESTION_BANK.find((item) => item.id === id);
      return { ...q, slot: `q${index + 1}` };
    });
    const typingPassage = TYPING_PASSAGES.find((p) => p.id === typingPassageId);

    const { mcq_score } = gradeMcqs(mcq_answers, mcqIds);
    const { listening_score } = gradeListening(listening_answers || {}, listeningId);
    const salesEval = await evaluateSalesAnswers(sales_answers || {}, writingQuestions);
    const sales_score = salesEval.sales_score;
    const typingEval = gradeTyping({
      typedText: typing?.typed_text || '',
      sourceText: typingPassage?.text || '',
      elapsedSeconds: typing?.elapsed_seconds || 0,
    });
    const typing_score = typingEval.typing_score;

    const total_score = Math.round(
      (mcq_score + listening_score + sales_score + typing_score) * 2
    ) / 2;
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
      listening_score,
      sales_score,
      typing_score,
      total_score,
      passed,
      ielts_pte_equivalent_band,
      sales_feedback: salesEval.sales_feedback,
    };

    const { resultId } = await saveAssessmentResult({
      ...payload,
      mcq_answers,
      listening_answers: listening_answers || {},
      sales_answers: sales_answers || {},
      sales_question_scores: salesEval.question_scores,
      typing_result: typingEval,
      session_assignment: session.assignment,
    });

    await consumeAssessmentSession(sessionId);

    res.json({
      message: 'Assessment submitted successfully.',
      result_id: resultId,
      candidate: { name: payload.candidate.name },
    });
  } catch (err) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ error: 'Failed to process assessment.' });
  }
});

export default router;
