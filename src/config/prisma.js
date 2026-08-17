import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

const databaseUrlValue = process.env.DATABASE_URL;

if (!databaseUrlValue) {
  throw new Error('DATABASE_URL is required');
}

if (!databaseUrlValue.startsWith('mysql://')) {
  throw new Error('DATABASE_URL must be a MySQL connection URL starting with mysql://');
}

let databaseUrl;

try {
  databaseUrl = new URL(databaseUrlValue);
} catch {
  throw new Error('DATABASE_URL is not a valid MySQL connection URL');
}
const sslMode = databaseUrl.searchParams.get('ssl')
  ?? databaseUrl.searchParams.get('sslmode')
  ?? databaseUrl.searchParams.get('sslaccept');
const sslEnabled = ['true', '1', 'require', 'required', 'verify-ca', 'verify-full']
  .concat(['strict', 'accept_invalid_certs'])
  .includes(sslMode?.toLowerCase());

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace('/', ''),
  ssl: sslEnabled,
  connectTimeout: 20000,
  connectionLimit: env.databaseConnectionLimit
});

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});
