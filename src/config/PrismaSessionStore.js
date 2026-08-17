import session from 'express-session';
import { prisma } from './prisma.js';
import { TtlCache } from '../utils/TtlCache.js';

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 8;
const sessionCache = new TtlCache({ ttlMs: 30000, maxEntries: 1000 });

const serialize = (sessionData) => JSON.parse(JSON.stringify(sessionData));

const expiresAtFor = (sessionData) => {
  const expires = sessionData?.cookie?.expires;

  if (expires) {
    const parsed = new Date(expires);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const maxAge = Number(sessionData?.cookie?.maxAge ?? DEFAULT_TTL_MS);
  return new Date(Date.now() + maxAge);
};

export class PrismaSessionStore extends session.Store {
  #writesSinceCleanup = 0;
  #lastTouched = new Map();

  get(sessionId, callback) {
    const cachedSession = sessionCache.get(sessionId);
    if (cachedSession) {
      callback(null, serialize(cachedSession));
      return;
    }

    prisma.webSession.findUnique({ where: { id: sessionId } })
      .then(async (record) => {
        if (!record) return callback(null, null);

        if (record.expiresAt <= new Date()) {
          await prisma.webSession.deleteMany({ where: { id: sessionId } });
          return callback(null, null);
        }

        sessionCache.set(sessionId, serialize(record.data));
        return callback(null, serialize(record.data));
      })
      .catch(callback);
  }

  set(sessionId, sessionData, callback = () => {}) {
    const data = serialize(sessionData);
    const expiresAt = expiresAtFor(sessionData);

    prisma.webSession.upsert({
      where: { id: sessionId },
      update: { data, expiresAt },
      create: { id: sessionId, data, expiresAt }
    })
      .then(() => {
        sessionCache.set(sessionId, data);
        this.#lastTouched.set(sessionId, Date.now());
      })
      .then(() => this.#cleanupExpiredSessions())
      .then(() => callback(null))
      .catch(callback);
  }

  destroy(sessionId, callback = () => {}) {
    this.#lastTouched.delete(sessionId);
    sessionCache.delete(sessionId);
    prisma.webSession.deleteMany({ where: { id: sessionId } })
      .then(() => callback(null))
      .catch(callback);
  }

  touch(sessionId, sessionData, callback = () => {}) {
    const now = Date.now();
    const lastTouched = this.#lastTouched.get(sessionId) ?? 0;
    sessionCache.set(sessionId, serialize(sessionData));

    if (now - lastTouched < 5 * 60 * 1000) {
      callback(null);
      return;
    }

    this.#lastTouched.set(sessionId, now);
    prisma.webSession.updateMany({
      where: { id: sessionId },
      data: {
        data: serialize(sessionData),
        expiresAt: expiresAtFor(sessionData)
      }
    })
      .then(() => callback(null))
      .catch(callback);
  }

  async #cleanupExpiredSessions() {
    this.#writesSinceCleanup += 1;
    if (this.#writesSinceCleanup < 100) return;

    this.#writesSinceCleanup = 0;
    await prisma.webSession.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    });
  }
}
