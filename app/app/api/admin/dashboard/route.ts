
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { AdminDashboardStats } from '@/lib/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add role-based access control check for admin access

    // Get dashboard statistics
    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

async function getDashboardStats(): Promise<AdminDashboardStats> {
  const today = new Date();
  const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get pending approvals count
  const pendingApprovals = await prisma.clientApproval.count({
    where: {
      status: 'PENDING_APPROVAL',
    },
  });

  // Get pending validations count
  const pendingValidations = await prisma.clientValidation.count({
    where: {
      status: 'PENDING',
    },
  });

  // Get email statistics for today
  const emailsSentToday = await prisma.emailLog.count({
    where: {
      sentAt: {
        gte: new Date(today.toDateString()),
      },
      status: { in: ['SENT', 'DELIVERED', 'OPENED', 'CLICKED'] },
    },
  });

  const emailsFailedToday = await prisma.emailLog.count({
    where: {
      sentAt: {
        gte: new Date(today.toDateString()),
      },
      status: { in: ['FAILED', 'BOUNCED'] },
    },
  });

  // Get new clients this week
  const newClientsThisWeek = await prisma.client.count({
    where: {
      createdAt: {
        gte: weekStart,
      },
    },
  });

  // Get completed onboardings this week
  const completedOnboardingsThisWeek = await prisma.client.count({
    where: {
      onboardingCompletedAt: {
        gte: weekStart,
      },
    },
  });

  // Calculate average approval time
  const recentApprovals = await prisma.clientApproval.findMany({
    where: {
      status: 'APPROVED',
      reviewedAt: {
        not: null,
      },
    },
    select: {
      requestedAt: true,
      reviewedAt: true,
    },
    take: 50,
  });

  const averageApprovalTime = recentApprovals.length > 0
    ? recentApprovals.reduce((sum, approval) => {
        const hours = approval.reviewedAt && approval.requestedAt
          ? (approval.reviewedAt.getTime() - approval.requestedAt.getTime()) / (1000 * 60 * 60)
          : 0;
        return sum + hours;
      }, 0) / recentApprovals.length
    : 0;

  // Get clients by status
  const clientsByStatus = await prisma.client.groupBy({
    by: ['onboardingStatus'],
    _count: true,
  });

  const clientStatusCounts = clientsByStatus.reduce((acc, group) => {
    acc[group.onboardingStatus] = group._count;
    return acc;
  }, {} as Record<string, number>);

  // Get validations by type
  const validationsByType = await prisma.clientValidation.groupBy({
    by: ['validationType'],
    _count: true,
  });

  const validationTypeCounts = validationsByType.reduce((acc, group) => {
    acc[group.validationType] = group._count;
    return acc;
  }, {} as Record<string, number>);

  // Get emails by status
  const emailsByStatus = await prisma.emailLog.groupBy({
    by: ['status'],
    _count: true,
  });

  const emailStatusCounts = emailsByStatus.reduce((acc, group) => {
    acc[group.status] = group._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    pendingApprovals,
    pendingValidations,
    emailsSentToday,
    emailsFailedToday,
    newClientsThisWeek,
    completedOnboardingsThisWeek,
    averageApprovalTime: Math.round(averageApprovalTime * 100) / 100,
    clientsByStatus: clientStatusCounts as any,
    validationsByType: validationTypeCounts as any,
    emailsByStatus: emailStatusCounts as any,
  };
}
