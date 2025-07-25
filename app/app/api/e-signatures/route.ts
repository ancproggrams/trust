

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eSignatureService } from '@/lib/services/e-signature-service';
import { SignatureType, ComplianceLevel } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/e-signatures - Create digital signature
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      documentId,
      signerEmail,
      signerName,
      signerRole,
      signatureData,
      signatureType,
      location,
      witnessedBy,
      complianceLevel,
    } = body;

    if (!documentId || !signerEmail || !signerName || !signatureData || !signatureType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get IP address
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const signature = await eSignatureService.createSignature({
      documentId,
      signerEmail,
      signerName,
      signerRole,
      signatureData,
      signatureType: signatureType as SignatureType,
      ipAddress,
      userAgent: request.headers.get('user-agent') || undefined,
      location,
      witnessedBy,
      complianceLevel: (complianceLevel as ComplianceLevel) || 'STANDARD',
    });

    return NextResponse.json({
      success: true,
      data: signature,
    });

  } catch (error) {
    console.error('Failed to create signature:', error);
    return NextResponse.json(
      { error: 'Failed to create signature' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/e-signatures - Get signatures
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (documentId) {
      const signatures = await eSignatureService.getDocumentSignatures(documentId);
      return NextResponse.json({
        success: true,
        data: signatures,
      });
    }

    // Get signature statistics
    const stats = await eSignatureService.getSignatureStats();
    return NextResponse.json({
      success: true,
      data: { stats },
    });

  } catch (error) {
    console.error('Failed to get signatures:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve signatures' },
      { status: 500 }
    );
  }
}

