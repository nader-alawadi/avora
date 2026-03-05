import { prisma } from "./prisma";

export async function createAuditLog(
  userId: string | null,
  action: string,
  entity?: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
    },
  });
}
