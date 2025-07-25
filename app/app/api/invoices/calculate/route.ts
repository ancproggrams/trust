
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute } from '@/lib/middleware/security-middleware';
import { PERMISSIONS } from '@/lib/middleware/permission-middleware';
import InvoiceCalculationService from '@/lib/services/invoice-calculation';
import { InvoiceLineItemFormData, DueDateType } from '@/lib/types';

export const dynamic = 'force-dynamic';

// POST /api/invoices/calculate - Calculate invoice totals (for real-time preview)
export const POST = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  try {
    const { 
      lineItems, 
      btwRate = 21,
      dueDateType = 'FOURTEEN_DAYS',
      customDueDate,
      issueDate = new Date().toISOString()
    }: {
      lineItems: InvoiceLineItemFormData[];
      btwRate?: number;
      dueDateType?: DueDateType;
      customDueDate?: string;
      issueDate?: string;
    } = await request.json();

    // Validate line items
    const validation = InvoiceCalculationService.validateLineItems(lineItems);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Line item validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Calculate totals
    const calculation = InvoiceCalculationService.calculateInvoice(lineItems, btwRate);
    
    // Calculate due date
    const issue = new Date(issueDate);
    const customDue = customDueDate ? new Date(customDueDate) : undefined;
    const dueDate = InvoiceCalculationService.calculateDueDate(issue, dueDateType, customDue);

    // Generate preview invoice number
    const previewInvoiceNumber = InvoiceCalculationService.generateInvoiceNumber('PREVIEW', issue.getFullYear());

    // Additional calculations
    const daysDifference = InvoiceCalculationService.daysBetween(issue, dueDate);
    const isOverdue = InvoiceCalculationService.isOverdue(dueDate);
    
    return NextResponse.json({
      success: true,
      calculation,
      dates: {
        issueDate: issue.toISOString(),
        dueDate: dueDate.toISOString(),
        daysDifference,
        isOverdue,
      },
      preview: {
        invoiceNumber: previewInvoiceNumber,
        btwRate,
        dueDateType,
      },
      formatting: {
        subtotal: InvoiceCalculationService.formatCurrency(calculation.subtotal),
        btwAmount: InvoiceCalculationService.formatCurrency(calculation.btwAmount),
        totalAmount: InvoiceCalculationService.formatCurrency(calculation.totalAmount),
      },
    });

  } catch (error) {
    console.error('Error calculating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to calculate invoice' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.INVOICE_READ],
  rateLimit: { maxRequests: 100, windowMs: 60000 }, // High limit for real-time calculations
});
