
import { PrismaClient } from '@prisma/client';
import { 
  Client, 
  ClientOnboardingStatus, 
  ClientApprovalStatus, 
  OnboardingStep,
  WorkflowState,
  EmailTemplateData,
  ValidationStatus
} from '@/lib/types';
import { emailService } from './email-service';
import { auditService } from './audit-service';

const prisma = new PrismaClient();

export class WorkflowService {
  private static instance: WorkflowService;

  private constructor() {}

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  /**
   * Process client onboarding step and trigger appropriate workflows
   */
  public async processOnboardingStep(
    clientId: string,
    step: OnboardingStep,
    userId: string,
    validationResults?: Record<string, any>
  ): Promise<WorkflowState> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          user: true,
        },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Update client step
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          onboardingStep: step,
          updatedAt: new Date(),
        },
      });

      // Process step-specific logic
      switch (step) {
        case 'BUSINESS_DETAILS':
          return await this.handleBusinessDetailsStep(client, validationResults);
        
        case 'BANKING_INFO':
          return await this.handleBankingInfoStep(client, validationResults);
        
        case 'VERIFICATION':
          return await this.handleVerificationStep(client, userId);
        
        case 'COMPLETED':
          return await this.handleCompletedStep(client, userId);
        
        default:
          return this.getWorkflowState(updatedClient as any);
      }
    } catch (error) {
      console.error('Error processing onboarding step:', error);
      throw error;
    }
  }

  private async handleBusinessDetailsStep(
    client: any,
    validationResults?: Record<string, any>
  ): Promise<WorkflowState> {
    // Validate KVK and BTW if provided
    if (validationResults?.kvk?.isValid) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          kvkValidated: true,
          kvkValidatedAt: new Date(),
        },
      });
    }

    if (validationResults?.btw?.isValid) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          btwValidated: true,
          btwValidatedAt: new Date(),
        },
      });
    }

    return this.getWorkflowState(client);
  }

  private async handleBankingInfoStep(
    client: any,
    validationResults?: Record<string, any>
  ): Promise<WorkflowState> {
    // Validate IBAN if provided
    if (validationResults?.iban?.isValid) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          ibanValidated: true,
          ibanValidatedAt: new Date(),
        },
      });
    }

    return this.getWorkflowState(client);
  }

  private async handleVerificationStep(
    client: any,
    userId: string
  ): Promise<WorkflowState> {
    // Send confirmation email
    await this.sendClientConfirmationEmail(client);

    // Update status
    await prisma.client.update({
      where: { id: client.id },
      data: {
        onboardingStatus: 'EMAIL_SENT',
      },
    });

    // Log audit event
    await auditService.logAction({
      userId,
      action: 'STATUS_CHANGE',
      entity: 'Client',
      entityId: client.id,
      newValues: { onboardingStatus: 'EMAIL_SENT' },
      context: 'Client confirmation email sent',
    });

    return this.getWorkflowState(client);
  }

  private async handleCompletedStep(
    client: any,
    userId: string
  ): Promise<WorkflowState> {
    // Mark onboarding as completed and ready for admin review
    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        onboardingCompletedAt: new Date(),
        onboardingStatus: 'ADMIN_REVIEW',
        approvalStatus: 'PENDING_APPROVAL',
      },
    });

    // Create approval record
    await prisma.clientApproval.create({
      data: {
        clientId: client.id,
        status: 'PENDING_APPROVAL',
        requestedBy: userId,
        workflowStep: 'ADMIN_REVIEW',
        priority: 'NORMAL',
        validationChecks: {
          kvkValidated: client.kvkValidated,
          btwValidated: client.btwValidated,
          ibanValidated: client.ibanValidated,
          emailConfirmed: client.emailConfirmed,
        },
      },
    });

    // Notify admins
    await this.notifyAdminsOfPendingApproval(client);

    // Log audit event
    await auditService.logAction({
      userId,
      action: 'STATUS_CHANGE',
      entity: 'Client',
      entityId: client.id,
      newValues: { 
        onboardingStatus: 'ADMIN_REVIEW',
        approvalStatus: 'PENDING_APPROVAL'
      },
      context: 'Client onboarding completed, pending admin approval',
    });

    return this.getWorkflowState(updatedClient as any);
  }

  /**
   * Approve client and grant invoice permissions
   */
  public async approveClient(
    clientId: string,
    adminUserId: string,
    approvalNotes?: string
  ): Promise<void> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { user: true },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Update client status
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: adminUserId,
          approvalNotes,
          onboardingStatus: 'APPROVED',
          canCreateInvoices: true,
          invoicePermissionGrantedAt: new Date(),
          invoicePermissionGrantedBy: adminUserId,
          isActive: true,
        },
      });

      // Update approval record
      await prisma.clientApproval.updateMany({
        where: { 
          clientId,
          status: 'PENDING_APPROVAL'
        },
        data: {
          status: 'APPROVED',
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          approvalNotes,
        },
      });

      // Send approval notification email
      await this.sendApprovalNotificationEmail(updatedClient as any, approvalNotes);

      // Log audit event
      await auditService.logAction({
        userId: adminUserId,
        action: 'APPROVE',
        entity: 'Client',
        entityId: clientId,
        newValues: {
          approvalStatus: 'APPROVED',
          canCreateInvoices: true,
          approvalNotes,
        },
        context: 'Client approved by admin',
      });

    } catch (error) {
      console.error('Error approving client:', error);
      throw error;
    }
  }

  /**
   * Reject client with reason
   */
  public async rejectClient(
    clientId: string,
    adminUserId: string,
    rejectionReason: string
  ): Promise<void> {
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { user: true },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      // Update client status
      const updatedClient = await prisma.client.update({
        where: { id: clientId },
        data: {
          approvalStatus: 'REJECTED',
          rejectionReason,
          onboardingStatus: 'REJECTED',
          canCreateInvoices: false,
        },
      });

      // Update approval record
      await prisma.clientApproval.updateMany({
        where: { 
          clientId,
          status: 'PENDING_APPROVAL'
        },
        data: {
          status: 'REJECTED',
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          rejectionReason,
        },
      });

      // Send rejection notification email
      await this.sendRejectionNotificationEmail(updatedClient as any, rejectionReason);

      // Log audit event
      await auditService.logAction({
        userId: adminUserId,
        action: 'REJECT',
        entity: 'Client',
        entityId: clientId,
        newValues: {
          approvalStatus: 'REJECTED',
          rejectionReason,
        },
        context: 'Client rejected by admin',
      });

    } catch (error) {
      console.error('Error rejecting client:', error);
      throw error;
    }
  }

  /**
   * Get current workflow state for a client
   */
  public async getWorkflowState(client: any): Promise<WorkflowState> {
    const completedSteps: OnboardingStep[] = [];
    const validationResults = {
      kvk: client.kvkValidated || false,
      btw: client.btwValidated || false,
      iban: client.ibanValidated || false,
      email: client.emailConfirmed || false,
      phone: !!client.phone,
    };

    // Determine completed steps based on client data
    if (client.name && client.email && client.phone) {
      completedSteps.push('BASIC_INFO');
    }
    if (client.company && client.kvkNumber) {
      completedSteps.push('BUSINESS_DETAILS');
    }
    if (client.iban && client.bankName) {
      completedSteps.push('BANKING_INFO');
    }
    if (client.emailConfirmed) {
      completedSteps.push('VERIFICATION');
    }
    if (client.onboardingCompletedAt) {
      completedSteps.push('COMPLETED');
    }

    // Determine blockers
    const blockers: string[] = [];
    if (!validationResults.kvk && client.kvkNumber) {
      blockers.push('KVK validation required');
    }
    if (!validationResults.btw && client.vatNumber) {
      blockers.push('BTW validation required');
    }
    if (!validationResults.iban && client.iban) {
      blockers.push('IBAN validation required');
    }
    if (!validationResults.email) {
      blockers.push('Email confirmation required');
    }

    // Determine next action
    let nextAction = 'Complete current onboarding step';
    if (client.onboardingStatus === 'EMAIL_SENT') {
      nextAction = 'Await email confirmation';
    } else if (client.onboardingStatus === 'ADMIN_REVIEW') {
      nextAction = 'Await admin approval';
    } else if (client.approvalStatus === 'APPROVED') {
      nextAction = 'Account ready for use';
    }

    return {
      clientId: client.id,
      currentStep: client.onboardingStep,
      completedSteps,
      validationResults,
      requiresAdminReview: client.onboardingStatus === 'ADMIN_REVIEW',
      blockers,
      nextAction,
      estimatedCompletion: this.calculateEstimatedCompletion(client, blockers.length),
    };
  }

  private calculateEstimatedCompletion(client: any, blockerCount: number): Date | undefined {
    if (client.approvalStatus === 'APPROVED') return undefined;
    
    const now = new Date();
    const hoursToAdd = blockerCount * 24 + 48; // Base 48 hours + 24 per blocker
    return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
  }

  private async sendClientConfirmationEmail(client: any): Promise<void> {
    const confirmationToken = await this.generateConfirmationToken(client.id);
    const templateData: EmailTemplateData = {
      clientName: client.name,
      companyName: client.company || '',
      confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${confirmationToken}`,
      adminContactName: client.adminContactName || client.name,
      adminContactEmail: client.adminContactEmail || client.email,
      supportEmail: 'support@trust.io',
      supportPhone: '+31 20 123 4567',
      platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://trust.io',
      brandName: 'Trust.io',
    };

    await emailService.sendEmail(
      'CLIENT_CONFIRMATION',
      client.email,
      templateData,
      client.id,
      'nl'
    );
  }

  private async notifyAdminsOfPendingApproval(client: any): Promise<void> {
    // Get admin users (in production, this would query actual admin users)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trust.io';
    
    const templateData: EmailTemplateData = {
      clientName: client.name,
      companyName: client.company || '',
      adminContactEmail: client.adminContactEmail || client.email,
      adminContactName: client.adminContactName || client.name,
      kvkNumber: client.kvkNumber || '',
      vatNumber: client.vatNumber || '',
      clientId: client.id,
      supportEmail: 'support@trust.io',
      supportPhone: '+31 20 123 4567',
      platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://trust.io',
      brandName: 'Trust.io',
    };

    await emailService.sendEmail(
      'ADMIN_NOTIFICATION',
      adminEmail,
      templateData,
      client.id,
      'nl'
    );
  }

  private async sendApprovalNotificationEmail(client: any, approvalNotes?: string): Promise<void> {
    const templateData: EmailTemplateData = {
      clientName: client.name,
      companyName: client.company || '',
      adminContactName: client.adminContactName || client.name,
      adminContactEmail: client.adminContactEmail || client.email,
      approvalNotes: approvalNotes || '',
      supportEmail: 'support@trust.io',
      supportPhone: '+31 20 123 4567',
      platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://trust.io',
      brandName: 'Trust.io',
    };

    await emailService.sendEmail(
      'APPROVAL_NOTIFICATION',
      client.email,
      templateData,
      client.id,
      'nl'
    );
  }

  private async sendRejectionNotificationEmail(client: any, rejectionReason: string): Promise<void> {
    const confirmationToken = await this.generateConfirmationToken(client.id);
    
    const templateData: EmailTemplateData = {
      clientName: client.name,
      companyName: client.company || '',
      adminContactName: client.adminContactName || client.name,
      adminContactEmail: client.adminContactEmail || client.email,
      rejectionReason,
      confirmationToken,
      supportEmail: 'support@trust.io',
      supportPhone: '+31 20 123 4567',
      platformUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://trust.io',
      brandName: 'Trust.io',
    };

    await emailService.sendEmail(
      'REJECTION_NOTIFICATION',
      client.email,
      templateData,
      client.id,
      'nl'
    );
  }

  private async generateConfirmationToken(clientId: string): Promise<string> {
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.client.update({
      where: { id: clientId },
      data: {
        emailConfirmationToken: token,
        emailConfirmationExpiresAt: expiresAt,
      },
    });

    return token;
  }
}

export const workflowService = WorkflowService.getInstance();
