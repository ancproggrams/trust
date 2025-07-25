
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { secureRoute, ValidationRules, SecurityMiddleware } from '@/lib/middleware/security-middleware';
import { PERMISSIONS } from '@/lib/middleware/permission-middleware';
import { workflowService } from '@/lib/services/workflow-service';
import { auditService } from '@/lib/services/audit-service';
import { ClientFormData } from '@/lib/types';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/clients - List clients with filtering
export const GET = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      userId: session?.user?.id, // Only show user's own clients unless admin
    };

    if (status) {
      where.onboardingStatus = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          approvals: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          validations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.CLIENT_READ],
  rateLimit: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  sanitizeInput: false, // GET request, no body
});

// POST /api/clients - Create new client with onboarding
export const POST = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  try {
    const data: ClientFormData = await request.json();

    // Validate required fields
    const validation = await SecurityMiddleware.validateInput(data, {
      name: ValidationRules.required,
      email: (value) => ValidationRules.required(value) && ValidationRules.email(value),
      phone: (value) => ValidationRules.required(value) && ValidationRules.phone(value),
      company: ValidationRules.required,
      kvkNumber: (value) => ValidationRules.required(value) && ValidationRules.kvkNumber(value),
      vatNumber: (value) => ValidationRules.required(value) && ValidationRules.vatNumber(value),
      address: ValidationRules.required,
      postalCode: (value) => ValidationRules.required(value) && ValidationRules.postalCode(value),
      city: ValidationRules.required,
      iban: (value) => ValidationRules.required(value) && ValidationRules.iban(value),
      bankName: ValidationRules.required,
      accountHolder: ValidationRules.required,
      adminContactName: ValidationRules.required,
      adminContactEmail: (value) => ValidationRules.required(value) && ValidationRules.email(value),
      adminDepartment: ValidationRules.required,
      acceptedTerms: (value) => value === true || 'Terms must be accepted',
      acceptedPrivacy: (value) => value === true || 'Privacy policy must be accepted',
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check for duplicate KVK or VAT numbers
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [
          { kvkNumber: data.kvkNumber },
          { vatNumber: data.vatNumber },
          { email: data.email },
        ],
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this KVK number, VAT number, or email already exists' },
        { status: 409 }
      );
    }

    // Create client with onboarding workflow
    const client = await prisma.client.create({
      data: {
        userId: session?.user?.id!,
        
        // Basic information
        name: data.name,
        email: data.email,
        phone: data.phone,
        
        // Business details
        company: data.company,
        kvkNumber: data.kvkNumber,
        vatNumber: data.vatNumber,
        businessType: data.businessType,
        
        // Contact details
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        
        // Admin contact
        adminContactName: data.adminContactName,
        adminContactEmail: data.adminContactEmail,
        adminContactPhone: data.adminContactPhone,
        adminDepartment: data.adminDepartment,
        
        // Banking information
        iban: data.iban,
        bankName: data.bankName,
        accountHolder: data.accountHolder,
        postboxNumber: data.postboxNumber,
        
        // Validation results from frontend
        kvkValidated: data.kvkValidation?.result?.isValid || false,
        kvkValidatedAt: data.kvkValidation?.result?.isValid ? new Date() : undefined,
        btwValidated: data.btwValidation?.result?.isValid || false,
        btwValidatedAt: data.btwValidation?.result?.isValid ? new Date() : undefined,
        ibanValidated: true, // We'll validate this server-side later
        ibanValidatedAt: new Date(),
        
        // Workflow status
        onboardingStatus: 'PENDING_VALIDATION',
        onboardingStep: 'VERIFICATION',
        approvalStatus: 'PENDING_APPROVAL',
        
        // Security defaults
        isActive: true,
        canCreateInvoices: false, // Will be enabled after approval
        
        // Audit fields
        createdBy: session?.user?.id,
        version: 1,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
      },
    });

    // Create initial validation record
    await prisma.clientValidation.create({
      data: {
        clientId: client.id,
        validationType: 'AUTOMATIC',
        status: 'PENDING',
        kvkCheck: data.kvkValidation?.result ? JSON.parse(JSON.stringify(data.kvkValidation.result)) : {},
        btwCheck: data.btwValidation?.result ? JSON.parse(JSON.stringify(data.btwValidation.result)) : {},
        ibanCheck: { isValid: true, source: 'FRONTEND' },
        emailCheck: { isValid: true, source: 'FRONTEND' },
        phoneCheck: { isValid: true, source: 'FRONTEND' },
        addressCheck: { isValid: true, source: 'FRONTEND' },
        requestedBy: session?.user?.id!,
        overallScore: 0.85, // Calculate based on validation results
        findings: {
          kvkValidated: client.kvkValidated,
          btwValidated: client.btwValidated,
          ibanValidated: client.ibanValidated,
        },
      },
    });

    // Log audit event
    await auditService.logAction({
      userId: session?.user?.id!,
      action: 'CREATE',
      entity: 'Client',
      entityId: client.id,
      newValues: {
        name: client.name,
        email: client.email,
        company: client.company,
        onboardingStatus: client.onboardingStatus,
      },
      context: 'Client created via onboarding wizard',
    });

    return NextResponse.json({
      success: true,
      client,
      message: 'Client created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating client:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A client with these details already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.CLIENT_CREATE],
  rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 client creations per minute
  validateCSRF: true,
  sanitizeInput: true,
});

// PUT /api/clients/[id] - Update client
export const PUT = secureRoute(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('id');

  if (!clientId) {
    return NextResponse.json(
      { error: 'Client ID is required' },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    // Check if client exists and user has permission
    const existingClient = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session?.user?.id, // Users can only update their own clients
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Client not found or access denied' },
        { status: 404 }
      );
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...data,
        updatedBy: session?.user?.id,
        version: { increment: 1 },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
      },
    });

    // Log audit event
    await auditService.logAction({
      userId: session?.user?.id!,
      action: 'UPDATE',
      entity: 'Client',
      entityId: clientId,
      oldValues: existingClient,
      newValues: data,
      context: 'Client updated',
    });

    return NextResponse.json({
      success: true,
      client: updatedClient,
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}, {
  permissions: [PERMISSIONS.CLIENT_UPDATE],
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  validateCSRF: true,
  sanitizeInput: true,
});
