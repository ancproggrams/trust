

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { wwftComplianceService } from '@/lib/services/wwft-compliance-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/compliance/wwft - Perform Wwft CDD check
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      entityType,
      entityId,
      clientName,
      kvkNumber,
      identityDocuments,
      businessType,
      transactionVolume,
      geographicRisk,
    } = body;

    if (!entityType || !entityId || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId, clientName' },
        { status: 400 }
      );
    }

    const wwftCheck = await wwftComplianceService.performCDDCheck({
      entityType,
      entityId,
      clientName,
      kvkNumber,
      identityDocuments,
      businessType,
      transactionVolume,
      geographicRisk,
      performedBy: session.user?.email || 'system',
    });

    return NextResponse.json({
      success: true,
      data: wwftCheck,
    });

  } catch (error) {
    console.error('Failed to perform Wwft check:', error);
    return NextResponse.json(
      { error: 'Failed to perform Wwft check' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/wwft - Get Wwft checks and reports
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'overdue') {
      const overdueReviews = await wwftComplianceService.getOverdueReviews();
      return NextResponse.json({
        success: true,
        data: overdueReviews,
      });
    }

    if (type === 'report') {
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const riskLevel = searchParams.get('riskLevel') as any;
      const status = searchParams.get('status') as any;

      const report = await wwftComplianceService.generateReport({
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        riskLevel,
        status,
      });

      return NextResponse.json({
        success: true,
        data: report,
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter. Use "overdue" or "report"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Failed to get Wwft data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Wwft data' },
      { status: 500 }
    );
  }
}

