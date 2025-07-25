
import { NextRequest, NextResponse } from 'next/server';
import { getAuditTrail } from '../../../../lib/services/audit-service';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * GET /api/audit/trail - Get audit trail for an entity
 * Query params: entity, entityId, limit, userId, action, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, implement proper session validation
    const authHeader = request.headers.get('authorization');
    if (!authHeader && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const where: any = {};
    
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Get audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format response
    const formattedLogs = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      user: log.user ? {
        id: log.user.id,
        name: log.user.name,
        email: log.user.email,
      } : null,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      immudbVerified: log.immudbVerified,
      immudbTxId: log.immudbTxId,
      complianceLevel: log.complianceLevel,
      timestamp: log.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      total: formattedLogs.length,
    });

  } catch (error) {
    console.error('Failed to get audit trail:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve audit trail' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/trail - Create manual audit entry
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production, implement proper session validation
    const authHeader = request.headers.get('authorization');
    if (!authHeader && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, entity, entityId, description, metadata } = body;

    if (!action || !entity || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, entity, entityId' },
        { status: 400 }
      );
    }

    // Import audit service
    const { logAuditEvent } = await import('../../../../lib/services/audit-service');
    
    // Log manual audit event
    const auditId = await logAuditEvent({
      action,
      entity,
      entityId,
      newValues: {
        description,
        metadata,
        manualEntry: true,
      },
      context: {
        userId: 'system', // In production, get from proper session
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    if (!auditId) {
      return NextResponse.json(
        { error: 'Failed to create audit entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      auditId,
      message: 'Audit entry created successfully',
    });

  } catch (error) {
    console.error('Failed to create audit entry:', error);
    return NextResponse.json(
      { error: 'Failed to create audit entry' },
      { status: 500 }
    );
  }
}
