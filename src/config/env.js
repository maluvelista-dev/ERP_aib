import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';

const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;

  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: required('JWT_SECRET', nodeEnv === 'production' ? undefined : 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  sessionSecret: required('SESSION_SECRET', nodeEnv === 'production' ? undefined : 'dev-session-secret-change-me'),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
  databaseConnectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 10),
  catalogCacheTtlMs: Number(process.env.CATALOG_CACHE_TTL_MS ?? 60000),
  pdfConcurrency: Number(process.env.PDF_CONCURRENCY ?? 2),
  redisUrl: process.env.REDIS_URL || '',
  dataRetentionDays: Math.max(1, Number(process.env.DATA_RETENTION_DAYS ?? 1825)),
  allowedOrigins: String(process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  company: {
    name: process.env.COMPANY_NAME ?? 'COMMERCIAL COMPANY LLC',
    cnpj: process.env.COMPANY_CNPJ ?? '00.123.456/0001-00',
    phone: process.env.COMPANY_PHONE ?? '(11) 4004-0000',
    email: process.env.COMPANY_EMAIL ?? 'support@commercialcompany.com'
  }
};
