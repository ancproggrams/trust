

import { PrismaClient } from '@prisma/client';
import { 
  LegalDocumentType,
  DocumentStatus,
  LegalDocument,
  ClientConsent,
  ConsentType,
  GDPRLegalBasis,
  ConsentStatus
} from '@/lib/types';
import { auditService } from './audit-service';

const prisma = new PrismaClient();

export class LegalDocumentService {
  private static instance: LegalDocumentService;

  private constructor() {}

  public static getInstance(): LegalDocumentService {
    if (!LegalDocumentService.instance) {
      LegalDocumentService.instance = new LegalDocumentService();
    }
    return LegalDocumentService.instance;
  }

  /**
   * Create a new legal document
   */
  async createDocument(data: {
    type: LegalDocumentType;
    title: string;
    description?: string;
    content: string;
    language?: string;
    templateData?: Record<string, any>;
    jurisdiction?: string;
    legalBasis?: string;
    complianceStandard?: string[];
    approvedBy?: string;
  }): Promise<LegalDocument> {
    try {
      const document = await prisma.legalDocument.create({
        data: {
          type: data.type,
          title: data.title,
          description: data.description,
          content: data.content,
          language: data.language || 'nl',
          templateData: data.templateData || undefined,
          jurisdiction: data.jurisdiction || 'Netherlands',
          legalBasis: data.legalBasis,
          complianceStandard: data.complianceStandard || [],
          status: 'DRAFT',
          effectiveFrom: new Date(),
          approvedBy: data.approvedBy,
          approvedAt: data.approvedBy ? new Date() : undefined,
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'LegalDocument',
        entityId: document.id,
        newValues: data,
      });

      return document as LegalDocument;
    } catch (error) {
      console.error('Failed to create legal document:', error);
      throw error;
    }
  }

  /**
   * Get active legal documents
   */
  async getActiveDocuments(filters?: {
    type?: LegalDocumentType;
    language?: string;
  }): Promise<LegalDocument[]> {
    try {
      const where: any = {
        status: 'PUBLISHED',
        effectiveFrom: { lte: new Date() },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      };

      if (filters?.type) {
        where.type = filters.type;
      }

      if (filters?.language) {
        where.language = filters.language;
      }

      const documents = await prisma.legalDocument.findMany({
        where,
        orderBy: { version: 'desc' },
      });

      return documents as LegalDocument[];
    } catch (error) {
      console.error('Failed to get active documents:', error);
      throw error;
    }
  }

  /**
   * Get document by ID with version history
   */
  async getDocumentWithHistory(id: string): Promise<{
    document: LegalDocument;
    versions: LegalDocument[];
  }> {
    try {
      const document = await prisma.legalDocument.findUnique({
        where: { id },
        include: {
          signatures: true,
          consents: true,
        },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Get all versions of this document
      const versions = await prisma.legalDocument.findMany({
        where: {
          OR: [
            { id: document.id },
            { parentVersion: document.id },
            { parentVersion: document.parentVersion || '' }
          ]
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        document: document as LegalDocument,
        versions: versions as LegalDocument[],
      };
    } catch (error) {
      console.error('Failed to get document with history:', error);
      throw error;
    }
  }

  /**
   * Publish a legal document (make it active)
   */
  async publishDocument(
    documentId: string,
    publishedBy: string,
    effectiveFrom?: Date
  ): Promise<LegalDocument> {
    try {
      const document = await prisma.legalDocument.update({
        where: { id: documentId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          effectiveFrom: effectiveFrom || new Date(),
          approvedBy: publishedBy,
          approvedAt: new Date(),
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'LegalDocument',
        entityId: documentId,
        newValues: { status: 'PUBLISHED', publishedBy },
      });

      return document as LegalDocument;
    } catch (error) {
      console.error('Failed to publish document:', error);
      throw error;
    }
  }

  /**
   * Create new version of a document
   */
  async createNewVersion(
    parentDocumentId: string,
    updates: {
      content: string;
      changeReason: string;
      templateData?: Record<string, any>;
    },
    versionedBy: string
  ): Promise<LegalDocument> {
    try {
      const parentDocument = await prisma.legalDocument.findUnique({
        where: { id: parentDocumentId },
      });

      if (!parentDocument) {
        throw new Error('Parent document not found');
      }

      // Parse current version and increment
      const currentVersion = parseFloat(parentDocument.version);
      const newVersion = (currentVersion + 0.1).toFixed(1);

      const newDocument = await prisma.legalDocument.create({
        data: {
          type: parentDocument.type,
          title: parentDocument.title,
          description: parentDocument.description,
          content: updates.content,
          version: newVersion,
          language: parentDocument.language,
          templateData: updates.templateData || parentDocument.templateData || undefined,
          jurisdiction: parentDocument.jurisdiction,
          legalBasis: parentDocument.legalBasis,
          complianceStandard: parentDocument.complianceStandard,
          parentVersion: parentDocumentId,
          changeReason: updates.changeReason,
          status: 'DRAFT',
          effectiveFrom: new Date(),
          approvedBy: versionedBy,
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'LegalDocument',
        entityId: newDocument.id,
        newValues: { ...updates, parentVersion: parentDocumentId },
      });

      return newDocument as LegalDocument;
    } catch (error) {
      console.error('Failed to create new document version:', error);
      throw error;
    }
  }

  /**
   * Record client consent for a document
   */
  async recordConsent(data: {
    clientId?: string;
    userId?: string;
    documentId: string;
    consentType: ConsentType;
    purpose: string;
    legalBasis: GDPRLegalBasis;
    dataCategories: string[];
    retentionPeriod?: number;
    thirdPartySharing?: boolean;
    thirdParties?: string[];
    ipAddress?: string;
    userAgent?: string;
    evidence?: Record<string, any>;
  }): Promise<ClientConsent> {
    try {
      const consent = await prisma.clientConsent.create({
        data: {
          clientId: data.clientId,
          userId: data.userId,
          documentId: data.documentId,
          consentType: data.consentType,
          purpose: data.purpose,
          legalBasis: data.legalBasis,
          status: 'GIVEN',
          givenAt: new Date(),
          dataCategories: data.dataCategories,
          retentionPeriod: data.retentionPeriod,
          thirdPartySharing: data.thirdPartySharing || false,
          thirdParties: data.thirdParties || [],
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          method: 'WEB_FORM',
          evidence: data.evidence,
          auditTrail: {
            givenAt: new Date(),
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          },
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'ClientConsent',
        entityId: consent.id,
        newValues: data,
      });

      return consent as ClientConsent;
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(
    consentId: string,
    reason?: string,
    ipAddress?: string
  ): Promise<ClientConsent> {
    try {
      const consent = await prisma.clientConsent.update({
        where: { id: consentId },
        data: {
          status: 'WITHDRAWN',
          withdrawnAt: new Date(),
          auditTrail: {
            withdrawnAt: new Date(),
            withdrawalReason: reason,
            ipAddress,
          },
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'ClientConsent',
        entityId: consentId,
        newValues: { status: 'WITHDRAWN', reason },
      });

      return consent as ClientConsent;
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      throw error;
    }
  }

  /**
   * Get client consents
   */
  async getClientConsents(clientId: string): Promise<ClientConsent[]> {
    try {
      const consents = await prisma.clientConsent.findMany({
        where: { clientId },
        include: {
          document: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return consents as ClientConsent[];
    } catch (error) {
      console.error('Failed to get client consents:', error);
      throw error;
    }
  }

  /**
   * Check if client has valid consent for specific purpose
   */
  async hasValidConsent(
    clientId: string,
    documentType: LegalDocumentType,
    purpose: string
  ): Promise<boolean> {
    try {
      const consent = await prisma.clientConsent.findFirst({
        where: {
          clientId,
          purpose,
          status: 'GIVEN',
          document: {
            type: documentType,
            status: 'PUBLISHED',
          },
          OR: [
            { expiredAt: null },
            { expiredAt: { gt: new Date() } }
          ]
        },
      });

      return !!consent;
    } catch (error) {
      console.error('Failed to check consent:', error);
      return false;
    }
  }
}

export const legalDocumentService = LegalDocumentService.getInstance();

