
import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/services/email-service';
import { workflowService } from '@/lib/services/workflow-service';
import { auditService } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Confirmation token is required' },
        { status: 400 }
      );
    }

    // Confirm email using the email service
    const confirmed = await emailService.confirmEmail(
      token,
      request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    );

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 400 }
      );
    }

    // Log audit event
    await auditService.logAction({
      action: 'VALIDATE',
      entity: 'EmailConfirmation',
      entityId: token,
      context: 'Email confirmation completed',
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully',
      redirectUrl: '/dashboard'
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm email' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, additionalData } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Confirmation token is required' },
        { status: 400 }
      );
    }

    // Confirm email with additional data
    const confirmed = await emailService.confirmEmail(
      token,
      request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    );

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully'
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm email' },
      { status: 500 }
    );
  }
}
