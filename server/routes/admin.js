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
  PASSING_MARK,
} from '../services/resultStore.js';
import { cvUpload, deleteCvFile, getCvFilePath } from '../services/cvStorage.js';

const router = Router();

/** POST /api/admin/login */
router.post('/login', (req, res) => {
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
router.get('/results', requireAdmin, (_req, res) => {
  res.json({ results: getAllResults(), passingMark: PASSING_MARK });
});

/** GET /api/admin/results/:id */
router.get('/results/:id', requireAdmin, (req, res) => {
  const result = getResultById(req.params.id);
  if (!result) return res.status(404).json({ error: 'Result not found.' });
  res.json(result);
});

/** POST /api/admin/results/:id/cv — upload or replace candidate CV */
router.post('/results/:id/cv', requireAdmin, (req, res) => {
  const resultId = req.params.id;
  const candidateId = getCandidateIdByResultId(resultId);
  if (!candidateId) return res.status(404).json({ error: 'Result not found.' });

  cvUpload.single('cv')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'CV upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const existing = getCandidateCv(candidateId);
    if (existing?.cv_stored_name) {
      deleteCvFile(existing.cv_stored_name);
    }

    updateCandidateCv(candidateId, req.file.filename, req.file.originalname);

    res.json({
      cv_stored_name: req.file.filename,
      cv_original_name: req.file.originalname,
      message: 'CV uploaded successfully.',
    });
  });
});

/** GET /api/admin/results/:id/cv — download candidate CV */
router.get('/results/:id/cv', requireAdmin, (req, res) => {
  const candidateId = getCandidateIdByResultId(req.params.id);
  if (!candidateId) return res.status(404).json({ error: 'Result not found.' });

  const cv = getCandidateCv(candidateId);
  if (!cv?.cv_stored_name) {
    return res.status(404).json({ error: 'No CV uploaded for this candidate.' });
  }

  const filePath = getCvFilePath(cv.cv_stored_name);
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'CV file not found on server.' });
  }

  res.download(filePath, cv.cv_original_name || 'candidate-cv');
});

export default router;
