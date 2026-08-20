import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { env } from '../config/env.js';
import { getRedis } from '../config/redis.js';
import { AppError } from '../utils/AppError.js';

const localOrderLocks = new Map();
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const acquireSlotScript = `
local now=tonumber(ARGV[1])
local timeout=tonumber(ARGV[2])
redis.call('ZREMRANGEBYSCORE',KEYS[2],'-inf',now)
redis.call('ZREMRANGEBYSCORE',KEYS[1],'-inf',now-timeout)
local rank=redis.call('ZRANK',KEYS[1],ARGV[3])
if rank==0 and redis.call('ZCARD',KEYS[2])<tonumber(ARGV[4]) then
  redis.call('ZREM',KEYS[1],ARGV[3])
  redis.call('ZADD',KEYS[2],now+tonumber(ARGV[5]),ARGV[3])
  redis.call('PEXPIRE',KEYS[2],tonumber(ARGV[5]))
  return 1
end
return 0`;

const releaseLockScript = `
if redis.call('GET',KEYS[1])==ARGV[1] then
  return redis.call('DEL',KEYS[1])
end
return 0`;

class PdfCoordinationService {
  async run(orderId, metrics, task) {
    const redis = await getRedis();
    return redis
      ? this.#runShared(redis, orderId, metrics, task)
      : this.#runLocal(orderId, task);
  }

  async #runLocal(orderId, task) {
    if (localOrderLocks.has(orderId)) {
      throw new AppError('O PDF deste pedido já está sendo gerado', 409);
    }

    const timeout = setTimeout(() => localOrderLocks.delete(orderId), env.pdfLockTtlMs);
    timeout.unref();
    localOrderLocks.set(orderId, true);
    try {
      return await task();
    } finally {
      clearTimeout(timeout);
      localOrderLocks.delete(orderId);
    }
  }

  async #runShared(redis, orderId, metrics, task) {
    const token = randomUUID();
    const orderLockKey = `pdf:order-lock:${orderId}`;
    const waitingKey = 'pdf:queue:waiting';
    const activeKey = 'pdf:queue:active';
    const locked = await redis.set(orderLockKey, token, { NX: true, PX: env.pdfLockTtlMs });

    if (!locked) {
      throw new AppError('O PDF deste pedido já está sendo gerado', 409);
    }

    const queuedAt = performance.now();
    const queueTimestamp = Date.now();
    await redis.zAdd(waitingKey, [{ score: queueTimestamp, value: token }]);
    await redis.pExpire(waitingKey, env.pdfQueueTimeoutMs + 60000);

    let acquired = false;
    try {
      while (performance.now() - queuedAt < env.pdfQueueTimeoutMs) {
        acquired = Number(await redis.eval(acquireSlotScript, {
          keys: [waitingKey, activeKey],
          arguments: [
            String(Date.now()),
            String(env.pdfQueueTimeoutMs),
            token,
            String(env.pdfConcurrency),
            String(env.pdfLockTtlMs)
          ]
        })) === 1;
        if (acquired) break;
        await wait(150);
      }

      metrics.queue_wait_ms = (metrics.queue_wait_ms ?? 0) + performance.now() - queuedAt;
      if (!acquired) throw new AppError('A fila de PDFs está cheia. Tente novamente em alguns instantes', 503);
      return await task();
    } finally {
      await redis.zRem(waitingKey, token).catch(() => {});
      if (acquired) await redis.zRem(activeKey, token).catch(() => {});
      await redis.eval(releaseLockScript, {
        keys: [orderLockKey],
        arguments: [token]
      }).catch(() => {});
    }
  }
}

export default new PdfCoordinationService();
