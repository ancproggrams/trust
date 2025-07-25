
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute } from '@/lib/middleware/security-middleware';
import { PERMISSIONS } from '@/lib/middleware/permission-middleware';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/clients/[id] - Get single client
export const GET = secureRoute(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  const clientId = params.id;

  try {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session?.user?.id, // Users can only access their own clients
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        approvals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        validations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        emailLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      client,
    });

  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.CLIENT_READ],
  rateLimit: { maxRequests: 200, windowMs: 60000 },
});
