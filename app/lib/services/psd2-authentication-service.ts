

import { PrismaClient } from '@prisma/client';
import { 
  PSD2Authentication,
  AuthenticationStatus,
  User
} from '@/lib/types';
import { auditService } from './audit-service';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * PSD2 Strong Customer Authentication Service
 * Implements EU Payment Services Directive 2 requirements
 */
export class PSD2AuthenticationService {
  private static instance: PSD2AuthenticationService;

  private constructor() {}

  public static getInstance(): PSD2AuthenticationService {
    if (!PSD2AuthenticationService.instance) {
      PSD2AuthenticationService.instance = new PSD2AuthenticationService();
    }
    return PSD2AuthenticationService.instance;
  }

  /**
   * Initiate Strong Customer Authentication
   */
  async initiateSCA(data: {
    userId: string;
    transactionId?: string;
    amount?: number;
    payee?: string;
    transactionType?: string;
    ipAddress: string;
    deviceId?: string;
    location?: string;
  }): Promise<PSD2Authentication> {
    try {
      // Calculate risk score
      const riskScore = await this.calculateRiskScore({
        userId: data.userId,
        amount: data.amount,
        payee: data.payee,
        ipAddress: data.ipAddress,
        deviceId: data.deviceId,
      });

      // Check for exemptions
      const exemption = this.checkExemptions({
        amount: data.amount,
        riskScore,
        transactionType: data.transactionType,
      });

      // Set expiration (15 minutes for PSD2 compliance)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const authentication = await prisma.pSD2Authentication.create({
        data: {
          userId: data.userId,
          transactionId: data.transactionId,
          amount: data.amount,
          payee: data.payee,
          transactionType: data.transactionType,
          status: exemption.applied ? 'EXEMPTED' : 'PENDING',
          expiresAt,
          riskScore,
          exemptionApplied: exemption.applied,
          exemptionReason: exemption.reason,
          ipAddress: data.ipAddress,
          deviceId: data.deviceId,
          location: data.location,
        },
        include: {
          user: true,
        },
      });

      // If exempted, mark as authenticated
      if (exemption.applied) {
        await this.completeAuthentication(authentication.id, {
          knowledgeFactor: 'EXEMPTED',
          exemptionApplied: true,
        });
      }

      // Audit log
      await auditService.logAction({
        action: 'CREATE',
        entity: 'PSD2Authentication',
        entityId: authentication.id,
        newValues: data,
        ipAddress: data.ipAddress,
      });

