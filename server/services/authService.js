import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function validateAdminCredentials(username, password) {
  if (!username || !password) return false;
  return safeCompare(username, ADMIN_USERNAME) && safeCompare(password, ADMIN_PASSWORD);
}

export function signAdminToken(username) {
  return jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return null;
    return payload;
  } catch {
    return null;
  }
}
