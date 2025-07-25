

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { legalDocumentService } from '@/lib/services/legal-document-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/legal-documents/[id] - Get document with history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentWithHistory = await legalDocumentService.getDocumentWithHistory(params.id);

    return NextResponse.json({
      success: true,
      data: documentWithHistory,
    });

  } catch (error) {
    console.error('Failed to get document:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve document' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/legal-documents/[id] - Update document (create new version)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, changeReason, templateData } = body;

    if (!content || !changeReason) {
      return NextResponse.json(
        { error: 'Missing required fields: content, changeReason' },
        { status: 400 }
      );
    }

    const newVersion = await legalDocumentService.createNewVersion(
      params.id,
      { content, changeReason, templateData },
      session.user?.email || 'system'
    );

    return NextResponse.json({
      success: true,
      data: newVersion,
    });

  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

