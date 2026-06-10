import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const CV_UPLOAD_DIR = process.env.CV_UPLOAD_DIR || join(__dirname, '../uploads/cvs');

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

if (!existsSync(CV_UPLOAD_DIR)) {
  mkdirSync(CV_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CV_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed.'));
    return;
  }
  cb(null, true);
}

export const cvUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export function deleteCvFile(storedName) {
  if (!storedName) return;
  const filePath = join(CV_UPLOAD_DIR, storedName);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }
}

export function getCvFilePath(storedName) {
  return join(CV_UPLOAD_DIR, storedName);
}
