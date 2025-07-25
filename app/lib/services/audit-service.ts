
import { PrismaClient } from '@prisma/client';
import { AuditAction } from '@/lib/types';

const prisma = new PrismaClient();

interface AuditLogData {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  context?: string;
}

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public async logAction(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          oldValues: data.oldValues || {},
          newValues: data.newValues || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          sessionId: data.sessionId,
        },
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  public async getAuditLogs(filters: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: AuditAction;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50, ...where } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    
    if (where.userId) whereClause.userId = where.userId;
    if (where.entity) whereClause.entity = where.entity;
    if (where.entityId) whereClause.entityId = where.entityId;
    if (where.action) whereClause.action = where.action;
    
    if (where.dateFrom || where.dateTo) {
      whereClause.createdAt = {};
      if (where.dateFrom) whereClause.createdAt.gte = where.dateFrom;
      if (where.dateTo) whereClause.createdAt.lte = where.dateTo;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = AuditService.getInstance();

// Backward compatibility exports
export const getAuditTrail = (filters: any) => auditService.getAuditLogs(filters);
export const logAuditEvent = (data: any) => auditService.logAction(data);
export const logAuthEvent = (action: string, userId: string, context: any) => auditService.logAction({
  userId,
  action: action as any,
  entity: 'User',
  entityId: userId,
  context: JSON.stringify(context),
});
export const logValidationEvent = (action: string, entityType: string, entityId: string, data: any, context: any) => auditService.logAction({
  action: action as any,
  entity: entityType,
  entityId,
  newValues: data,
  context: JSON.stringify(context),
});

export interface AuditContext {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export const logCrudOperation = (operation: string, entity: string, entityId: string, data: any, context: AuditContext) => auditService.logAction({
  userId: context.userId,
  action: operation as any,
  entity,
  entityId,
  newValues: data,
  ipAddress: context.ipAddress,
  userAgent: context.userAgent,
  sessionId: context.sessionId,
});
