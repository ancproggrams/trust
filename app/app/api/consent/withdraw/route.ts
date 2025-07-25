

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { legalDocumentService } from '@/lib/services/legal-document-service';
import { gdprDataManagementService } from '@/lib/services/gdpr-data-management-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/consent/withdraw - Withdraw consent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { consentId, reason } = body;

    if (!consentId) {
      return NextResponse.json(
        { error: 'consentId is required' },
        { status: 400 }
      );
    }

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Use GDPR service for withdrawal as it handles impact assessment
    const withdrawalResult = await gdprDataManagementService.withdrawConsent(
      consentId,
      reason || 'Consent withdrawn by user',
      ipAddress
    );

    return NextResponse.json({
      success: true,
      data: withdrawalResult,
    });

  } catch (error) {
    console.error('Failed to withdraw consent:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw consent' },
      { status: 500 }
    );
  }
}

