
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute, ValidationRules } from '@/lib/middleware/security-middleware';
import { PERMISSIONS, checkClientInvoicePermission } from '@/lib/middleware/permission-middleware';
import { auditService } from '@/lib/services/audit-service';
import InvoiceCalculationService from '@/lib/services/invoice-calculation';
import { InvoiceFormData, DueDateType, InvoiceUnitType } from '@/lib/types';

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
              phone: true,
              address: true,
              postalCode: true,
              city: true,
              country: true,
            }
          },
          lineItems: {
            include: {
              standardService: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          },
          emailLogs: {
            orderBy: { createdAt: 'desc' },
            take: 5 // Recent email logs
          }
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

// POST /api/invoices - Create enhanced invoice with line items and services
export const POST = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  try {
    const formData: InvoiceFormData = await request.json();

    // Validate required fields
    const validation = await require('@/lib/middleware/security-middleware').SecurityMiddleware.validateInput(formData, {
      clientId: ValidationRules.required,
      description: ValidationRules.required,
      dueDateType: (value: any) => ['SEVEN_DAYS', 'FOURTEEN_DAYS', 'THIRTY_DAYS', 'CUSTOM'].includes(value) || 'Invalid due date type',
      lineItems: (value: any) => Array.isArray(value) && value.length > 0 || 'At least one line item is required',
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Validate line items
    const lineItemValidation = InvoiceCalculationService.validateLineItems(formData.lineItems);
    if (!lineItemValidation.isValid) {
      return NextResponse.json(
        { error: 'Line item validation failed', details: lineItemValidation.errors },
        { status: 400 }
      );
    }

    // SECURITY CHECK: Verify client approval and invoice permissions
    const clientPermissionCheck = await checkClientInvoicePermission(
      session?.user?.id!,
      formData.clientId
    );

    if (!clientPermissionCheck.hasPermission) {
      await auditService.logAction({
        userId: session?.user?.id!,
        action: 'SECURITY_EVENT' as any,
        entity: 'Invoice',
        entityId: 'BLOCKED_CREATION',
        context: `Invoice creation blocked: ${clientPermissionCheck.reason}`,
        newValues: {
          clientId: formData.clientId,
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
        id: formData.clientId,
        userId: session?.user?.id,
        isActive: true,
        canCreateInvoices: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found, access denied, or invoice permission not granted' },
        { status: 404 }
      );
    }

    // Calculate invoice totals
    const calculation = InvoiceCalculationService.calculateInvoice(formData.lineItems);
    
    // Calculate due date
    const issueDate = new Date();
    const customDueDate = formData.customDueDate ? new Date(formData.customDueDate) : undefined;
    const dueDate = InvoiceCalculationService.calculateDueDate(issueDate, formData.dueDateType, customDueDate);

    // Generate invoice number
    const invoiceNumber = InvoiceCalculationService.generateInvoiceNumber('INV', issueDate.getFullYear());

    // Prepare standard service updates (increment usage count)
    const standardServiceUpdates = formData.lineItems
      .filter(item => item.standardServiceId)
      .map(item => prisma.standardService.update({
        where: { id: item.standardServiceId! },
        data: {
          timesUsed: { increment: 1 },
          lastUsedAt: new Date(),
        }
      }));

    // Create invoice with enhanced features
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const createdInvoice = await tx.invoice.create({
        data: {
          userId: session?.user?.id!,
          clientId: formData.clientId,
          invoiceNumber,
          title: formData.title,
          description: formData.description,
          notes: formData.notes,
          
          // Calculated amounts
          subtotal: calculation.subtotal,
          btwAmount: calculation.btwAmount,
          totalAmount: calculation.totalAmount,
          btwRate: 21, // Default BTW rate
          
          // Dates
          issueDate,
          dueDate,
          dueDateType: formData.dueDateType,
          
          // Status
          status: 'DRAFT',
          paymentStatus: 'PENDING',
          
          // Audit fields
          createdBy: session?.user?.id,
          version: 1,
          
          // Create line items
          lineItems: {
            create: formData.lineItems.map((item, index) => ({
              standardServiceId: item.standardServiceId,
              description: item.description,
              quantity: item.quantity,
              unitType: item.unitType,
              rate: item.rate,
              amount: InvoiceCalculationService.calculateLineItem(item.quantity, item.rate),
              notes: item.notes,
              category: item.category,
              sortOrder: index,
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
              phone: true,
              address: true,
              postalCode: true,
              city: true,
              country: true,
            }
          },
          lineItems: {
            include: {
              standardService: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                }
              }
            },
            orderBy: { sortOrder: 'asc' }
          },
        },
      });

      // Update client total invoiced
      await tx.client.update({
        where: { id: formData.clientId },
        data: {
          totalInvoiced: {
            increment: calculation.totalAmount,
          },
        },
      });

      // Update standard service usage counts
      if (standardServiceUpdates.length > 0) {
        await Promise.all(standardServiceUpdates);
      }

      return createdInvoice;
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
        lineItemsCount: invoice.lineItems.length,
      },
      context: 'Enhanced invoice created with security verification and line items',
    });

    return NextResponse.json({
      success: true,
      invoice,
      calculation,
      message: 'Invoice created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating enhanced invoice:', error);
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
