
import { NextRequest, NextResponse } from 'next/server';
import { workflowService } from '@/lib/services/workflow-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { clientId, step, validationResults } = await request.json();

    if (!clientId || !step) {
      return NextResponse.json(
        { error: 'Client ID and step are required' },
        { status: 400 }
      );
    }

    // Process the onboarding step
    const workflowState = await workflowService.processOnboardingStep(
      clientId,
      step,
      session.user.id,
      validationResults
    );

    return NextResponse.json({
      success: true,
      workflowState
    });

  } catch (error) {
    console.error('Workflow processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process workflow step' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get current workflow state
    const client = await prisma?.client.findUnique({
      where: { id: clientId },
      include: { user: true }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const workflowState = await workflowService.getWorkflowState(client);

    return NextResponse.json({
      success: true,
      workflowState
    });

  } catch (error) {
    console.error('Workflow state error:', error);
    return NextResponse.json(
      { error: 'Failed to get workflow state' },
      { status: 500 }
    );
  }
}
