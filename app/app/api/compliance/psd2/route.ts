

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { psd2AuthenticationService } from '@/lib/services/psd2-authentication-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/compliance/psd2 - Initiate PSD2 Strong Customer Authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      transactionId,
      amount,
      payee,
      transactionType,
      deviceId,
      location,
    } = body;

    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const authentication = await psd2AuthenticationService.initiateSCA({
      userId: session.user?.id || 'unknown',
      transactionId,
      amount,
      payee,
      transactionType,
      ipAddress,
      deviceId,
      location,
    });

    return NextResponse.json({
      success: true,
      data: authentication,
    });

  } catch (error) {
    console.error('Failed to initiate PSD2 authentication:', error);
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/psd2 - Get PSD2 authentication data
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const authId = searchParams.get('authId');

    if (type === 'status' && authId) {
      const status = await psd2AuthenticationService.checkAuthenticationStatus(authId);
      return NextResponse.json({
        success: true,
        data: status,
      });
    }

    if (type === 'history') {
      const userId = searchParams.get('userId') || session.user?.id;
      const limit = parseInt(searchParams.get('limit') || '50');

      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required for history' },
          { status: 400 }
        );
      }

      const history = await psd2AuthenticationService.getUserAuthenticationHistory(userId, limit);
      return NextResponse.json({
        success: true,
        data: history,
      });
    }

    if (type === 'stats') {
      const dateFrom = searchParams.get('dateFrom');
      const dateTo = searchParams.get('dateTo');
      const userId = searchParams.get('userId');

      const stats = await psd2AuthenticationService.getAuthenticationStats({
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        userId: userId || undefined,
      });

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter. Use "status", "history", or "stats"' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Failed to get PSD2 data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve PSD2 data' },
      { status: 500 }
    );
  }
}

