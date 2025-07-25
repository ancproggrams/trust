

import { PrismaClient } from '@prisma/client';
import { 
  ESignature,
  SignatureVerification,
  LegalDocument,
  SignatureType,
  SignatureStatus,
  VerificationType,
  VerificationResult,
  ComplianceLevel
} from '@/lib/types';
import { auditService } from './audit-service';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class ESignatureService {
  private static instance: ESignatureService;

  private constructor() {}

  public static getInstance(): ESignatureService {
    if (!ESignatureService.instance) {
      ESignatureService.instance = new ESignatureService();
    }
    return ESignatureService.instance;
  }

  /**
   * Create a new digital signature
   */
  async createSignature(data: {
    documentId: string;
    signerEmail: string;
    signerName: string;
    signerRole?: string;
    signatureData: string; // Base64 encoded signature
    signatureType: SignatureType;
    ipAddress: string;
    userAgent?: string;
    location?: string;
    witnessedBy?: string;
    complianceLevel?: ComplianceLevel;
  }): Promise<ESignature> {
    try {
      // Get document for hash calculation
      const document = await prisma.legalDocument.findUnique({
        where: { id: data.documentId },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Generate document hash for integrity verification
      const documentHash = this.generateDocumentHash(document.content);
      
      // Generate unique verification code
      const verificationCode = this.generateVerificationCode();

      // Create signature record
      const signature = await prisma.eSignature.create({
        data: {
          documentId: data.documentId,
          signerEmail: data.signerEmail,
          signerName: data.signerName,
          signerRole: data.signerRole,
          signatureData: data.signatureData,
          signatureType: data.signatureType,
          timestamp: new Date(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          location: data.location,
          hashValue: documentHash,
          verificationCode,
          status: 'PENDING',
          witnessedBy: data.witnessedBy,
          witnessedAt: data.witnessedBy ? new Date() : undefined,
          complianceLevel: (data.complianceLevel as any) || 'STANDARD',
          auditTrail: {
            created: {
              timestamp: new Date(),
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
              location: data.location,
            }
          },
        },
      });

      // Complete the signature immediately for now
      // In production, this might involve additional verification steps
      const completedSignature = await this.completeSignature(
        signature.id,
        data.ipAddress
      );

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'ESignature',
        entityId: signature.id,
        newValues: data,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      return completedSignature;

    } catch (error) {
      console.error('Failed to create signature:', error);
      throw error;
    }
  }

  /**
   * Complete a signature (mark as signed)
   */
  async completeSignature(
    signatureId: string,
    ipAddress: string
  ): Promise<ESignature> {
    try {
      const signature = await prisma.eSignature.update({
        where: { id: signatureId },
        data: {
          status: 'SIGNED',
          signedAt: new Date(),
          auditTrail: {
            completed: {
              timestamp: new Date(),
              ipAddress,
            }
          },
        },
        include: {
          document: true,
          verifications: true,
        },
      });

      // Create initial verification record
      await this.verifySignature(signatureId, 'HASH_VERIFICATION');

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'ESignature',
        entityId: signatureId,
        newValues: { status: 'SIGNED' },
        ipAddress,
      });

      return signature as ESignature;

    } catch (error) {
      console.error('Failed to complete signature:', error);
      throw error;
    }
  }

  /**
   * Verify a signature
   */
  async verifySignature(
    signatureId: string,
    verificationType: VerificationType,
    verifiedBy?: string
  ): Promise<SignatureVerification> {
    try {
      const signature = await prisma.eSignature.findUnique({
        where: { id: signatureId },
        include: { document: true },
      });

      if (!signature) {
        throw new Error('Signature not found');
      }

      let verificationResult: VerificationResult = 'PENDING';
      let hashMatches = false;
      let timestampValid = false;
      let certificateValid: boolean | undefined;

      // Perform verification based on type
      switch (verificationType) {
        case 'HASH_VERIFICATION':
          const currentHash = this.generateDocumentHash(signature.document.content);
          hashMatches = currentHash === signature.hashValue;
          verificationResult = hashMatches ? 'VALID' : 'INVALID';
          break;

        case 'TIMESTAMP_CHECK':
          const now = new Date();
          const signatureTime = new Date(signature.timestamp);
          // Check if signature is not too old (within reasonable timeframe)
          const timeDiff = now.getTime() - signatureTime.getTime();
          timestampValid = timeDiff >= 0 && timeDiff < (24 * 60 * 60 * 1000); // 24 hours
          verificationResult = timestampValid ? 'VALID' : 'INVALID';
          break;

        case 'CERTIFICATE_CHECK':
          // In production, verify against actual certificate
          certificateValid = signature.certificateId ? true : false;
          verificationResult = certificateValid ? 'VALID' : 'INVALID';
          break;

        case 'MANUAL_REVIEW':
          verificationResult = 'PENDING'; // Requires manual review
          break;

        default:
          verificationResult = 'INCONCLUSIVE';
      }

      // Create verification record
      const verification = await prisma.signatureVerification.create({
        data: {
          signatureId,
          verifiedBy,
          verificationType,
          result: verificationResult,
          hashMatches,
          timestampValid,
          certificateValid,
          verifiedAt: new Date(),
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'SignatureVerification',
        entityId: verification.id,
        newValues: { verificationType, result: verificationResult },
      });

      return verification as SignatureVerification;

    } catch (error) {
      console.error('Failed to verify signature:', error);
      throw error;
    }
  }

  /**
   * Get signature with verifications
   */
  async getSignatureWithVerifications(signatureId: string): Promise<ESignature | null> {
    try {
      const signature = await prisma.eSignature.findUnique({
        where: { id: signatureId },
        include: {
          document: true,
          verifications: {
            orderBy: { verifiedAt: 'desc' }
          },
        },
      });

      return signature as ESignature | null;

    } catch (error) {
      console.error('Failed to get signature:', error);
      throw error;
    }
  }

  /**
   * Get all signatures for a document
   */
  async getDocumentSignatures(documentId: string): Promise<ESignature[]> {
    try {
      const signatures = await prisma.eSignature.findMany({
        where: { documentId },
        include: {
          document: true,
          verifications: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return signatures as ESignature[];

    } catch (error) {
      console.error('Failed to get document signatures:', error);
      throw error;
    }
  }

  /**
   * Verify signature by verification code
   */
  async verifyByCode(verificationCode: string): Promise<{
    signature: ESignature;
    isValid: boolean;
    verificationDetails: any;
  }> {
    try {
      const signature = await prisma.eSignature.findUnique({
        where: { verificationCode },
        include: {
          document: true,
          verifications: true,
        },
      });

      if (!signature) {
        throw new Error('Signature not found');
      }

      // Perform comprehensive verification
      const hashVerification = await this.verifySignature(
        signature.id,
        'HASH_VERIFICATION'
      );

      const timestampVerification = await this.verifySignature(
        signature.id,
        'TIMESTAMP_CHECK'
      );

      const isValid = 
        signature.status === 'SIGNED' &&
        hashVerification.result === 'VALID' &&
        timestampVerification.result === 'VALID';

      const verificationDetails = {
        status: signature.status,
        signedAt: signature.signedAt,
        signerName: signature.signerName,
        signerEmail: signature.signerEmail,
        ipAddress: signature.ipAddress,
        hashValid: hashVerification.result === 'VALID',
        timestampValid: timestampVerification.result === 'VALID',
        documentTitle: signature.document.title,
        verifications: signature.verifications,
      };

      return {
        signature: signature as ESignature,
        isValid,
        verificationDetails,
      };

    } catch (error) {
      console.error('Failed to verify by code:', error);
      throw error;
    }
  }

  /**
   * Reject a signature
   */
  async rejectSignature(
    signatureId: string,
    reason: string,
    rejectedBy?: string
  ): Promise<ESignature> {
    try {
      const signature = await prisma.eSignature.update({
        where: { id: signatureId },
        data: {
          status: 'REJECTED',
          auditTrail: {
            rejected: {
              timestamp: new Date(),
              reason,
              rejectedBy,
            }
          },
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'ESignature',
        entityId: signatureId,
        newValues: { status: 'REJECTED', reason },
      });

      return signature as ESignature;

    } catch (error) {
      console.error('Failed to reject signature:', error);
      throw error;
    }
  }

  /**
   * Generate document hash for integrity verification
   */
  private generateDocumentHash(content: string): string {
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  /**
   * Generate unique verification code
   */
  private generateVerificationCode(): string {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Generate signature certificate (simplified)
   */
  async generateCertificate(signatureId: string): Promise<string> {
    try {
      const signature = await prisma.eSignature.findUnique({
        where: { id: signatureId },
        include: { document: true },
      });

      if (!signature) {
        throw new Error('Signature not found');
      }

      const certificateData = {
        signatureId: signature.id,
        verificationCode: signature.verificationCode,
        signerName: signature.signerName,
        signerEmail: signature.signerEmail,
        documentTitle: signature.document.title,
        signedAt: signature.signedAt,
        timestamp: signature.timestamp,
        hashValue: signature.hashValue,
        ipAddress: signature.ipAddress,
        complianceLevel: signature.complianceLevel,
      };

      // In production, this would create a proper digital certificate
      // For now, we'll create a simple JSON certificate
      const certificateJson = JSON.stringify(certificateData, null, 2);
      const certificateHash = this.generateDocumentHash(certificateJson);

      const certificateId = `CERT-${certificateHash.substring(0, 16).toUpperCase()}`;

      // Update signature with certificate ID
      await prisma.eSignature.update({
        where: { id: signatureId },
        data: { certificateId },
      });

      return certificateId;

    } catch (error) {
      console.error('Failed to generate certificate:', error);
      throw error;
    }
  }

  /**
   * Get signature statistics
   */
  async getSignatureStats(): Promise<{
    total: number;
    pending: number;
    signed: number;
    rejected: number;
    expired: number;
  }> {
    try {
      const [total, pending, signed, rejected, expired] = await Promise.all([
        prisma.eSignature.count(),
        prisma.eSignature.count({ where: { status: 'PENDING' } }),
        prisma.eSignature.count({ where: { status: 'SIGNED' } }),
        prisma.eSignature.count({ where: { status: 'REJECTED' } }),
        prisma.eSignature.count({ where: { status: 'EXPIRED' } }),
      ]);

      return {
        total,
        pending,
        signed,
        rejected,
        expired,
      };

    } catch (error) {
      console.error('Failed to get signature stats:', error);
      throw error;
    }
  }

  /**
   * Expire old pending signatures
   */
  async expirePendingSignatures(olderThanHours: number = 48): Promise<number> {
    try {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() - olderThanHours);

      const result = await prisma.eSignature.updateMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: expirationDate },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      // Audit log for batch operation
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'ESignature',
        entityId: 'BATCH_EXPIRE',
        newValues: { 
          count: result.count,
          olderThanHours,
          expirationDate 
        },
      });

      return result.count;

    } catch (error) {
      console.error('Failed to expire pending signatures:', error);
      throw error;
    }
  }
}

export const eSignatureService = ESignatureService.getInstance();

