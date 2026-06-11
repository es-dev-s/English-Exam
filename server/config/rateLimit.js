function readPositiveInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const SUBMIT_ASSESSMENT_RATE_LIMIT = {
  windowMs: readPositiveInt('RATE_LIMIT_SUBMIT_WINDOW_MS', 15 * 60 * 1000),
  max: readPositiveInt('RATE_LIMIT_SUBMIT_MAX', 10),
  message: 'Too many assessment submissions from this address. Please try again later.',
};

export const ADMIN_LOGIN_RATE_LIMIT = {
  windowMs: readPositiveInt('RATE_LIMIT_LOGIN_WINDOW_MS', 15 * 60 * 1000),
  max: readPositiveInt('RATE_LIMIT_LOGIN_MAX', 10),
  message: 'Too many login attempts. Please try again later.',
};
