
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { UserRoleType, Permission, PermissionCheck } from '@/lib/types';

const prisma = new PrismaClient();

// Define all available permissions
export const PERMISSIONS = {
  // Client management
  CLIENT_CREATE: 'client:create',
  CLIENT_READ: 'client:read',
  CLIENT_UPDATE: 'client:update',
  CLIENT_DELETE: 'client:delete',
  CLIENT_APPROVE: 'client:approve',
  CLIENT_REJECT: 'client:reject',
  
  // Invoice management
  INVOICE_CREATE: 'invoice:create',
  INVOICE_READ: 'invoice:read',
  INVOICE_UPDATE: 'invoice:update',
  INVOICE_DELETE: 'invoice:delete',
  INVOICE_SEND: 'invoice:send',
  
  // Admin functions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_APPROVALS: 'admin:approvals',
  ADMIN_AUDIT: 'admin:audit',
  ADMIN_SETTINGS: 'admin:settings',
  
  // Creditor management
  CREDITOR_CREATE: 'creditor:create',
  CREDITOR_READ: 'creditor:read',
  CREDITOR_UPDATE: 'creditor:update',
  CREDITOR_DELETE: 'creditor:delete',
  CREDITOR_VALIDATE: 'creditor:validate',
  
  // Document management
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  
  // Appointment management
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_READ: 'appointment:read',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_DELETE: 'appointment:delete',
} as const;

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRoleType, string[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_APPROVE,
    PERMISSIONS.CLIENT_REJECT,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_APPROVALS,
    PERMISSIONS.ADMIN_AUDIT,
    PERMISSIONS.CREDITOR_READ,
    PERMISSIONS.CREDITOR_VALIDATE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
  ],
  MANAGER: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_SEND,
    PERMISSIONS.CREDITOR_CREATE,
    PERMISSIONS.CREDITOR_READ,
    PERMISSIONS.CREDITOR_UPDATE,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
  ],
  ACCOUNTANT: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.CREDITOR_CREATE,
    PERMISSIONS.CREDITOR_READ,
    PERMISSIONS.CREDITOR_UPDATE,
    PERMISSIONS.CREDITOR_VALIDATE,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_UPDATE,
  ],
  USER: [
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_SEND,
    PERMISSIONS.CREDITOR_CREATE,
    PERMISSIONS.CREDITOR_READ,
    PERMISSIONS.CREDITOR_UPDATE,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
  ],
  CLIENT_VIEWER: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
  ],
  INVOICE_MANAGER: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_SEND,
    PERMISSIONS.DOCUMENT_CREATE,
    PERMISSIONS.DOCUMENT_READ,
  ],
  CREDITOR_MANAGER: [
    PERMISSIONS.CREDITOR_CREATE,
    PERMISSIONS.CREDITOR_READ,
    PERMISSIONS.CREDITOR_UPDATE,
    PERMISSIONS.CREDITOR_VALIDATE,
    PERMISSIONS.DOCUMENT_READ,
  ],
  READ_ONLY: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.CREDITOR_READ,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
  ],
};

