

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { legalDocumentService } from '@/lib/services/legal-document-service';
import { LegalDocumentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/legal-documents - Get legal documents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as LegalDocumentType | null;
    const language = searchParams.get('language') || 'nl';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (activeOnly) {
      const documents = await legalDocumentService.getActiveDocuments({
        type: type || undefined,
        language,
      });

      return NextResponse.json({
        success: true,
        data: documents,
      });
    }

    // Get all documents (admin function)
    // In production, add proper admin role check
    const documents = await legalDocumentService.getActiveDocuments({
      type: type || undefined,
      language,
    });

    return NextResponse.json({
      success: true,
      data: documents,
    });

  } catch (error) {
    console.error('Failed to get legal documents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve legal documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/legal-documents - Create legal document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, add proper admin role check
    const body = await request.json();
    const {
      type,
      title,
      description,
      content,
      language,
      templateData,
      jurisdiction,
      legalBasis,
      complianceStandard,
    } = body;

    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, content' },
        { status: 400 }
      );
    }

    const document = await legalDocumentService.createDocument({
      type,
      title,
      description,
      content,
      language,
      templateData,
      jurisdiction,
      legalBasis,
      complianceStandard,
      approvedBy: session.user?.email,
    });

    return NextResponse.json({
      success: true,
      data: document,
    });

  } catch (error) {
    console.error('Failed to create legal document:', error);
    return NextResponse.json(
      { error: 'Failed to create legal document' },
      { status: 500 }
    );
  }
}

