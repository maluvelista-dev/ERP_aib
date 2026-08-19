import { AppError } from '../utils/AppError.js';
import { getRedis } from '../config/redis.js';

const buckets = new Map();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 10 * 60 * 1000);
cleanupTimer.unref();

export const rateLimit = ({ windowMs, max, message }) => async (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  let count;
  let resetAt;

  try {
    const redis = await getRedis();
    if (redis) {
      const redisKey = `rate-limit:${key}`;
      const result = await redis.eval(
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return {n,redis.call('PTTL',KEYS[1])}",
        { keys: [redisKey], arguments: [String(windowMs)] }
      );
      count = Number(result[0]);
      resetAt = now + Math.max(Number(result[1]), 0);
    }
  } catch {
    count = undefined;
  }

  if (count === undefined) {
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    count = bucket.count;
    resetAt = bucket.resetAt;
  }

  res.setHeader('RateLimit-Limit', String(max));
  res.setHeader('RateLimit-Remaining', String(Math.max(max - count, 0)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  if (count > max) {
    next(new AppError(message, 429));
    return;
  }

  next();
};

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.'
});

export const registrationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Muitos cadastros enviados. Aguarde uma hora e tente novamente.'
});
