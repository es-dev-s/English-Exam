const INSECURE_JWT_SECRET = 'dev-only-change-in-production';

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = [];
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.ADMIN_USERNAME) missing.push('ADMIN_USERNAME');
  if (!process.env.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');

  if (missing.length > 0) {
    console.error(`Missing required environment variables in production: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.JWT_SECRET === INSECURE_JWT_SECRET) {
    console.error('JWT_SECRET must not use the default development value in production.');
    process.exit(1);
  }
}
