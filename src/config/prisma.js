import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

const databaseUrl = new URL(process.env.DATABASE_URL);
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
  connectionLimit: 5
});

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});
