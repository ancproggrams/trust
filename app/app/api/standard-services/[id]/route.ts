
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute, ValidationRules } from '@/lib/middleware/security-middleware';
import { PERMISSIONS } from '@/lib/middleware/permission-middleware';
import { auditService } from '@/lib/services/audit-service';
import StandardServicesService from '@/lib/services/standard-services';
import { StandardServiceFormData } from '@/lib/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/standard-services/[id] - Get specific standard service
export const GET = secureRoute(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  
  try {
    const service = await prisma.standardService.findFirst({
      where: {
        id: params.id,
        userId: session?.user?.id,
      },
      include: {
        lineItems: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                createdAt: true,
                totalAmount: true,
                status: true,
                client: {
                  select: {
                    name: true,
                    company: true,
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Recent usage
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Standard service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service,
    });

  } catch (error) {
    console.error('Error fetching standard service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standard service' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_READ],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

// PUT /api/standard-services/[id] - Update standard service
export const PUT = secureRoute(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  
  try {
    const data: StandardServiceFormData = await request.json();

    // Validate input
    const validation = StandardServicesService.validateService(data);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify service exists and belongs to user
    const existingService = await prisma.standardService.findFirst({
      where: {
        id: params.id,
        userId: session?.user?.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: 'Standard service not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names (excluding current service)
    const duplicateService = await prisma.standardService.findFirst({
      where: {
        userId: session?.user?.id,
        name: data.name,
        isActive: true,
        NOT: { id: params.id },
      },
    });

    if (duplicateService) {
      return NextResponse.json(
        { error: 'A service with this name already exists' },
        { status: 409 }
      );
    }

    // Update service
    const updatedService = await prisma.standardService.update({
      where: { id: params.id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        defaultRate: data.defaultRate,
        unitType: data.unitType,
        isDefault: data.isDefault,
      },
    });

    // Log audit event
    await auditService.logAction({
      userId: session?.user?.id!,
      action: 'UPDATE',
      entity: 'StandardService',
      entityId: updatedService.id,
      oldValues: {
        name: existingService.name,
        description: existingService.description,
        category: existingService.category,
        defaultRate: existingService.defaultRate.toString(),
        unitType: existingService.unitType,
        isDefault: existingService.isDefault,
      },
      newValues: {
        name: updatedService.name,
        description: updatedService.description,
        category: updatedService.category,
        defaultRate: updatedService.defaultRate.toString(),
        unitType: updatedService.unitType,
        isDefault: updatedService.isDefault,
      },
      context: 'Standard service updated',
    });

    return NextResponse.json({
      success: true,
      service: updatedService,
      message: 'Standard service updated successfully',
    });

  } catch (error) {
    console.error('Error updating standard service:', error);
    return NextResponse.json(
      { error: 'Failed to update standard service' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_CREATE],
  rateLimit: { maxRequests: 30, windowMs: 60000 },
  validateCSRF: true,
  sanitizeInput: true,
});

// DELETE /api/standard-services/[id] - Delete (deactivate) standard service
export const DELETE = secureRoute(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  
  try {
    // Verify service exists and belongs to user
    const service = await prisma.standardService.findFirst({
      where: {
        id: params.id,
        userId: session?.user?.id,
      },
      include: {
        lineItems: {
          select: { id: true }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Standard service not found' },
        { status: 404 }
      );
    }

    // Check if service is being used in invoices
    if (service.lineItems.length > 0) {
      // Soft delete - just deactivate
      const updatedService = await prisma.standardService.update({
        where: { id: params.id },
        data: {
          isActive: false,
          isDefault: false,
        },
      });

      await auditService.logAction({
        userId: session?.user?.id!,
        action: 'UPDATE',
        entity: 'StandardService',
        entityId: service.id,
        oldValues: { isActive: service.isActive, isDefault: service.isDefault },
        newValues: { isActive: false, isDefault: false },
        context: 'Standard service deactivated (has invoice references)',
      });

      return NextResponse.json({
        success: true,
        service: updatedService,
        message: 'Standard service deactivated (cannot delete due to invoice references)',
      });
    } else {
      // Hard delete - no invoice references
      await prisma.standardService.delete({
        where: { id: params.id },
      });

      await auditService.logAction({
        userId: session?.user?.id!,
        action: 'DELETE',
        entity: 'StandardService',
        entityId: service.id,
        oldValues: {
          name: service.name,
          category: service.category,
          defaultRate: service.defaultRate.toString(),
        },
        context: 'Standard service permanently deleted',
      });

      return NextResponse.json({
        success: true,
        message: 'Standard service deleted successfully',
      });
    }

  } catch (error) {
    console.error('Error deleting standard service:', error);
    return NextResponse.json(
      { error: 'Failed to delete standard service' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_CREATE],
  rateLimit: { maxRequests: 20, windowMs: 60000 },
  validateCSRF: true,
});
