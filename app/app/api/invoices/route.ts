
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute, ValidationRules } from '@/lib/middleware/security-middleware';
import { PERMISSIONS, checkClientInvoicePermission } from '@/lib/middleware/permission-middleware';
import { auditService } from '@/lib/services/audit-service';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/invoices - List invoices
export const GET = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      userId: session?.user?.id,
    };

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            }
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_READ],
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

// POST /api/invoices - Create new invoice with security checks
export const POST = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  try {
    const data = await request.json();

    // Validate required fields
    const validation = await require('@/lib/middleware/security-middleware').SecurityMiddleware.validateInput(data, {
      clientId: ValidationRules.required,
      amount: (value: any) => typeof value === 'number' && value > 0 || 'Amount must be a positive number',
      btwRate: (value: any) => [0, 9, 21].includes(value) || 'BTW rate must be 0, 9, or 21',
      description: ValidationRules.required,
      dueDate: ValidationRules.required,
      items: (value: any) => Array.isArray(value) && value.length > 0 || 'At least one item is required',
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // SECURITY CHECK: Verify client approval and invoice permissions
    const clientPermissionCheck = await checkClientInvoicePermission(
      session?.user?.id!,
      data.clientId
    );

    if (!clientPermissionCheck.hasPermission) {
      await auditService.logAction({
        userId: session?.user?.id!,
        action: 'SECURITY_EVENT' as any,
        entity: 'Invoice',
        entityId: 'BLOCKED_CREATION',
        context: `Invoice creation blocked: ${clientPermissionCheck.reason}`,
        newValues: {
          clientId: data.clientId,
          reason: clientPermissionCheck.reason,
        },
      });

      return NextResponse.json(
        { 
          error: 'Invoice creation not allowed',
          reason: clientPermissionCheck.reason 
        },
        { status: 403 }
      );
    }

    // Verify client exists and belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        userId: session?.user?.id,
        isActive: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate amounts
    const amount = parseFloat(data.amount);
    const btwRate = parseInt(data.btwRate);
    const btwAmount = (amount * btwRate) / 100;
    const totalAmount = amount + btwAmount;

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: session?.user?.id }
    });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        userId: session?.user?.id!,
        clientId: data.clientId,
        invoiceNumber,
        amount,
        btwAmount,
        totalAmount,
        btwRate,
        status: 'DRAFT',
        dueDate: new Date(data.dueDate),
        description: data.description,
        
        // Audit fields
        createdBy: session?.user?.id,
        version: 1,
        
        // Create invoice items
        items: {
          create: data.items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            rate: parseFloat(item.rate),
            amount: parseFloat(item.amount),
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          }
        },
        items: true,
      },
    });

    // Update client total invoiced
    await prisma.client.update({
      where: { id: data.clientId },
      data: {
        totalInvoiced: {
          increment: totalAmount,
        },
      },
    });

    // Log audit event
    await auditService.logAction({
      userId: session?.user?.id!,
      action: 'CREATE',
      entity: 'Invoice',
      entityId: invoice.id,
      newValues: {
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
      },
      context: 'Invoice created with security verification',
    });

    return NextResponse.json({
      success: true,
      invoice,
      message: 'Invoice created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_CREATE],
  rateLimit: { maxRequests: 20, windowMs: 60000 }, // 20 invoices per minute
  validateCSRF: true,
  sanitizeInput: true,
});
