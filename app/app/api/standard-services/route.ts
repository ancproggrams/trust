
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute, ValidationRules } from '@/lib/middleware/security-middleware';
import { PERMISSIONS } from '@/lib/middleware/permission-middleware';
import { auditService } from '@/lib/services/audit-service';
import StandardServicesService from '@/lib/services/standard-services';
import { StandardServiceFormData, InvoiceUnitType } from '@/lib/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/standard-services - List user's standard services
export const GET = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const active = searchParams.get('active');
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      userId: session?.user?.id,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== null && active !== undefined) {
      where.isActive = active === 'true';
    }

    const [services, total] = await Promise.all([
      prisma.standardService.findMany({
        where,
        orderBy: [
          { isDefault: 'desc' },
          { timesUsed: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: limit,
      }),
      prisma.standardService.count({ where }),
    ]);

    // Group by categories
    const grouped = StandardServicesService.groupByCategory(services);
    
    // Get statistics
    const stats = StandardServicesService.calculateStatistics(services);

    return NextResponse.json({
      success: true,
      services,
      grouped,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching standard services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standard services' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_READ],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

// POST /api/standard-services - Create new standard service
export const POST = secureRoute(async (request: NextRequest) => {
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

    // Additional security validation
    const securityValidation = await require('@/lib/middleware/security-middleware').SecurityMiddleware.validateInput(data, {
      name: ValidationRules.required,
      defaultRate: (value: any) => typeof value === 'number' && value >= 0 || 'Default rate must be a non-negative number',
      unitType: (value: any) => ['HOURS', 'AMOUNT', 'DAYS', 'PIECES', 'KILOMETERS', 'PERCENTAGE', 'OTHER'].includes(value) || 'Invalid unit type',
    });

    if (!securityValidation.valid) {
      return NextResponse.json(
        { error: 'Security validation failed', details: securityValidation.errors },
        { status: 400 }
      );
    }

    // Check for duplicate names
    const existingService = await prisma.standardService.findFirst({
      where: {
        userId: session?.user?.id,
        name: data.name,
        isActive: true,
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'A service with this name already exists' },
        { status: 409 }
      );
    }

    // Create standard service
    const service = await prisma.standardService.create({
      data: {
        userId: session?.user?.id!,
        name: data.name,
        description: data.description,
        category: data.category,
        defaultRate: data.defaultRate,
        unitType: data.unitType,
        isDefault: data.isDefault || false,
      },
    });

    // Log audit event
    await auditService.logAction({
      userId: session?.user?.id!,
      action: 'CREATE',
      entity: 'StandardService',
      entityId: service.id,
      newValues: {
        name: service.name,
        category: service.category,
        defaultRate: service.defaultRate,
        unitType: service.unitType,
      },
      context: 'Standard service created',
    });

    return NextResponse.json({
      success: true,
      service,
      message: 'Standard service created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating standard service:', error);
    return NextResponse.json(
      { error: 'Failed to create standard service' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_CREATE],
  rateLimit: { maxRequests: 30, windowMs: 60000 },
  validateCSRF: true,
  sanitizeInput: true,
});

// PUT /api/standard-services/bulk - Bulk operations (activate/deactivate, delete)
export const PUT = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  try {
    const { action, serviceIds } = await request.json();

    if (!action || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and service IDs are required' },
        { status: 400 }
      );
    }

    const validActions = ['activate', 'deactivate', 'delete', 'setDefault', 'unsetDefault'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Verify all services belong to the user
    const services = await prisma.standardService.findMany({
      where: {
        id: { in: serviceIds },
        userId: session?.user?.id,
      },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: 'Some services not found or access denied' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let auditAction = 'UPDATE';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        break;
      case 'deactivate':
        updateData = { isActive: false };
        break;
      case 'delete':
        // Soft delete by deactivating
        updateData = { isActive: false };
        auditAction = 'DELETE';
        break;
      case 'setDefault':
        updateData = { isDefault: true };
        break;
      case 'unsetDefault':
        updateData = { isDefault: false };
        break;
    }

    // Perform bulk update
    const result = await prisma.standardService.updateMany({
      where: {
        id: { in: serviceIds },
        userId: session?.user?.id,
      },
      data: updateData,
    });

    // Log audit events
    await Promise.all(services.map(service => 
      auditService.logAction({
        userId: session?.user?.id!,
        action: auditAction as any,
        entity: 'StandardService',
        entityId: service.id,
        oldValues: { isActive: service.isActive, isDefault: service.isDefault },
        newValues: updateData,
        context: `Bulk ${action} operation`,
      })
    ));

    return NextResponse.json({
      success: true,
      updated: result.count,
      action,
      message: `${result.count} services ${action}d successfully`,
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_CREATE],
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  validateCSRF: true,
  sanitizeInput: true,
});