      return authentication as unknown as PSD2Authentication;

    } catch (error) {
      console.error('Failed to initiate SCA:', error);
      throw error;
    }
  }

  /**
   * Complete authentication with factors
   */
  async completeAuthentication(
    authenticationId: string,
    factors: {
      knowledgeFactor?: string; // Password, PIN
      possessionFactor?: string; // SMS code, app notification
      inherenceFactor?: string; // Biometric data
      exemptionApplied?: boolean;
    }
  ): Promise<PSD2Authentication> {
    try {
      const authentication = await prisma.pSD2Authentication.findUnique({
        where: { id: authenticationId },
      });

      if (!authentication) {
        throw new Error('Authentication not found');
      }

      // Check if expired
      if (new Date() > authentication.expiresAt) {
        await prisma.pSD2Authentication.update({
          where: { id: authenticationId },
          data: { status: 'EXPIRED' },
        });
        throw new Error('Authentication expired');
      }

      // Validate authentication factors
      const isValid = this.validateAuthenticationFactors(factors, authentication);

      if (!isValid && !factors.exemptionApplied) {
        await prisma.pSD2Authentication.update({
          where: { id: authenticationId },
          data: { status: 'FAILED' },
        });
        throw new Error('Authentication failed');
      }

      // Complete authentication
      const updatedAuth = await prisma.pSD2Authentication.update({
        where: { id: authenticationId },
        data: {
          status: 'AUTHENTICATED',
          authenticatedAt: new Date(),
          knowledgeFactor: factors.knowledgeFactor,
          possessionFactor: factors.possessionFactor,
          inherenceFactor: factors.inherenceFactor,
        },
        include: {
          user: true,
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'PSD2Authentication',
        entityId: authenticationId,
        newValues: { status: 'AUTHENTICATED' },
      });

      return updatedAuth as unknown as PSD2Authentication;

    } catch (error) {
      console.error('Failed to complete authentication:', error);
      throw error;
    }
  }

  /**
   * Check authentication status
   */
  async checkAuthenticationStatus(authenticationId: string): Promise<{
    status: AuthenticationStatus;
    isValid: boolean;
    expiresAt: Date;
    remainingTime: number;
  }> {
    try {
      const authentication = await prisma.pSD2Authentication.findUnique({
        where: { id: authenticationId },
      });

      if (!authentication) {
        throw new Error('Authentication not found');
      }

      const now = new Date();
      const isExpired = now > authentication.expiresAt;
      const remainingTime = Math.max(0, authentication.expiresAt.getTime() - now.getTime());

      // Update status if expired
      if (isExpired && authentication.status === 'PENDING') {
        await prisma.pSD2Authentication.update({
          where: { id: authenticationId },
          data: { status: 'EXPIRED' },
        });
      }

      const status = isExpired && authentication.status === 'PENDING' 
        ? 'EXPIRED' as AuthenticationStatus
        : authentication.status as AuthenticationStatus;

      return {
        status,
        isValid: status === 'AUTHENTICATED' && !isExpired,
        expiresAt: authentication.expiresAt,
        remainingTime: Math.floor(remainingTime / 1000), // in seconds
      };

    } catch (error) {
      console.error('Failed to check authentication status:', error);
      throw error;
    }
  }

  /**
   * Get user authentication history
   */
  async getUserAuthenticationHistory(
    userId: string,
    limit: number = 50
  ): Promise<PSD2Authentication[]> {
    try {
      const authentications = await prisma.pSD2Authentication.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return authentications as unknown as PSD2Authentication[];

    } catch (error) {
      console.error('Failed to get authentication history:', error);
      throw error;
    }
  }

  /**
   * Generate authentication statistics
   */
  async getAuthenticationStats(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    userId?: string;
  }): Promise<{
    total: number;
    authenticated: number;
    failed: number;
    expired: number;
    exempted: number;
    averageRiskScore: number;
    exemptionRate: number;
  }> {
    try {
      const where: any = {};
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }
      
      if (filters.userId) where.userId = filters.userId;

      const [total, authenticated, failed, expired, exempted, avgRisk] = await Promise.all([
        prisma.pSD2Authentication.count({ where }),
        prisma.pSD2Authentication.count({ where: { ...where, status: 'AUTHENTICATED' } }),
        prisma.pSD2Authentication.count({ where: { ...where, status: 'FAILED' } }),
        prisma.pSD2Authentication.count({ where: { ...where, status: 'EXPIRED' } }),
        prisma.pSD2Authentication.count({ where: { ...where, exemptionApplied: true } }),
        prisma.pSD2Authentication.aggregate({
          where,
          _avg: { riskScore: true },
        }),
      ]);

      return {
        total,
        authenticated,
        failed,
        expired,
        exempted,
        averageRiskScore: Number(avgRisk._avg.riskScore) || 0,
        exemptionRate: total > 0 ? (exempted / total) * 100 : 0,
      };

    } catch (error) {
      console.error('Failed to get authentication stats:', error);
      throw error;
    }
  }

  /**
   * Calculate risk score for transaction
   */
  private async calculateRiskScore(data: {
    userId: string;
    amount?: number;
    payee?: string;
    ipAddress: string;
    deviceId?: string;
  }): Promise<number> {
    let riskScore = 0;

    try {
      // Amount risk (0-0.3)
      if (data.amount) {
        if (data.amount > 10000) riskScore += 0.3;
        else if (data.amount > 1000) riskScore += 0.2;
        else if (data.amount > 100) riskScore += 0.1;
      }

      // User behavior risk (0-0.3)
      const recentAuths = await prisma.pSD2Authentication.count({
        where: {
          userId: data.userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        },
      });

      if (recentAuths > 10) riskScore += 0.3;
      else if (recentAuths > 5) riskScore += 0.2;
      else if (recentAuths > 2) riskScore += 0.1;

      // Device risk (0-0.2)
      if (!data.deviceId) {
        riskScore += 0.2; // Unknown device
      } else {
        const knownDevice = await prisma.pSD2Authentication.findFirst({
          where: {
            userId: data.userId,
            deviceId: data.deviceId,
            status: 'AUTHENTICATED',
          },
        });

        if (!knownDevice) riskScore += 0.1; // New device
      }

      // Geographic risk (0-0.2)
      // In production, this would use IP geolocation
      if (data.ipAddress.startsWith('127.')) {
        riskScore += 0; // Local/test environment
      } else {
        riskScore += 0.05; // External IP has slight risk
      }

      return Math.min(1.0, riskScore); // Cap at 1.0

    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 0.5; // Default medium risk
    }
  }

  /**
   * Check for PSD2 exemptions
   */
  private checkExemptions(data: {
    amount?: number;
    riskScore: number;
    transactionType?: string;
  }): { applied: boolean; reason?: string } {
    // Low-value exemption (under €30)
    if (data.amount && data.amount < 30) {
      return {
        applied: true,
        reason: 'Low-value transaction exemption (< €30)',
      };
    }

    // Low-risk transaction
    if (data.riskScore < 0.1) {
      return {
        applied: true,
        reason: 'Low-risk transaction exemption',
      };
    }

    // Recurring transaction to same payee
    if (data.transactionType === 'RECURRING') {
      return {
        applied: true,
        reason: 'Recurring transaction exemption',
      };
    }

    return { applied: false };
  }

  /**
   * Validate authentication factors
   */
  private validateAuthenticationFactors(
    factors: {
      knowledgeFactor?: string;
      possessionFactor?: string;
      inherenceFactor?: string;
    },
    authentication: any
  ): boolean {
    let factorCount = 0;

    // Knowledge factor (something you know)
    if (factors.knowledgeFactor) {
      // In production, validate against stored password/PIN
      factorCount++;
    }

    // Possession factor (something you have)
    if (factors.possessionFactor) {
      // In production, validate SMS code, app notification, etc.
      factorCount++;
    }

    // Inherence factor (something you are)
    if (factors.inherenceFactor) {
      // In production, validate biometric data
      factorCount++;
    }

    // PSD2 requires at least 2 independent factors
    return factorCount >= 2;
  }

  /**
   * Clean up expired authentications
   */
  async cleanupExpiredAuthentications(): Promise<number> {
    try {
      const result = await prisma.pSD2Authentication.updateMany({
        where: {
          status: 'PENDING',
          expiresAt: { lt: new Date() },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      // Audit log
      await auditService.logAction({
        action: 'UPDATE',
        entity: 'PSD2Authentication',
        entityId: 'BATCH_CLEANUP',
        newValues: { expiredCount: result.count },
      });

      return result.count;

    } catch (error) {
      console.error('Failed to cleanup expired authentications:', error);
      throw error;
    }
  }
}

export const psd2AuthenticationService = PSD2AuthenticationService.getInstance();