export class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Check if user has permission for a specific action
   */
  public async checkPermission(
    userId: string,
    permission: string,
    resourceId?: string
  ): Promise<PermissionCheck> {
    try {
      // Get user roles
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      if (userRoles.length === 0) {
        return {
          hasPermission: false,
          reason: 'No active roles found',
          requiredPermissions: [permission]
        };
      }

      // Check if any role has the required permission
      for (const userRole of userRoles) {
        const rolePermissions = ROLE_PERMISSIONS[userRole.role] || [];
        const customPermissions = userRole.permissions || [];
        const allPermissions = [...rolePermissions, ...customPermissions];

        if (allPermissions.includes(permission)) {
          // Check scope if specified
          if (userRole.scopeType && userRole.scopeId && resourceId) {
            if (userRole.scopeId !== resourceId) {
              continue; // This role doesn't have permission for this specific resource
            }
          }
          
          return { hasPermission: true };
        }
      }

      return {
        hasPermission: false,
        reason: 'Insufficient permissions',
        requiredPermissions: [permission],
        requiredRole: this.getMinimumRoleForPermission(permission)
      };

    } catch (error) {
      console.error('Permission check error:', error);
      return {
        hasPermission: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * Check multiple permissions at once
   */
  public async checkPermissions(
    userId: string,
    permissions: string[],
    resourceId?: string
  ): Promise<PermissionCheck> {
    try {
      const checks = await Promise.all(
        permissions.map(permission => this.checkPermission(userId, permission, resourceId))
      );

      const hasAllPermissions = checks.every(check => check.hasPermission);
      
      if (hasAllPermissions) {
        return { hasPermission: true };
      }

      const missingPermissions = permissions.filter((_, index) => !checks[index].hasPermission);
      
      return {
        hasPermission: false,
        reason: 'Missing required permissions',
        requiredPermissions: missingPermissions
      };

    } catch (error) {
      console.error('Multiple permissions check error:', error);
      return {
        hasPermission: false,
        reason: 'Permission check failed'
      };
    }
  }

  /**
   * Get minimum role required for a permission
   */
  private getMinimumRoleForPermission(permission: string): UserRoleType | undefined {
    const roleHierarchy: UserRoleType[] = [
      'READ_ONLY',
      'CLIENT_VIEWER',
      'CREDITOR_MANAGER',
      'INVOICE_MANAGER',
      'USER',
      'ACCOUNTANT',
      'MANAGER',
      'ADMIN',
      'SUPER_ADMIN'
    ];

    for (const role of roleHierarchy) {
      if (ROLE_PERMISSIONS[role].includes(permission)) {
        return role;
      }
    }

    return undefined;
  }

  /**
   * Assign role to user
   */
  public async assignRole(
    userId: string,
    role: UserRoleType,
    assignedBy: string,
    expiresAt?: Date,
    scopeType?: string,
    scopeId?: string
  ): Promise<void> {
    await prisma.userRole.create({
      data: {
        userId,
        role,
        permissions: ROLE_PERMISSIONS[role],
        assignedBy,
        expiresAt,
        scopeType,
        scopeId,
        isActive: true,
      }
    });
  }

  /**
   * Revoke role from user
   */
  public async revokeRole(userId: string, roleId: string): Promise<void> {
    await prisma.userRole.update({
      where: { id: roleId },
      data: { isActive: false }
    });
  }

  /**
   * Get all permissions for a user
   */
  public async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    const allPermissions = new Set<string>();

    for (const userRole of userRoles) {
      const rolePermissions = ROLE_PERMISSIONS[userRole.role] || [];
      const customPermissions = userRole.permissions || [];
      
      [...rolePermissions, ...customPermissions].forEach(permission => {
        allPermissions.add(permission);
      });
    }

    return Array.from(allPermissions);
  }
}

export const permissionService = PermissionService.getInstance();

/**
 * Middleware function to check permissions in API routes
 */
export async function requirePermissions(
  request: NextRequest,
  permissions: string[],
  resourceId?: string
): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { 
        authorized: false, 
        error: 'Authentication required' 
      };
    }

    const permissionCheck = await permissionService.checkPermissions(
      session.user.id,
      permissions,
      resourceId
    );

    if (!permissionCheck.hasPermission) {
      return {
        authorized: false,
        error: `Access denied: ${permissionCheck.reason}`,
        userId: session.user.id
      };
    }

    return {
      authorized: true,
      userId: session.user.id
    };

  } catch (error) {
    console.error('Permission middleware error:', error);
    return {
      authorized: false,
      error: 'Authorization check failed'
    };
  }
}

/**
 * Security guard for client invoice permissions
 */
export async function checkClientInvoicePermission(
  userId: string,
  clientId: string
): Promise<PermissionCheck> {
  try {
    // First check if user has invoice creation permission
    const invoicePermission = await permissionService.checkPermission(
      userId,
      PERMISSIONS.INVOICE_CREATE,
      clientId
    );

    if (!invoicePermission.hasPermission) {
      return invoicePermission;
    }

    // Then check if the client is approved and can have invoices created
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        canCreateInvoices: true,
        approvalStatus: true,
        onboardingStatus: true,
        isActive: true,
      }
    });

    if (!client) {
      return {
        hasPermission: false,
        reason: 'Client not found'
      };
    }

    if (!client.isActive) {
      return {
        hasPermission: false,
        reason: 'Client account is inactive'
      };
    }

    if (client.approvalStatus !== 'APPROVED') {
      return {
        hasPermission: false,
        reason: 'Client must be approved before invoices can be created'
      };
    }

    if (!client.canCreateInvoices) {
      return {
        hasPermission: false,
        reason: 'Client does not have invoice creation permission'
      };
    }

    return { hasPermission: true };

  } catch (error) {
    console.error('Client invoice permission check error:', error);
    return {
      hasPermission: false,
      reason: 'Permission check failed'
    };
  }
}
