import { AppError } from '../utils/AppError.js';

const buckets = new Map();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 10 * 60 * 1000);
cleanupTimer.unref();

export const rateLimit = ({ windowMs, max, message }) => (req, res, next) => {
  const key = `${req.ip}:${req.path}`;
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  res.setHeader('RateLimit-Limit', String(max));
  res.setHeader('RateLimit-Remaining', String(Math.max(max - bucket.count, 0)));
  res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > max) {
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
