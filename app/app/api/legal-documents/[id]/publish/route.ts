

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { legalDocumentService } from '@/lib/services/legal-document-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/legal-documents/[id]/publish - Publish document
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { effectiveFrom } = body;

    const publishedDocument = await legalDocumentService.publishDocument(
      params.id,
      session.user?.email || 'system',
      effectiveFrom ? new Date(effectiveFrom) : undefined
    );

    return NextResponse.json({
      success: true,
      data: publishedDocument,
    });

  } catch (error) {
    console.error('Failed to publish document:', error);
    return NextResponse.json(
      { error: 'Failed to publish document' },
      { status: 500 }
    );
  }
}

