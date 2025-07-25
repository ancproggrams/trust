

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { psd2AuthenticationService } from '@/lib/services/psd2-authentication-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/compliance/psd2/[authId]/complete - Complete PSD2 authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { authId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      knowledgeFactor,
      possessionFactor,
      inherenceFactor,
    } = body;

    const completedAuth = await psd2AuthenticationService.completeAuthentication(
      params.authId,
      {
        knowledgeFactor,
        possessionFactor,
        inherenceFactor,
      }
    );

    return NextResponse.json({
      success: true,
      data: completedAuth,
    });

  } catch (error) {
    console.error('Failed to complete PSD2 authentication:', error);
    return NextResponse.json(
      { error: 'Failed to complete authentication' },
      { status: 500 }
    );
  }
}

