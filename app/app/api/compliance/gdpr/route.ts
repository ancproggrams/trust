

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gdprDataManagementService } from '@/lib/services/gdpr-data-management-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/compliance/gdpr - Handle GDPR data requests
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const subjectId = searchParams.get('subjectId');
    const entityType = searchParams.get('entityType') as 'user' | 'client';

    switch (type) {
      case 'access':
        if (!subjectId || !entityType) {
          return NextResponse.json(
            { error: 'subjectId and entityType are required for access requests' },
            { status: 400 }
          );
        }

        const accessData = await gdprDataManagementService.processAccessRequest(
          subjectId,
          entityType
        );

        return NextResponse.json({
          success: true,
          data: accessData,
        });

      case 'portability':
        if (!subjectId || !entityType) {
          return NextResponse.json(
            { error: 'subjectId and entityType are required for portability requests' },
            { status: 400 }
          );
        }

        const format = searchParams.get('format') as 'json' | 'csv' | 'xml' || 'json';
        const portabilityData = await gdprDataManagementService.processPortabilityRequest(
          subjectId,
          entityType,
          format
        );

        return new NextResponse(portabilityData.data, {
          headers: {
            'Content-Type': portabilityData.mimeType,
            'Content-Disposition': `attachment; filename="${portabilityData.filename}"`,
          },
        });

      case 'report':
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        if (!dateFrom || !dateTo) {
          return NextResponse.json(
            { error: 'dateFrom and dateTo are required for reports' },
            { status: 400 }
          );
        }

        const report = await gdprDataManagementService.generateComplianceReport({
          from: new Date(dateFrom),
          to: new Date(dateTo),
        });

        return NextResponse.json({
          success: true,
          data: report,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use "access", "portability", or "report"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to process GDPR request:', error);
    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/gdpr - Handle GDPR data modification requests
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, subjectId, entityType } = body;

    switch (type) {
      case 'rectification':
        const { corrections } = body;
        if (!corrections) {
          return NextResponse.json(
            { error: 'corrections are required for rectification requests' },
            { status: 400 }
          );
        }

        const rectificationResult = await gdprDataManagementService.processRectificationRequest(
          subjectId,
          entityType,
          corrections,
          session.user?.email || 'system'
        );

        return NextResponse.json({
          success: true,
          data: rectificationResult,
        });

      case 'erasure':
        const { reason, forceDelete } = body;

        const erasureResult = await gdprDataManagementService.processErasureRequest(
          subjectId,
          entityType,
          reason || 'User requested deletion',
          session.user?.email || 'system',
          forceDelete || false
        );

        return NextResponse.json({
          success: true,
          data: erasureResult,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Use "rectification" or "erasure"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to process GDPR modification request:', error);
    return NextResponse.json(
      { error: 'Failed to process GDPR request' },
      { status: 500 }
    );
  }
}

