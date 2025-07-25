

import { NextRequest, NextResponse } from 'next/server';
import { eSignatureService } from '@/lib/services/e-signature-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/e-signatures/verify/[code] - Verify signature by code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const verificationResult = await eSignatureService.verifyByCode(params.code);

    return NextResponse.json({
      success: true,
      data: verificationResult,
    });

  } catch (error) {
    console.error('Failed to verify signature:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}

