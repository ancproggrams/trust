
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute } from '@/lib/middleware/security-middleware';
import { DashboardStats } from '@/lib/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const GET = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id!;

  try {
    // Get date ranges
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    // Fetch all stats in parallel
    const [
      totalInvoices,
      totalRevenue,
      pendingInvoices,
      upcomingAppointments,
      totalClients,
      completedAppointments,
      totalBTWOwed,
      totalBTWPrepaid,
      nextBTWPayment,
      totalTaxReserved,
      currentYearRevenue,
      totalCreditors,
      pendingCreditorValidations,
      pendingPayments,
    ] = await Promise.all([
      // Basic invoice stats
      prisma.invoice.count({
        where: { userId }
      }),
      
      prisma.invoice.aggregate({
        where: { userId },
        _sum: { totalAmount: true }
      }),
      
      prisma.invoice.count({
        where: { 
          userId,
          status: { in: ['DRAFT', 'SENT', 'OVERDUE'] }
        }
      }),
      
      // Upcoming appointments
      prisma.appointment.count({
        where: {
          userId,
          date: { gte: today },
          status: 'SCHEDULED'
        }
      }),
      
      // Client stats
      prisma.client.count({
        where: { userId }
      }),
      
      prisma.appointment.count({
        where: {
          userId,
          status: 'COMPLETED'
        }
      }),
      
      // BTW stats
      prisma.bTWRecord.aggregate({
        where: {
          invoice: { userId },
          status: { in: ['PENDING', 'RESERVED'] }
        },
        _sum: { btwAmount: true }
      }),
      
      prisma.bTWRecord.aggregate({
        where: {
          invoice: { userId },
          status: 'PREPAID'
        },
        _sum: { btwAmount: true }
      }),
      
      // Next BTW payment due
      prisma.bTWRecord.findFirst({
        where: {
          invoice: { userId },
          status: { in: ['PENDING', 'RESERVED'] }
        },
        orderBy: { dueDate: 'asc' },
        select: { dueDate: true }
      }),
      
      // Tax reservation stats
      prisma.taxReservation.aggregate({
        where: {
          invoice: { userId },
          status: 'ACTIVE'
        },
        _sum: { amount: true }
      }),
      
      prisma.invoice.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfYear }
        },
        _sum: { totalAmount: true }
      }),
      
      // Creditor stats
      prisma.creditor.count({
        where: { userId }
      }),
      
      prisma.creditorValidation.count({
        where: {
          creditor: { userId },
          status: 'PENDING'
        }
      }),
      
      prisma.payment.count({
        where: {
          creditor: { userId },
          status: { in: ['PENDING', 'SCHEDULED'] }
        }
      }),
    ]);

    // Calculate estimated year-end tax
    const estimatedYearRevenue = Number(currentYearRevenue._sum.totalAmount || 0);
    const estimatedYearEndTax = estimatedYearRevenue > 21000 ? estimatedYearRevenue * 0.21 : 0;

    const stats: DashboardStats = {
      totalInvoices,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      pendingInvoices,
      upcomingAppointments,
      totalClients,
      completedAppointments,
      totalBTWOwed: Number(totalBTWOwed._sum.btwAmount || 0),
      totalBTWPrepaid: Number(totalBTWPrepaid._sum.btwAmount || 0),
      nextBTWPaymentDue: nextBTWPayment?.dueDate || null,
      totalTaxReserved: Number(totalTaxReserved._sum.amount || 0),
      currentYearRevenue: Number(estimatedYearRevenue),
      estimatedYearEndTax,
      totalCreditors,
      pendingCreditorValidations,
      pendingPayments,
    };

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}, {
  rateLimit: { maxRequests: 60, windowMs: 60000 }, // 60 requests per minute
});
