
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { workflowService } from '@/lib/services/workflow-service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// Get pending approvals
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
    // For now, allow all authenticated users

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING_APPROVAL';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get pending client approvals
    const approvals = await prisma.clientApproval.findMany({
      where: {
        status: status as any,
      },
      include: {
        client: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const total = await prisma.clientApproval.count({
      where: {
        status: status as any,
      },
    });

    return NextResponse.json({
      success: true,
      approvals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    );
  }
}

// Approve or reject client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add role-based access control check for admin access

    const { clientId, action, notes, rejectionReason } = await request.json();

    if (!clientId || !action) {
      return NextResponse.json(
        { error: 'Client ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      await workflowService.approveClient(
        clientId,
        session.user.id,
        notes
      );
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }
      await workflowService.rejectClient(
        clientId,
        session.user.id,
        rejectionReason
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Client ${action}d successfully`,
    });

  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
}

// Bulk approve/reject
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add role-based access control check for admin access

    const { clientIds, action, notes, rejectionReason } = await request.json();

    if (!clientIds || !Array.isArray(clientIds) || !action) {
      return NextResponse.json(
        { error: 'Client IDs array and action are required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const clientId of clientIds) {
      try {
        if (action === 'approve') {
          await workflowService.approveClient(
            clientId,
            session.user.id,
            notes
          );
          results.push({ clientId, status: 'approved' });
        } else if (action === 'reject') {
          if (!rejectionReason) {
            results.push({ clientId, status: 'error', error: 'Rejection reason required' });
            continue;
          }
          await workflowService.rejectClient(
            clientId,
            session.user.id,
            rejectionReason
          );
          results.push({ clientId, status: 'rejected' });
        }
      } catch (error) {
        results.push({ 
          clientId, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error('Error processing bulk approval:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk approval' },
      { status: 500 }
    );
  }
}
