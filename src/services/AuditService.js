import { randomUUID } from 'node:crypto';
import { prisma } from '../config/prisma.js';

class AuditService {
  async log({ actorId = null, action, entityType, entityId = null, metadata = null }) {
    return prisma.auditLog.create({
      data: {
        id: randomUUID(),
        actorId,
        action,
        entityType,
        entityId,
        metadata
      }
    });
  }
}

export default new AuditService();
