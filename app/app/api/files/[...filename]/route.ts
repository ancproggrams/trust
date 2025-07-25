
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

export const dynamic = 'force-dynamic';

// GET /api/files/[...filename] - Serve uploaded files with security
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  const session = await getServerSession(authOptions);
  
  try {
    // Build file path
    const filename = params.filename.join('/');
    const filePath = join(process.cwd(), 'uploads', filename);
    
    // Security: Only allow authenticated users
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security: Only allow files from uploads directory
    if (!filePath.startsWith(join(process.cwd(), 'uploads'))) {
      return NextResponse.json(
        { error: 'File access denied' },
        { status: 403 }
      );
    }

    // Check if it's an invoice PDF
    if (filename.startsWith('invoices/') && filename.endsWith('.pdf')) {
      // Verify user has access to this invoice PDF
      const invoiceNumber = filename.split('/').pop()?.replace('.pdf', '');
      
      if (invoiceNumber) {
        const prisma = new (require('@prisma/client').PrismaClient)();
        const invoice = await prisma.invoice.findFirst({
          where: {
            invoiceNumber: invoiceNumber,
            userId: session.user.id,
          },
          select: { id: true, invoiceNumber: true },
        });

        if (!invoice) {
          return NextResponse.json(
            { error: 'Invoice not found or access denied' },
            { status: 404 }
          );
        }

        // Log file access
        await auditService.logAction({
          userId: session.user.id,
          action: 'READ' as any,
          entity: 'InvoicePDF',
          entityId: invoice.id,
          context: `PDF file accessed: ${filename}`,
        });
      }
    }

    // Read file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    const contentType = getContentType(filename);
    
    // Create response with proper headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
        'Content-Disposition': `inline; filename="${params.filename[params.filename.length - 1]}"`,
      },
    });

    return response;

  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}
