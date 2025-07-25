
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ComplianceStatus, ComplianceCheckType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * GET /api/audit/compliance - Get compliance status overview
 */
export async function GET(request: NextRequest) {
  try {
    // Simple auth check - in production, implement proper session validation
    const authHeader = request.headers.get('authorization');
    if (!authHeader && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get compliance audits summary
    const complianceAudits = await prisma.complianceAudit.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    // Calculate compliance metrics
    const totalChecks = complianceAudits.length;
    const compliantChecks = complianceAudits.filter(audit => 
      audit.status === 'COMPLIANT'
    ).length;
    const nonCompliantChecks = complianceAudits.filter(audit => 
      audit.status === 'NON_COMPLIANT'
    ).length;
    const pendingChecks = complianceAudits.filter(audit => 
      audit.status === 'PENDING'
    ).length;

    // Group by entity
    const byEntity = complianceAudits.reduce((acc, audit) => {
      if (!acc[audit.entity]) {
        acc[audit.entity] = {
          entity: audit.entity,
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          pending: 0,
        };
      }
      
      acc[audit.entity].total++;
      
      switch (audit.status) {
        case 'COMPLIANT':
          acc[audit.entity].compliant++;
          break;
        case 'NON_COMPLIANT':
          acc[audit.entity].nonCompliant++;
          break;
        case 'PENDING':
          acc[audit.entity].pending++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Get critical issues (non-compliant with missing required fields)
    const criticalIssues = complianceAudits
      .filter(audit => 
        audit.status === 'NON_COMPLIANT' && 
        audit.missingFields.length > 0
      )
      .map(audit => ({
        entityId: audit.entityId,
        entity: audit.entity,
        checkType: audit.checkType,
        missingFields: audit.missingFields,
        createdAt: audit.createdAt,
      }));

    // Get upcoming checks
    const upcomingChecks = complianceAudits
      .filter(audit => audit.nextCheckAt && audit.nextCheckAt > new Date())
      .sort((a, b) => 
        (a.nextCheckAt?.getTime() || 0) - (b.nextCheckAt?.getTime() || 0)
      )
      .slice(0, 10)
      .map(audit => ({
        entity: audit.entity,
        entityId: audit.entityId,
        checkType: audit.checkType,
        scheduledAt: audit.nextCheckAt,
      }));

    const response = {
      overview: {
        totalChecks,
        compliantChecks,
        nonCompliantChecks,
        pendingChecks,
        complianceRate: totalChecks > 0 ? (compliantChecks / totalChecks) * 100 : 0,
      },
      byEntity: Object.values(byEntity),
      criticalIssues,
      upcomingChecks,
      recentAudits: complianceAudits.slice(0, 10),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Failed to get compliance overview:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve compliance data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/compliance - Run compliance check
 */
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production, implement proper session validation
    const authHeader = request.headers.get('authorization');
    if (!authHeader && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entity, entityId, checkType } = body;

    if (!entity || !entityId || !checkType) {
      return NextResponse.json(
        { error: 'Missing required fields: entity, entityId, checkType' },
        { status: 400 }
      );
    }

    // Run compliance check based on entity type
    const checkResult = await runComplianceCheck(entity, entityId, checkType);
    
    // Create compliance audit record
    const complianceAudit = await prisma.complianceAudit.create({
      data: {
        entity,
        entityId,
        checkType,
        status: checkResult.status,
        requiredFields: checkResult.requiredFields,
        missingFields: checkResult.missingFields,
        validationErrors: checkResult.validationErrors,
        scheduledAt: new Date(),
        nextCheckAt: calculateNextCheckDate(checkType),
      },
    });

    return NextResponse.json({
      success: true,
      data: complianceAudit,
      checkResult,
    });

  } catch (error) {
    console.error('Failed to run compliance check:', error);
    return NextResponse.json(
      { error: 'Failed to run compliance check' },
      { status: 500 }
    );
  }
}

/**
 * Run compliance check for specific entity
 */
async function runComplianceCheck(
  entity: string, 
  entityId: string, 
  checkType: ComplianceCheckType
): Promise<{
  status: ComplianceStatus;
  requiredFields: string[];
  missingFields: string[];
  validationErrors?: Record<string, string>;
}> {
  const requiredFields = getRequiredFields(entity, checkType);
  const missingFields: string[] = [];
  const validationErrors: Record<string, string> = {};
  
  try {
    // Get entity data
    let entityData: any = null;
    
    switch (entity.toLowerCase()) {
      case 'userprofile':
        entityData = await prisma.userProfile.findUnique({
          where: { id: entityId },
        });
        break;
      case 'creditor':
        entityData = await prisma.creditor.findUnique({
          where: { id: entityId },
        });
        break;
      case 'client':
        entityData = await prisma.client.findUnique({
          where: { id: entityId },
        });
        break;
      case 'invoice':
        entityData = await prisma.invoice.findUnique({
          where: { id: entityId },
        });
        break;
      default:
        throw new Error(`Unsupported entity type: ${entity}`);
    }

    if (!entityData) {
      return {
        status: 'NON_COMPLIANT',
        requiredFields,
        missingFields: requiredFields,
        validationErrors: { entity: 'Entity not found' },
      };
    }

    // Check required fields
    for (const field of requiredFields) {
      if (!entityData[field] || entityData[field] === '') {
        missingFields.push(field);
      }
    }

    // Validate field formats
    if (entityData.kvkNumber && !/^\d{8}$/.test(entityData.kvkNumber)) {
      validationErrors.kvkNumber = 'KvK number must be 8 digits';
    }

    if (entityData.iban && !isValidIBAN(entityData.iban)) {
      validationErrors.iban = 'Invalid IBAN format';
    }

    if (entityData.email && !isValidEmail(entityData.email)) {
      validationErrors.email = 'Invalid email format';
    }

    // Determine compliance status
    const status: ComplianceStatus = 
      missingFields.length === 0 && Object.keys(validationErrors).length === 0
        ? 'COMPLIANT'
        : 'NON_COMPLIANT';

    return {
      status,
      requiredFields,
      missingFields,
      validationErrors: Object.keys(validationErrors).length > 0 ? validationErrors : undefined,
    };

  } catch (error) {
    console.error('Compliance check failed:', error);
    return {
      status: 'NON_COMPLIANT',
      requiredFields,
      missingFields: requiredFields,
      validationErrors: { error: 'Compliance check failed' },
    };
  }
}

/**
 * Get required fields for entity compliance
 */
function getRequiredFields(entity: string, checkType: ComplianceCheckType): string[] {
  const fieldMappings: Record<string, Record<string, string[]>> = {
    userprofile: {
      MANDATORY_FIELDS: ['companyName', 'kvkNumber', 'vatNumber', 'phone', 'address', 'postalCode', 'city', 'iban', 'bankName', 'accountHolder'],
      DATA_VALIDATION: ['kvkNumber', 'vatNumber', 'iban'],
      BUSINESS_RULES: ['companyName', 'businessType'],
    },
    creditor: {
      MANDATORY_FIELDS: ['name', 'email', 'phone', 'companyName', 'kvkNumber', 'vatNumber', 'address', 'postalCode', 'city', 'iban', 'bankName', 'accountHolder'],
      DATA_VALIDATION: ['kvkNumber', 'vatNumber', 'iban', 'email'],
      BUSINESS_RULES: ['companyName', 'validationStatus'],
    },
    client: {
      MANDATORY_FIELDS: ['name', 'email', 'phone'],
      DATA_VALIDATION: ['email'],
      BUSINESS_RULES: ['name'],
    },
    invoice: {
      MANDATORY_FIELDS: ['invoiceNumber', 'amount', 'btwAmount', 'totalAmount', 'btwRate', 'dueDate', 'description'],
      DATA_VALIDATION: ['amount', 'btwAmount', 'totalAmount', 'btwRate'],
      BUSINESS_RULES: ['status', 'dueDate'],
    },
  };

  return fieldMappings[entity.toLowerCase()]?.[checkType] || [];
}

/**
 * Calculate next check date based on check type
 */
function calculateNextCheckDate(checkType: any): Date {
  const now = new Date();
  const intervals: Record<string, number> = {
    MANDATORY_FIELDS: 7, // days
    DATA_VALIDATION: 14,
    BUSINESS_RULES: 30,
    REGULATORY: 90,
    RETENTION_POLICY: 365,
    PERIODIC_REVIEW: 180,
  };

  const days = intervals[checkType] || 30;
  now.setDate(now.getDate() + days);
  return now;
}

/**
 * Validate IBAN format (simplified)
 */
function isValidIBAN(iban: string): boolean {
  return /^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(iban.replace(/\s/g, ''));
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
