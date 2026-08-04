import dotenv from 'dotenv';

dotenv.config();

const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;

  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  sessionSecret: required('SESSION_SECRET', 'dev-session-secret-change-me'),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION ?? 'v20.0'
  },
  company: {
    name: process.env.COMPANY_NAME ?? 'COMMERCIAL COMPANY LLC',
    cnpj: process.env.COMPANY_CNPJ ?? '00.123.456/0001-00',
    phone: process.env.COMPANY_PHONE ?? '(11) 4004-0000',
    email: process.env.COMPANY_EMAIL ?? 'support@commercialcompany.com'
  }
};
