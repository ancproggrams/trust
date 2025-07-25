
import { AuditAction, ComplianceLevel, ComplianceStatus, ComplianceCheckType } from '@prisma/client';

// Extended audit types
export interface AuditEvent {
  id: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  userId?: string;
  userName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: Date;
  immudbVerified: boolean;
  complianceLevel: ComplianceLevel;
}

export interface AuditFilter {
  entity?: string;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
  dateFrom?: Date;
  dateTo?: Date;
  complianceLevel?: ComplianceLevel;
  verified?: boolean;
}

export interface ComplianceCheck {
  id: string;
  entity: string;
  entityId: string;
  checkType: ComplianceCheckType;
  status: ComplianceStatus;
  requiredFields: string[];
  missingFields: string[];
  validationErrors?: Record<string, string>;
  scheduledAt?: Date;
  nextCheckAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface ComplianceReport {
  entity: string;
  total: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  totalRecords: number;
  compliantRecords: number;
  nonCompliantRecords: number;
  pendingRecords: number;
  complianceRate: number;
  lastCheck: Date;
  nextScheduledCheck: Date;
  criticalIssues: ComplianceIssue[];
}

export interface ComplianceIssue {
  entityId: string;
  entityName: string;
  issueType: ComplianceCheckType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  missingFields: string[];
  actionRequired: string;
  dueDate: Date;
}

export interface AuditConfiguration {
  enableImmuDB: boolean;
  retentionPeriods: {
    [key in ComplianceLevel]: number; // years
  };
  auditLevels: {
    [entity: string]: ComplianceLevel;
  };
  mandatoryFields: {
    [entity: string]: string[];
  };
  validationRules: {
    [entity: string]: ValidationRule[];
  };
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'length' | 'custom';
  rule: string | RegExp | ((value: any) => boolean);
  message: string;
}

// Audit middleware types
export interface AuditMiddleware {
  beforeCreate?: (entity: string, data: any) => Promise<void>;
  afterCreate?: (entity: string, entityId: string, data: any) => Promise<void>;
  beforeUpdate?: (entity: string, entityId: string, oldData: any, newData: any) => Promise<void>;
  afterUpdate?: (entity: string, entityId: string, oldData: any, newData: any) => Promise<void>;
  beforeDelete?: (entity: string, entityId: string, data: any) => Promise<void>;
  afterDelete?: (entity: string, entityId: string, data: any) => Promise<void>;
}

// ImmuDB specific types
export interface ImmuDBRecord {
  key: string;
  value: string;
  txId: string;
  timestamp: Date;
  verified: boolean;
  hash: string;
}

export interface ImmuDBVerification {
  key: string;
  verified: boolean;
  hash?: string;
  data?: any;
  error?: string;
}

// Compliance dashboard types
export interface ComplianceDashboard {
  overview: {
    totalEntities: number;
    compliantEntities: number;
    nonCompliantEntities: number;
    complianceRate: number;
  };
  byEntity: ComplianceReport[];
  recentAudits: AuditEvent[];
  criticalIssues: ComplianceIssue[];
  upcomingChecks: {
    entity: string;
    entityId: string;
    checkType: ComplianceCheckType;
    scheduledAt: Date;
  }[];
}

// Data retention types
export interface RetentionPolicy {
  entity: string;
  retentionPeriod: number; // years
  complianceLevel: ComplianceLevel;
  autoCleanup: boolean;
  notificationPeriod: number; // days before deletion
}

export interface RetentionStatus {
  entity: string;
  entityId: string;
  retentionUntil: Date;
  daysRemaining: number;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  autoCleanupEnabled: boolean;
}
