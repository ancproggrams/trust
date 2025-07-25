

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { legalDocumentService } from '@/lib/services/legal-document-service';
import { ConsentType, GDPRLegalBasis } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/consent - Record consent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      clientId,
      userId,
      documentId,
      consentType,
      purpose,
      legalBasis,
      dataCategories,
      retentionPeriod,
      thirdPartySharing,
      thirdParties,
      evidence,
    } = body;

    if (!documentId || !consentType || !purpose || !legalBasis || !dataCategories) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP address for audit trail
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const consent = await legalDocumentService.recordConsent({
      clientId,
      userId,
      documentId,
      consentType: consentType as ConsentType,
      purpose,
      legalBasis: legalBasis as GDPRLegalBasis,
      dataCategories,
      retentionPeriod,
      thirdPartySharing,
      thirdParties,
      ipAddress,
      userAgent: request.headers.get('user-agent') || undefined,
      evidence,
    });

    return NextResponse.json({
      success: true,
      data: consent,
    });

  } catch (error) {
    console.error('Failed to record consent:', error);
    return NextResponse.json(
      { error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/consent - Get consents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId parameter is required' },
        { status: 400 }
      );
    }

    const consents = await legalDocumentService.getClientConsents(clientId);

    return NextResponse.json({
      success: true,
      data: consents,
    });

  } catch (error) {
    console.error('Failed to get consents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve consents' },
      { status: 500 }
    );
  }
}

