import { createClient } from 'redis';
import { env } from './env.js';

let client;
let connectionPromise;
let warned = false;
let retryAfter = 0;

export const getRedis = async () => {
  if (!env.redisUrl) return null;
  if (Date.now() < retryAfter) return null;
  if (client?.isReady) return client;

  if (!client) {
    client = createClient({ url: env.redisUrl, socket: { connectTimeout: 5000, reconnectStrategy: false } });
    client.on('error', (error) => {
      if (!warned) console.warn(`Redis indisponível; usando fallback local: ${error.message}`);
      warned = true;
    });
  }

  connectionPromise ??= client.connect().catch(() => {
    retryAfter = Date.now() + 30000;
    return null;
  }).finally(() => { connectionPromise = null; });
  await connectionPromise;
  return client.isReady ? client : null;
};

export const closeRedis = async () => {
  if (client?.isOpen) await client.quit().catch(() => client.destroy());
};
