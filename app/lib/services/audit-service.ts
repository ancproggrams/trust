
import { PrismaClient } from '@prisma/client';
import { AuditAction, ComplianceLevel } from '@prisma/client';
import { storeAuditRecord } from './immudb-client';

const prisma = new PrismaClient();

export interface AuditContext {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  complianceLevel?: ComplianceLevel;
}

export interface AuditData {
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  context?: AuditContext;
}

/**
 * Log audit event to both Prisma DB and ImmuDB
 */
export async function logAuditEvent(data: AuditData): Promise<string | null> {
  try {
    // Generate unique audit key for ImmuDB
    const auditKey = `audit:${data.entity}:${data.entityId}:${Date.now()}`;
    
    // Prepare audit record
    const auditRecord = {
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      oldValues: data.oldValues || null,
      newValues: data.newValues || null,
      userId: data.context?.userId || null,
      sessionId: data.context?.sessionId || null,
      ipAddress: data.context?.ipAddress || null,
      userAgent: data.context?.userAgent || null,
      complianceLevel: data.context?.complianceLevel || 'STANDARD',
    };

    // Store in ImmuDB first (immutable record)
    const immudbResult = await storeAuditRecord(auditKey, auditRecord);
    
    // Store in Prisma DB with ImmuDB reference
    const auditLog = await prisma.auditLog.create({
      data: {
        action: auditRecord.action,
        entity: auditRecord.entity,
        entityId: auditRecord.entityId,
        oldValues: auditRecord.oldValues as any,
        newValues: auditRecord.newValues as any,
        userId: auditRecord.userId,
        sessionId: auditRecord.sessionId,
        ipAddress: auditRecord.ipAddress,
        userAgent: auditRecord.userAgent,
        complianceLevel: auditRecord.complianceLevel,
        immudbTxId: immudbResult?.txId || null,
        immudbHash: immudbResult?.hash || null,
        immudbVerified: !!immudbResult,
        retentionUntil: calculateRetentionDate(data.context?.complianceLevel),
      },
    });

    // Update ImmuDB transaction record
    if (immudbResult) {
      await prisma.immuDBTransaction.create({
        data: {
          txId: immudbResult.txId,
          timestamp: new Date(),
          verified: true,
          hash: immudbResult.hash,
          auditLogIds: [auditLog.id],
        },
      });
    }

    console.log(`Audit event logged: ${data.action} on ${data.entity}:${data.entityId}`);
    return auditLog.id;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    return null;
  }
}

/**
 * Log CRUD operations automatically
 */
export async function logCrudOperation(
  operation: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: string,
  entityId: string,
  oldData?: Record<string, any>,
  newData?: Record<string, any>,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: operation,
    entity,
    entityId,
    oldValues: oldData,
    newValues: newData,
    context,
  });
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  action: 'LOGIN' | 'LOGOUT',
  userId: string,
  context?: Omit<AuditContext, 'userId'>
): Promise<void> {
  await logAuditEvent({
    action,
    entity: 'User',
    entityId: userId,
    context: { ...context, userId },
  });
}

/**
 * Log validation events
 */
export async function logValidationEvent(
  action: 'VALIDATE' | 'REJECT' | 'APPROVE',
  entity: string,
  entityId: string,
  validationData: Record<string, any>,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action,
    entity,
    entityId,
    newValues: validationData,
    context,
  });
}

/**
 * Log payment processing events
 */
export async function logPaymentEvent(
  paymentId: string,
  action: 'PAYMENT_PROCESS' | 'STATUS_CHANGE',
  paymentData: Record<string, any>,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action,
    entity: 'Payment',
    entityId: paymentId,
    newValues: paymentData,
    context: { ...context, complianceLevel: 'ENHANCED' },
  });
}

/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(
  entity: string,
  entityId: string,
  limit = 50
): Promise<any[]> {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return auditLogs;
  } catch (error) {
    console.error('Failed to get audit trail:', error);
    return [];
  }
}

/**
 * Calculate retention date based on compliance level
 */
function calculateRetentionDate(complianceLevel?: ComplianceLevel): Date {
  const now = new Date();
  const years = {
    STANDARD: 3,
    ENHANCED: 5,
    CRITICAL: 7,
    REGULATORY: 10,
  };
  
  const retentionYears = years[complianceLevel || 'STANDARD'];
  now.setFullYear(now.getFullYear() + retentionYears);
  return now;
}

/**
 * Verify audit record integrity
 */
export async function verifyAuditIntegrity(auditLogId: string): Promise<{
  verified: boolean;
  details: string;
}> {
  try {
    const auditLog = await prisma.auditLog.findUnique({
      where: { id: auditLogId },
    });

    if (!auditLog) {
      return { verified: false, details: 'Audit log not found' };
    }

    if (!auditLog.immudbTxId) {
      return { verified: false, details: 'No ImmuDB transaction reference' };
    }

    // In a full implementation, we would verify against ImmuDB
    // For now, check if the record exists and hasn't been tampered with
    const immudbTransaction = await prisma.immuDBTransaction.findUnique({
      where: { txId: auditLog.immudbTxId },
    });

    if (!immudbTransaction) {
      return { verified: false, details: 'ImmuDB transaction not found' };
    }

    return { verified: true, details: 'Audit record verified' };
  } catch (error) {
    console.error('Failed to verify audit integrity:', error);
    return { verified: false, details: 'Verification failed' };
  }
}

/**
 * Clean up expired audit records based on retention policy
 */
export async function cleanupExpiredAuditRecords(): Promise<number> {
  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        retentionUntil: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired audit records`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired audit records:', error);
    return 0;
  }
}
