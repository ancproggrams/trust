
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper authentication check
    // For now, using hardcoded userId - replace with session-based auth
    const userId = 'demo-user-id';

    // Run all queries in parallel for better performance
    const [
      totalInvoices,
      totalRevenue,
      pendingInvoices,
      totalClients,
      totalBTWOwed,
      totalBTWPrepaid,
      totalTaxReserved,
      currentYearRevenue,
      totalCreditors,
      pendingCreditorValidations,
      pendingPayments
    ] = await Promise.all([
      // Total invoices
      prisma.invoice.count({
        where: { userId }
      }),
      
      // Total revenue (sum of all paid invoices)
      prisma.invoice.aggregate({
        where: { 
          userId,
          paymentStatus: 'COMPLETED'
        },
        _sum: { totalAmount: true }
      }),
      
      // Pending invoices count
      prisma.invoice.count({
        where: { 
          userId,
          status: { in: ['SENT'] },
          paymentStatus: { in: ['PENDING'] }
        }
      }),
      
      // Total clients
      prisma.client.count({
        where: { 
          userId,
          isActive: true
        }
      }),
      
      // BTW owed (sum of unpaid BTW)
      prisma.bTWRecord.aggregate({
        where: {
          status: { in: ['PENDING', 'RESERVED'] },
          invoice: { userId }
        },
        _sum: { btwAmount: true }
      }),
      
      // BTW prepaid this quarter
      prisma.bTWRecord.aggregate({
        where: {
          status: 'PREPAID',
          quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
          invoice: { userId }
        },
        _sum: { btwAmount: true }
      }),
      
      // Tax reserved - simplified for now
      Promise.resolve({ _sum: { amount: 0 } }),
      
      // Current year revenue
      prisma.invoice.aggregate({
        where: {
          userId,
          issueDate: {
            gte: new Date(new Date().getFullYear(), 0, 1),
            lt: new Date(new Date().getFullYear() + 1, 0, 1)
          }
        },
        _sum: { totalAmount: true }
      }),
      
      // Total creditors
      prisma.creditor.count({
        where: { 
          userId,
          isActive: true
        }
      }),
      
      // Pending creditor validations
      prisma.creditorValidation.count({
        where: {
          status: 'PENDING',
          creditor: { userId }
        }
      }),
      
      // Pending payments
      prisma.payment.count({
        where: {
          status: { in: ['PENDING', 'SCHEDULED'] },
          creditor: { userId }
        }
      })
    ]);

    // Calculate next BTW payment due date
    const nextBTWPayment = await prisma.bTWRecord.findFirst({
      where: {
        status: { in: ['PENDING', 'RESERVED'] },
        invoice: { userId }
      },
      orderBy: { dueDate: 'asc' },
      select: { dueDate: true }
    });

    // Calculate estimated year-end tax (simplified calculation)
    const currentYearTotal = Number(currentYearRevenue._sum.totalAmount || 0);
    const estimatedTaxRate = 0.37; // Simplified 37% tax rate for ZZP
    const estimatedYearEndTax = currentYearTotal * estimatedTaxRate;

    const stats = {
      totalInvoices,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      pendingInvoices,
      totalClients,
      totalBTWOwed: Number(totalBTWOwed._sum.btwAmount || 0),
      totalBTWPrepaid: Number(totalBTWPrepaid._sum.btwAmount || 0),
      nextBTWPaymentDue: nextBTWPayment?.dueDate || null,
      totalTaxReserved: Number(totalTaxReserved._sum.amount || 0),
      currentYearRevenue: currentYearTotal,
      estimatedYearEndTax,
      totalCreditors,
      pendingCreditorValidations,
      pendingPayments
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
