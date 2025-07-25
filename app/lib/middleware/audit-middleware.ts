
import { PrismaClient } from '@prisma/client';
import { logCrudOperation, AuditContext } from '../services/audit-service';
import { NextRequest } from 'next/server';

// Extended Prisma client with audit middleware
export function createAuditablePrisma(): PrismaClient {
  const prisma = new PrismaClient();

  // Middleware to automatically log CRUD operations
  prisma.$use(async (params, next) => {
    const start = Date.now();
    
    try {
      // Get audit context from current request (if available)
      const context = getCurrentAuditContext();
      
      // Handle different operations
      switch (params.action) {
        case 'create':
          return await handleCreate(params, next, context);
        case 'update':
        case 'upsert':
          return await handleUpdate(params, next, context);
        case 'delete':
        case 'deleteMany':
          return await handleDelete(params, next, context);
        default:
          return await next(params);
      }
    } catch (error) {
      console.error('Audit middleware error:', error);
      // Continue with original operation even if audit fails
      return await next(params);
    }
  });

  return prisma;
}

/**
 * Handle CREATE operations
 */
async function handleCreate(params: any, next: any, context?: AuditContext) {
  const result = await next(params);
  
  if (shouldAudit(params.model)) {
    // TODO: Fix audit logging function signature
    // await logCrudOperation(
    //   'CREATE',
    //   params.model,
    //   result?.id || 'unknown',
    //   undefined, // No old data for create
    //   sanitizeData(result)
    // );
  }
  
  return result;
}

/**
 * Handle UPDATE operations
 */
async function handleUpdate(params: any, next: any, context?: AuditContext) {
  // Get old data before update
  let oldData: any = null;
  
  if (shouldAudit(params.model) && params.args?.where) {
    try {
      const prisma = new PrismaClient();
      oldData = await (prisma as any)[params.model.toLowerCase()].findUnique({
        where: params.args.where,
      });
    } catch (error) {
      console.warn('Failed to get old data for audit:', error);
    }
  }
  
  const result = await next(params);
  
  if (shouldAudit(params.model)) {
    // TODO: Fix audit logging function signature
    // await logCrudOperation(
    //   'UPDATE',
    //   params.model,
    //   getEntityId(params.args?.where) || result?.id || 'unknown',
    //   sanitizeData(oldData),
    //   sanitizeData(params.args?.data)
    // );
  }
  
  return result;
}

/**
 * Handle DELETE operations
 */
async function handleDelete(params: any, next: any, context?: AuditContext) {
  // Get data before deletion
  let deletedData: any = null;
  
  if (shouldAudit(params.model) && params.args?.where) {
    try {
      const prisma = new PrismaClient();
      if (params.action === 'delete') {
        deletedData = await (prisma as any)[params.model.toLowerCase()].findUnique({
          where: params.args.where,
        });
      } else {
        // For deleteMany, get all records that will be deleted
        deletedData = await (prisma as any)[params.model.toLowerCase()].findMany({
          where: params.args.where,
        });
      }
    } catch (error) {
      console.warn('Failed to get data before deletion:', error);
    }
  }
  
  const result = await next(params);
  
  if (shouldAudit(params.model)) {
    const entityId = getEntityId(params.args?.where) || 'unknown';
    // TODO: Fix audit logging function signature
    // await logCrudOperation(
    //   'DELETE',
    //   params.model,
    //   entityId,
    //   sanitizeData(deletedData),
    //   undefined // No new data for delete
    // );
  }
  
  return result;
}

/**
 * Determine if model should be audited
 */
function shouldAudit(model: string): boolean {
  const auditableModels = [
    'User',
    'UserProfile', 
    'Client',
    'Invoice',
    'Creditor',
    'Payment',
    'Document',
    'BTWRecord',
    'TaxReservation'
  ];
  
  return auditableModels.includes(model);
}

/**
 * Extract entity ID from where clause
 */
function getEntityId(where: any): string | null {
  if (!where) return null;
  
  // Try common ID fields
  if (where.id) return where.id;
  if (where.userId) return where.userId;
  if (where.clientId) return where.clientId;
  if (where.invoiceId) return where.invoiceId;
  
  // Return first string value found
  for (const [key, value] of Object.entries(where)) {
    if (typeof value === 'string') {
      return value;
    }
  }
  
  return null;
}

/**
 * Sanitize data for audit logging (remove sensitive fields)
 */
function sanitizeData(data: any): any {
  if (!data) return null;
  
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'privateKey',
    'creditCard',
    'ssn'
  ];
  
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Remove functions and other non-serializable data
  return JSON.parse(JSON.stringify(sanitized));
}

// Global audit context storage (for request-scoped context)
let currentAuditContext: AuditContext | undefined;

/**
 * Set audit context for current request
 */
export function setAuditContext(context: AuditContext): void {
  currentAuditContext = context;
}

/**
 * Get current audit context
 */
function getCurrentAuditContext(): AuditContext | undefined {
  return currentAuditContext;
}

/**
 * Clear audit context
 */
export function clearAuditContext(): void {
  currentAuditContext = undefined;
}

/**
 * Extract audit context from Next.js request
 */
export function extractAuditContext(req: NextRequest): AuditContext {
  return {
    ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    sessionId: req.cookies.get('next-auth.session-token')?.value || 'anonymous',
  };
}

/**
 * Audit wrapper for API routes
 */
export function withAudit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: AuditContext
) {
  return async (...args: T): Promise<R> => {
    if (context) {
      setAuditContext(context);
    }
    
    try {
      const result = await fn(...args);
      return result;
    } finally {
      clearAuditContext();
    }
  };
}

/**
 * High-level audit decorators for common operations
 */
export const auditDecorators = {
  /**
   * Audit user authentication
   */
  auditAuth: (action: 'LOGIN' | 'LOGOUT') => {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function(...args: any[]) {
        const result = await originalMethod.apply(this, args);
        
        // Extract user ID from result or args
        const userId = result?.user?.id || args[0]?.userId;
        if (userId) {
          const { logAuthEvent } = await import('../services/audit-service');
          await logAuthEvent(action, userId, getCurrentAuditContext());
        }
        
        return result;
      };
      
      return descriptor;
    };
  },

  /**
   * Audit validation operations
   */
  auditValidation: (action: 'VALIDATE' | 'REJECT' | 'APPROVE') => {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      
      descriptor.value = async function(...args: any[]) {
        const result = await originalMethod.apply(this, args);
        
        // Extract validation details
        const entityType = args[0]?.entityType || 'Unknown';
        const entityId = args[0]?.entityId || 'unknown';
        const validationData = result || args[0];
        
        const { logValidationEvent } = await import('../services/audit-service');
        await logValidationEvent(
          action,
          entityType,
          entityId,
          validationData,
          getCurrentAuditContext()
        );
        
        return result;
      };
      
      return descriptor;
    };
  }
};

// Export singleton auditable Prisma instance
export const auditablePrisma = createAuditablePrisma();
