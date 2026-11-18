import { Router } from 'express';
import { existsSync } from 'fs';
import { validateAdminCredentials, signAdminToken } from '../services/authService.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getAllResults,
  getResultById,
  getCandidateIdByResultId,
  updateCandidateCv,
  getCandidateCv,
} from '../services/resultStore.js';
import { PASSING_MARK } from '../config/assessment.js';
import { ADMIN_LOGIN_RATE_LIMIT } from '../config/rateLimit.js';
import { gradeMcqs, buildMcqReport } from '../services/mcqGrader.js';
import { gradeListening, buildListeningReport } from '../services/listeningGrader.js';
import { LISTENING_BANK } from '../data/listening.bank.js';
import { cvUpload, deleteCvFile, getCvFilePath } from '../services/cvStorage.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

const router = Router();
const adminLoginLimiter = createRateLimiter(ADMIN_LOGIN_RATE_LIMIT);

/** POST /api/admin/login */
router.post('/login', adminLoginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!validateAdminCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = signAdminToken(username);
  res.json({ token, username });
});

/** GET /api/admin/me — verify session */
router.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});

/** GET /api/admin/results */
router.get('/results', requireAdmin, async (_req, res) => {
  try {
    res.json({ results: await getAllResults(), passingMark: PASSING_MARK });
  } catch (err) {
    console.error('List results error:', err);
    res.status(500).json({ error: 'Failed to load results.' });
  }
});

/** GET /api/admin/results/:id */
router.get('/results/:id', requireAdmin, async (req, res) => {
  try {
    const result = await getResultById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Result not found.' });

    const assignment = result.session_assignment || {};
    const { breakdown } = gradeMcqs(result.mcq_answers, assignment.mcqIds || null);
    const listeningId = assignment.listeningId || 1;
    const { breakdown: listeningBreakdown } = gradeListening(result.listening_answers || {}, listeningId);
    const dialogue = LISTENING_BANK.find((d) => d.id === listeningId);

    res.json({
      ...result,
      mcq_report: buildMcqReport(breakdown),
      listening_report: buildListeningReport(listeningBreakdown, listeningId),
      listening_dialogue: dialogue
        ? {
            id: dialogue.id,
            title: dialogue.title,
            scenario: dialogue.scenario,
            speakers: dialogue.speakers,
          }
        : null,
    });
  } catch (err) {
    console.error('Get result error:', err);
    res.status(500).json({ error: 'Failed to load result.' });
  }
});

/** POST /api/admin/results/:id/cv — upload or replace candidate CV */
router.post('/results/:id/cv', requireAdmin, async (req, res) => {
  try {
    const resultId = req.params.id;
    const candidateId = await getCandidateIdByResultId(resultId);
    if (!candidateId) return res.status(404).json({ error: 'Result not found.' });

    cvUpload.single('cv')(req, res, async (err) => {
      try {
        if (err) {
          return res.status(400).json({ error: err.message || 'CV upload failed.' });
        }
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded.' });
        }

        const existing = await getCandidateCv(candidateId);
        if (existing?.cv_stored_name) {
          deleteCvFile(existing.cv_stored_name);
        }

        await updateCandidateCv(candidateId, req.file.filename, req.file.originalname);

        res.json({
          cv_stored_name: req.file.filename,
          cv_original_name: req.file.originalname,
          message: 'CV uploaded successfully.',
        });
      } catch (uploadErr) {
        console.error('CV upload error:', uploadErr);
        res.status(500).json({ error: 'Failed to save CV.' });
      }
    });
  } catch (err) {
    console.error('CV upload error:', err);
    res.status(500).json({ error: 'Failed to upload CV.' });
  }
});

/** GET /api/admin/results/:id/cv — download candidate CV */
router.get('/results/:id/cv', requireAdmin, async (req, res) => {
  try {
    const candidateId = await getCandidateIdByResultId(req.params.id);
    if (!candidateId) return res.status(404).json({ error: 'Result not found.' });

    const cv = await getCandidateCv(candidateId);
    if (!cv?.cv_stored_name) {
      return res.status(404).json({ error: 'No CV uploaded for this candidate.' });
    }

    const filePath = getCvFilePath(cv.cv_stored_name);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'CV file not found on server.' });
    }

    res.download(filePath, cv.cv_original_name || 'candidate-cv');
  } catch (err) {
    console.error('CV download error:', err);
    res.status(500).json({ error: 'Failed to download CV.' });
  }
});

export default router;
