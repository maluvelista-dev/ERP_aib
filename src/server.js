import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { closeRedis } from './config/redis.js';

const server = app.listen(env.port, () => {
  console.log(`OrdersWeb API running on port ${env.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Set another PORT value or stop the running process.`);
    process.exit(1);
  }

  throw error;
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;
server.requestTimeout = 120000;

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received. Finishing active requests...`);

  const forceExit = setTimeout(() => process.exit(1), 15000);
  forceExit.unref();

  server.close(async () => {
    clearTimeout(forceExit);
    await Promise.all([prisma.$disconnect(), closeRedis()]);
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
