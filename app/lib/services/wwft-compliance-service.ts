

import { PrismaClient } from '@prisma/client';
import { 
  WwftCheck,
  CDDLevel,
  RiskLevel,
  PEPStatus,
  SanctionsResult,
  MonitoringLevel,
  ComplianceStatus
} from '@/lib/types';
import { auditService } from './audit-service';

const prisma = new PrismaClient();

/**
 * Wwft (Wet ter voorkoming van witwassen en financieren van terrorisme) Compliance Service
 * Implements Dutch Anti-Money Laundering regulations
 */
export class WwftComplianceService {
  private static instance: WwftComplianceService;

  private constructor() {}

  public static getInstance(): WwftComplianceService {
    if (!WwftComplianceService.instance) {
      WwftComplianceService.instance = new WwftComplianceService();
    }
    return WwftComplianceService.instance;
  }

  /**
   * Perform Customer Due Diligence (CDD) check
   */
  async performCDDCheck(data: {
    entityType: string;
    entityId: string;
    clientName: string;
    kvkNumber?: string;
    identityDocuments?: string[];
    businessType?: string;
    transactionVolume?: number;
    geographicRisk?: string;
    performedBy: string;
  }): Promise<WwftCheck> {
    try {
      // Determine CDD level based on risk factors
      const cddLevel = this.determineCDDLevel({
        businessType: data.businessType,
        transactionVolume: data.transactionVolume,
        geographicRisk: data.geographicRisk,
      });

      // Assess risk level
      const riskLevel = this.assessRiskLevel({
        businessType: data.businessType,
        transactionVolume: data.transactionVolume,
        geographicRisk: data.geographicRisk,
        hasIdentityDocuments: (data.identityDocuments?.length || 0) > 0,
      });

      // Perform PEP check
      const pepResult = await this.performPEPCheck(data.clientName);

      // Perform sanctions screening
      const sanctionsResult = await this.performSanctionsScreening(data.clientName, data.kvkNumber);

      // Determine monitoring level
      const monitoringLevel = this.determineMonitoringLevel(riskLevel);

      // Calculate record retention date (5 years minimum)
      const recordsRetainUntil = new Date();
      recordsRetainUntil.setFullYear(recordsRetainUntil.getFullYear() + 5);

      // Create Wwft check record
      const wwftCheck = await prisma.wwftCheck.create({
        data: {
          entityType: data.entityType,
          entityId: data.entityId,
          cddLevel,
          riskLevel,
          identityVerified: (data.identityDocuments?.length || 0) > 0,
          identityDocuments: data.identityDocuments || [],
          identityVerifiedAt: (data.identityDocuments?.length || 0) > 0 ? new Date() : undefined,
          identityVerifiedBy: (data.identityDocuments?.length || 0) > 0 ? data.performedBy : undefined,
          beneficialOwnership: undefined, // To be filled later if needed
          beneficialOwnersVerified: false,
          pepCheck: true,
          pepStatus: pepResult.status,
          pepCheckDate: new Date(),
          sanctionsCheck: true,
          sanctionsResult: sanctionsResult.result,
          sanctionsCheckDate: new Date(),
          monitoringEnabled: true,
          monitoringLevel,
          recordsRetainUntil,
          status: this.determineComplianceStatus(riskLevel, pepResult, sanctionsResult),
          nextReviewDate: this.calculateNextReviewDate(cddLevel, riskLevel),
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'WwftCheck',
        entityId: wwftCheck.id,
        newValues: data,
      });

      return wwftCheck as WwftCheck;

    } catch (error) {
      console.error('Failed to perform CDD check:', error);
      throw error;
    }
  }

  /**
   * Update beneficial ownership information
   */
  async updateBeneficialOwnership(
    wwftCheckId: string,
    beneficialOwnership: {
      owners: Array<{
        name: string;
        percentage: number;
        identityVerified: boolean;
        pepStatus: PEPStatus;
      }>;
      structure: Record<string, any>;
    },
    verifiedBy: string
  ): Promise<WwftCheck> {
    try {
      const wwftCheck = await prisma.wwftCheck.update({
        where: { id: wwftCheckId },
        data: {
          beneficialOwnership: beneficialOwnership,
          beneficialOwnersVerified: beneficialOwnership.owners.every(owner => owner.identityVerified),
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'WwftCheck',
        entityId: wwftCheckId,
        newValues: { beneficialOwnership, verifiedBy },
      });

      return wwftCheck as WwftCheck;

    } catch (error) {
      console.error('Failed to update beneficial ownership:', error);
      throw error;
    }
  }

  /**
   * Complete Wwft check review
   */
  async completeReview(
    wwftCheckId: string,
    reviewedBy: string,
    notes?: string
  ): Promise<WwftCheck> {
    try {
      const wwftCheck = await prisma.wwftCheck.update({
        where: { id: wwftCheckId },
        data: {
          status: 'COMPLIANT',
          completedAt: new Date(),
          reviewedBy,
          reviewedAt: new Date(),
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'WwftCheck',
        entityId: wwftCheckId,
        newValues: { status: 'COMPLIANT', reviewedBy, notes },
      });

      return wwftCheck as WwftCheck;

    } catch (error) {
      console.error('Failed to complete review:', error);
      throw error;
    }
  }

  /**
   * Get overdue reviews
   */
  async getOverdueReviews(): Promise<WwftCheck[]> {
    try {
      const overdueChecks = await prisma.wwftCheck.findMany({
        where: {
          nextReviewDate: { lt: new Date() },
          status: { not: 'NON_COMPLIANT' },
        },
        orderBy: { nextReviewDate: 'asc' },
      });

      return overdueChecks as WwftCheck[];

    } catch (error) {
      console.error('Failed to get overdue reviews:', error);
      throw error;
    }
  }

  /**
   * Generate Wwft report
   */
  async generateReport(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    riskLevel?: RiskLevel;
    status?: ComplianceStatus;
  }): Promise<{
    summary: {
      total: number;
      compliant: number;
      nonCompliant: number;
      pending: number;
      highRisk: number;
    };
    checks: WwftCheck[];
  }> {
    try {
      const where: any = {};
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }
      
      if (filters.riskLevel) where.riskLevel = filters.riskLevel;
      if (filters.status) where.status = filters.status;

      const [checks, total, compliant, nonCompliant, pending, highRisk] = await Promise.all([
        prisma.wwftCheck.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.wwftCheck.count({ where }),
        prisma.wwftCheck.count({ where: { ...where, status: 'COMPLIANT' } }),
        prisma.wwftCheck.count({ where: { ...where, status: 'NON_COMPLIANT' } }),
        prisma.wwftCheck.count({ where: { ...where, status: 'PENDING' } }),
        prisma.wwftCheck.count({ where: { ...where, riskLevel: 'HIGH' } }),
      ]);

      return {
        summary: {
          total,
          compliant,
          nonCompliant,
          pending,
          highRisk,
        },
        checks: checks as WwftCheck[],
      };

    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  /**
   * Determine CDD level based on risk factors
   */
  private determineCDDLevel(factors: {
    businessType?: string;
    transactionVolume?: number;
    geographicRisk?: string;
  }): CDDLevel {
    // High-risk criteria
    if (factors.geographicRisk === 'HIGH' || 
        (factors.transactionVolume && factors.transactionVolume > 15000)) {
      return 'ENHANCED';
    }

    // Low-risk criteria (simplified CDD allowed)
    if (factors.businessType === 'ZZP' && 
        (factors.transactionVolume || 0) < 1000) {
      return 'SIMPLIFIED';
    }

    return 'STANDARD';
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(factors: {
    businessType?: string;
    transactionVolume?: number;
    geographicRisk?: string;
    hasIdentityDocuments: boolean;
  }): RiskLevel {
    let riskScore = 0;

    // Business type risk
    if (factors.businessType === 'CASINO' || factors.businessType === 'CRYPTO') {
      riskScore += 3;
    } else if (factors.businessType === 'FINANCE') {
      riskScore += 2;
    }

    // Transaction volume risk
    if (factors.transactionVolume) {
      if (factors.transactionVolume > 50000) riskScore += 3;
      else if (factors.transactionVolume > 15000) riskScore += 2;
      else if (factors.transactionVolume > 1000) riskScore += 1;
    }

    // Geographic risk
    if (factors.geographicRisk === 'HIGH') riskScore += 3;
    else if (factors.geographicRisk === 'MEDIUM') riskScore += 1;

    // Identity verification
    if (!factors.hasIdentityDocuments) riskScore += 2;

    // Determine risk level
    if (riskScore >= 6) return 'CRITICAL';
    if (riskScore >= 4) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Perform PEP (Politically Exposed Person) check
   */
  private async performPEPCheck(name: string): Promise<{
    status: PEPStatus;
    details?: string;
  }> {
    // In production, this would integrate with external PEP databases
    // For now, we'll simulate the check
    
    // Mock PEP database - in production, integrate with real services
    const mockPEPDatabase = [
      'John Politician',
      'Jane Minister',
      'Bob Ambassador',
    ];

    const normalizedName = name.toLowerCase();
    const isPEP = mockPEPDatabase.some(pepName => 
      normalizedName.includes(pepName.toLowerCase())
    );

    return {
      status: isPEP ? 'DOMESTIC_PEP' : 'NOT_PEP',
      details: isPEP ? 'Found in PEP database' : 'No PEP match found',
    };
  }

  /**
   * Perform sanctions screening
   */
  private async performSanctionsScreening(
    name: string, 
    kvkNumber?: string
  ): Promise<{
    result: SanctionsResult;
    details?: string;
  }> {
    // In production, this would integrate with sanctions databases (EU, UN, OFAC, etc.)
    // For now, we'll simulate the screening
    
    // Mock sanctions database
    const mockSanctionsDatabase = [
      'Sanctioned Person',
      'Blocked Entity',
      'Restricted Company',
    ];

    const normalizedName = name.toLowerCase();
    const isSanctioned = mockSanctionsDatabase.some(sanctionedName => 
      normalizedName.includes(sanctionedName.toLowerCase())
    );

    if (isSanctioned) {
      return {
        result: 'CONFIRMED_MATCH',
        details: 'Found on sanctions list',
      };
    }

    // Check for potential matches (fuzzy matching in production)
    const hasPotentialMatch = normalizedName.includes('suspect');
    
    if (hasPotentialMatch) {
      return {
        result: 'POTENTIAL_MATCH',
        details: 'Potential match requires manual review',
      };
    }

    return {
      result: 'CLEAR',
      details: 'No sanctions matches found',
    };
  }

  /**
   * Determine monitoring level based on risk
   */
  private determineMonitoringLevel(riskLevel: RiskLevel): MonitoringLevel {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'CONTINUOUS';
      case 'HIGH':
        return 'ENHANCED';
      case 'MEDIUM':
        return 'STANDARD';
      default:
        return 'BASIC';
    }
  }

  /**
   * Determine compliance status
   */
  private determineComplianceStatus(
    riskLevel: RiskLevel,
    pepResult: { status: PEPStatus },
    sanctionsResult: { result: SanctionsResult }
  ): ComplianceStatus {
    // Non-compliant conditions
    if (sanctionsResult.result === 'CONFIRMED_MATCH') {
      return 'NON_COMPLIANT';
    }

    if (pepResult.status !== 'NOT_PEP' && riskLevel === 'CRITICAL') {
      return 'NON_COMPLIANT';
    }

    // Pending conditions
    if (sanctionsResult.result === 'POTENTIAL_MATCH' || 
        sanctionsResult.result === 'UNDER_REVIEW') {
      return 'PENDING';
    }

    return 'COMPLIANT';
  }

  /**
   * Calculate next review date
   */
  private calculateNextReviewDate(cddLevel: CDDLevel, riskLevel: RiskLevel): Date {
    const nextReview = new Date();
    
    // Base review periods
    let months = 12; // Default annual review

    if (riskLevel === 'CRITICAL') months = 3;  // Quarterly
    else if (riskLevel === 'HIGH') months = 6; // Semi-annual
    else if (cddLevel === 'ENHANCED') months = 6; // Enhanced CDD needs frequent review

    nextReview.setMonth(nextReview.getMonth() + months);
    return nextReview;
  }
}

export const wwftComplianceService = WwftComplianceService.getInstance();

