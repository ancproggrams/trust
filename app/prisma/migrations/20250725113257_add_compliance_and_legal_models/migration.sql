-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'VALIDATED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('ZZP', 'BV', 'VOF', 'EENMANSZAAK', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('BASIC_INFO', 'BUSINESS_DETAILS', 'BANKING_INFO', 'VERIFICATION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ValidationMethod" AS ENUM ('AUTOMATIC', 'MANUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'SEPA_DIRECT_DEBIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VALIDATE', 'REJECT', 'APPROVE', 'PAYMENT_PROCESS', 'STATUS_CHANGE');

-- CreateEnum
CREATE TYPE "ComplianceLevel" AS ENUM ('BASIC', 'STANDARD', 'ENHANCED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW', 'REQUIRES_ACTION');

-- CreateEnum
CREATE TYPE "ComplianceCheckType" AS ENUM ('DATA_COMPLETENESS', 'VALIDATION_STATUS', 'DOCUMENT_VERIFICATION', 'AUDIT_TRAIL', 'RETENTION_POLICY');

-- CreateEnum
CREATE TYPE "ClientOnboardingStatus" AS ENUM ('PENDING_VALIDATION', 'EMAIL_SENT', 'CLIENT_CONFIRMED', 'ADMIN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ClientApprovalStatus" AS ENUM ('PENDING_APPROVAL', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ApprovalPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('CLIENT_CONFIRMATION', 'ADMIN_NOTIFICATION', 'APPROVAL_NOTIFICATION', 'REJECTION_NOTIFICATION', 'REMINDER', 'WELCOME', 'PASSWORD_RESET', 'INVOICE_NOTIFICATION', 'PAYMENT_REMINDER');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'FAILED', 'BOUNCED', 'SPAM');

-- CreateEnum
CREATE TYPE "UserRoleType" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'USER', 'CLIENT_VIEWER', 'INVOICE_MANAGER', 'CREDITOR_MANAGER', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('VALIDATION_REQUIRED', 'PAYMENT_DUE', 'CREDITOR_VALIDATED', 'SYSTEM_ALERT', 'BTW_DEADLINE', 'CLIENT_APPROVAL_REQUIRED', 'INVOICE_PERMISSION_REQUEST', 'COMPLIANCE_WARNING', 'SECURITY_ALERT', 'WORKFLOW_UPDATE');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRACT', 'INVOICE', 'AGREEMENT', 'IDENTITY', 'BANK_STATEMENT', 'TAX_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PRIVATE', 'SHARED', 'PUBLIC', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "DueDateType" AS ENUM ('SEVEN_DAYS', 'FOURTEEN_DAYS', 'THIRTY_DAYS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InvoiceUnitType" AS ENUM ('HOURS', 'AMOUNT', 'DAYS', 'PIECES', 'KILOMETERS', 'PERCENTAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceEmailType" AS ENUM ('INVOICE_SENT', 'REMINDER_SENT', 'FINAL_NOTICE', 'PAYMENT_RECEIVED', 'INVOICE_CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BTWStatus" AS ENUM ('PENDING', 'RESERVED', 'PREPAID', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TaxReservationStatus" AS ENUM ('ACTIVE', 'USED', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS_CONDITIONS', 'PRIVACY_POLICY', 'AUTHORIZATION_AGREEMENT', 'COOKIE_POLICY', 'PROCESSOR_AGREEMENT', 'GDPR_CONSENT', 'SERVICE_AGREEMENT', 'NDA');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('DATA_PROCESSING', 'MARKETING', 'PROFILING', 'THIRD_PARTY_SHARING', 'COOKIES', 'NEWSLETTER', 'RESEARCH');

-- CreateEnum
CREATE TYPE "GDPRLegalBasis" AS ENUM ('CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'GIVEN', 'WITHDRAWN', 'EXPIRED', 'INVALID');

-- CreateEnum
CREATE TYPE "ConsentMethod" AS ENUM ('WEB_FORM', 'EMAIL_CONFIRMATION', 'PAPER_FORM', 'PHONE_CONSENT', 'API', 'IMPORT');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('DRAWN', 'TYPED', 'UPLOADED', 'BIOMETRIC', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SIGNED', 'REJECTED', 'EXPIRED', 'INVALID', 'WITNESSED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('HASH_VERIFICATION', 'TIMESTAMP_CHECK', 'CERTIFICATE_CHECK', 'BIOMETRIC_MATCH', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "VerificationResult" AS ENUM ('VALID', 'INVALID', 'INCONCLUSIVE', 'EXPIRED', 'REVOKED', 'PENDING');

-- CreateEnum
CREATE TYPE "CDDLevel" AS ENUM ('SIMPLIFIED', 'STANDARD', 'ENHANCED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PEPStatus" AS ENUM ('NOT_PEP', 'DOMESTIC_PEP', 'FOREIGN_PEP', 'INTERNATIONAL_PEP', 'FAMILY_MEMBER', 'CLOSE_ASSOCIATE');

-- CreateEnum
CREATE TYPE "SanctionsResult" AS ENUM ('CLEAR', 'POTENTIAL_MATCH', 'CONFIRMED_MATCH', 'FALSE_POSITIVE', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "MonitoringLevel" AS ENUM ('BASIC', 'STANDARD', 'ENHANCED', 'CONTINUOUS');

-- CreateEnum
CREATE TYPE "AuthenticationStatus" AS ENUM ('PENDING', 'AUTHENTICATED', 'FAILED', 'EXPIRED', 'EXEMPTED');

-- CreateEnum
CREATE TYPE "DeletionMethod" AS ENUM ('SOFT_DELETE', 'SECURE_DELETE', 'ANONYMIZATION', 'PSEUDONYMIZATION', 'ARCHIVAL');

-- CreateEnum
CREATE TYPE "DeletionResult" AS ENUM ('SUCCESS', 'PARTIAL_SUCCESS', 'FAILED', 'PENDING', 'CANCELLED', 'ERROR');

-- CreateEnum
CREATE TYPE "ImplementationStatus" AS ENUM ('NOT_IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'IMPLEMENTED', 'NOT_APPLICABLE', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'ARCHIVED', 'SUPERSEDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "demoExpiresAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "kvkNumber" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Netherlands',
    "iban" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "rejectionReason" TEXT,
    "businessType" "BusinessType" NOT NULL DEFAULT 'ZZP',
    "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'BASIC_INFO',
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "immudbTxId" TEXT,
    "dataRetentionUntil" TIMESTAMP(3),
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "lastComplianceCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "kvkNumber" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Netherlands',
    "iban" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "rejectionReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "immudbTxId" TEXT,
    "dataRetentionUntil" TIMESTAMP(3),
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "lastComplianceCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditor_validations" (
    "id" TEXT NOT NULL,
    "creditorId" TEXT NOT NULL,
    "validationType" "ValidationMethod" NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "documents" TEXT[],
    "notes" TEXT,
    "rejectionReason" TEXT,
    "kvkValidated" BOOLEAN,
    "ibanValidated" BOOLEAN,
    "emailValidated" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditor_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "creditorId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "immudbTxId" TEXT,
    "immudbVerified" BOOLEAN NOT NULL DEFAULT false,
    "immudbHash" TEXT,
    "retentionUntil" TIMESTAMP(3),
    "complianceLevel" "ComplianceLevel" NOT NULL DEFAULT 'STANDARD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immudb_transactions" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "hash" TEXT NOT NULL,
    "auditLogIds" TEXT[],
    "verifiedAt" TIMESTAMP(3),
    "verificationHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "immudb_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_audits" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "checkType" "ComplianceCheckType" NOT NULL,
    "status" "ComplianceStatus" NOT NULL,
    "requiredFields" TEXT[],
    "missingFields" TEXT[],
    "validationErrors" JSONB,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolution" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "nextCheckAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "kvkNumber" TEXT,
    "vatNumber" TEXT,
    "businessType" "BusinessType" NOT NULL DEFAULT 'ZZP',
    "address" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Netherlands',
    "adminContactName" TEXT,
    "adminContactEmail" TEXT,
    "adminContactPhone" TEXT,
    "adminDepartment" TEXT,
    "iban" TEXT,
    "bankName" TEXT,
    "accountHolder" TEXT,
    "postboxNumber" TEXT,
    "onboardingStatus" "ClientOnboardingStatus" NOT NULL DEFAULT 'PENDING_VALIDATION',
    "onboardingStep" "OnboardingStep" NOT NULL DEFAULT 'BASIC_INFO',
    "onboardingCompletedAt" TIMESTAMP(3),
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "validatedAt" TIMESTAMP(3),
    "validatedBy" TEXT,
    "rejectionReason" TEXT,
    "approvalStatus" "ClientApprovalStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "approvalNotes" TEXT,
    "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "emailConfirmedAt" TIMESTAMP(3),
    "emailConfirmationToken" TEXT,
    "emailConfirmationExpiresAt" TIMESTAMP(3),
    "kvkValidated" BOOLEAN NOT NULL DEFAULT false,
    "kvkValidatedAt" TIMESTAMP(3),
    "btwValidated" BOOLEAN NOT NULL DEFAULT false,
    "btwValidatedAt" TIMESTAMP(3),
    "ibanValidated" BOOLEAN NOT NULL DEFAULT false,
    "ibanValidatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canCreateInvoices" BOOLEAN NOT NULL DEFAULT false,
    "invoicePermissionGrantedAt" TIMESTAMP(3),
    "invoicePermissionGrantedBy" TEXT,
    "totalInvoiced" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "immudbTxId" TEXT,
    "dataRetentionUntil" TIMESTAMP(3),
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "lastComplianceCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_approvals" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "ClientApprovalStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "rejectionReason" TEXT,
    "documents" TEXT[],
    "validationChecks" JSONB,
    "workflowStep" TEXT NOT NULL,
    "priority" "ApprovalPriority" NOT NULL DEFAULT 'NORMAL',
    "deadline" TIMESTAMP(3),
    "immudbTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "type" "EmailType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'nl',
    "templateData" JSONB,
    "htmlContent" TEXT,
    "textContent" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "confirmationToken" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmationData" JSONB,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_validations" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "validationType" "ValidationMethod" NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "kvkCheck" JSONB,
    "btwCheck" JSONB,
    "ibanCheck" JSONB,
    "emailCheck" JSONB,
    "phoneCheck" JSONB,
    "addressCheck" JSONB,
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedBy" TEXT,
    "validatedAt" TIMESTAMP(3),
    "overallScore" DECIMAL(3,2),
    "findings" JSONB,
    "recommendations" TEXT,
    "notes" TEXT,
    "documents" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRoleType" NOT NULL,
    "permissions" TEXT[],
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scopeType" TEXT,
    "scopeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "targetRoles" TEXT[],
    "targetUsers" TEXT[],
    "entityType" TEXT,
    "entityId" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewedBy" TEXT[],
    "acknowledgedBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "language" TEXT NOT NULL DEFAULT 'nl',
    "content" TEXT NOT NULL,
    "templateData" JSONB,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "jurisdiction" TEXT NOT NULL DEFAULT 'Netherlands',
    "legalBasis" TEXT,
    "complianceStandard" TEXT[],
    "parentVersion" TEXT,
    "changeReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_consents" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "userId" TEXT,
    "documentId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "purpose" TEXT NOT NULL,
    "legalBasis" "GDPRLegalBasis" NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "givenAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "method" "ConsentMethod" NOT NULL DEFAULT 'WEB_FORM',
    "evidence" JSONB,
    "dataCategories" TEXT[],
    "retentionPeriod" INTEGER,
    "thirdPartySharing" BOOLEAN NOT NULL DEFAULT false,
    "thirdParties" TEXT[],
    "auditTrail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "e_signatures" (
    "id" TEXT NOT NULL,
    "signerId" TEXT,
    "signerEmail" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerRole" TEXT,
    "documentId" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "signatureType" "SignatureType" NOT NULL DEFAULT 'DRAWN',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "location" TEXT,
    "certificateId" TEXT,
    "hashValue" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "signedAt" TIMESTAMP(3),
    "witnessedBy" TEXT,
    "witnessedAt" TIMESTAMP(3),
    "complianceLevel" "ComplianceLevel" NOT NULL DEFAULT 'STANDARD',
    "auditTrail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "e_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signature_verifications" (
    "id" TEXT NOT NULL,
    "signatureId" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verificationType" "VerificationType" NOT NULL,
    "result" "VerificationResult" NOT NULL,
    "hashMatches" BOOLEAN NOT NULL,
    "timestampValid" BOOLEAN NOT NULL,
    "certificateValid" BOOLEAN,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "signature_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wwft_checks" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "cddLevel" "CDDLevel" NOT NULL DEFAULT 'SIMPLIFIED',
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityDocuments" TEXT[],
    "identityVerifiedAt" TIMESTAMP(3),
    "identityVerifiedBy" TEXT,
    "beneficialOwnership" JSONB,
    "beneficialOwnersVerified" BOOLEAN NOT NULL DEFAULT false,
    "pepCheck" BOOLEAN NOT NULL DEFAULT false,
    "pepStatus" "PEPStatus" NOT NULL DEFAULT 'NOT_PEP',
    "pepCheckDate" TIMESTAMP(3),
    "sanctionsCheck" BOOLEAN NOT NULL DEFAULT false,
    "sanctionsResult" "SanctionsResult" NOT NULL DEFAULT 'CLEAR',
    "sanctionsCheckDate" TIMESTAMP(3),
    "monitoringEnabled" BOOLEAN NOT NULL DEFAULT true,
    "monitoringLevel" "MonitoringLevel" NOT NULL DEFAULT 'STANDARD',
    "recordsRetainUntil" TIMESTAMP(3) NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wwft_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "psd2_authentications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "knowledgeFactor" TEXT,
    "possessionFactor" TEXT,
    "inherenceFactor" TEXT,
    "transactionId" TEXT,
    "amount" DECIMAL(10,2),
    "payee" TEXT,
    "transactionType" TEXT,
    "status" "AuthenticationStatus" NOT NULL DEFAULT 'PENDING',
    "authenticatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "riskScore" DECIMAL(3,2),
    "exemptionApplied" BOOLEAN NOT NULL DEFAULT false,
    "exemptionReason" TEXT,
    "ipAddress" TEXT NOT NULL,
    "deviceId" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "psd2_authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataCategory" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "retentionPeriod" INTEGER NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL DEFAULT 'Netherlands',
    "autoDelete" BOOLEAN NOT NULL DEFAULT true,
    "deletionMethod" "DeletionMethod" NOT NULL DEFAULT 'SECURE_DELETE',
    "notifyBefore" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_records" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityData" JSONB,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletionResult" "DeletionResult",
    "deletedBy" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_retention_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_controls" (
    "id" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "implementationStatus" "ImplementationStatus" NOT NULL DEFAULT 'NOT_IMPLEMENTED',
    "implementedBy" TEXT,
    "implementedAt" TIMESTAMP(3),
    "evidence" TEXT[],
    "procedures" TEXT,
    "responsibleParty" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "riskMitigation" TEXT,
    "lastReviewed" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "nextReview" TIMESTAMP(3),
    "auditFindings" TEXT,
    "isoRequirement" TEXT,
    "otherStandards" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_continuity_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "businessImpactAnalysis" JSONB,
    "riskAssessment" JSONB,
    "rto" INTEGER,
    "rpo" INTEGER,
    "mtpd" INTEGER,
    "procedures" TEXT NOT NULL,
    "contacts" JSONB,
    "resources" JSONB,
    "lastTested" TIMESTAMP(3),
    "testedBy" TEXT,
    "testResults" TEXT,
    "nextTest" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_continuity_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "btwAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "btwRate" INTEGER NOT NULL DEFAULT 21,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "dueDateType" "DueDateType" NOT NULL DEFAULT 'CUSTOM',
    "pdfPath" TEXT,
    "pdfGenerated" BOOLEAN NOT NULL DEFAULT false,
    "pdfGeneratedAt" TIMESTAMP(3),
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "paymentMethod" "PaymentMethod",
    "paymentReference" TEXT,
    "remindersSent" INTEGER NOT NULL DEFAULT 0,
    "lastReminderAt" TIMESTAMP(3),
    "interestRate" DECIMAL(5,2),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "immudbTxId" TEXT,
    "dataRetentionUntil" TIMESTAMP(3),
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "lastComplianceCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "standardServiceId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitType" "InvoiceUnitType" NOT NULL DEFAULT 'AMOUNT',
    "rate" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "category" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standard_services" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "defaultRate" DECIMAL(10,2) NOT NULL,
    "unitType" "InvoiceUnitType" NOT NULL DEFAULT 'HOURS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standard_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_email_logs" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "emailType" "InvoiceEmailType" NOT NULL DEFAULT 'INVOICE_SENT',
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "isDeprecated" BOOLEAN NOT NULL DEFAULT true,
    "deprecatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "filePath" TEXT,
    "fileUrl" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'PRIVATE',
    "sharedWith" TEXT[],
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "immudbTxId" TEXT,
    "dataRetentionUntil" TIMESTAMP(3),
    "complianceStatus" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "lastComplianceCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "btw_records" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "btwRate" INTEGER NOT NULL,
    "btwAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "quarter" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "BTWStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "paidAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "btw_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_reservations" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "reservationAmount" DECIMAL(10,2) NOT NULL,
    "reservationRate" DECIMAL(5,2) NOT NULL,
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "status" "TaxReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "usedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "usedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_kvkNumber_key" ON "user_profiles"("kvkNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_vatNumber_key" ON "user_profiles"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_iban_key" ON "user_profiles"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "creditors_kvkNumber_key" ON "creditors"("kvkNumber");

-- CreateIndex
CREATE UNIQUE INDEX "creditors_vatNumber_key" ON "creditors"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "creditors_iban_key" ON "creditors"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "immudb_transactions_txId_key" ON "immudb_transactions"("txId");

-- CreateIndex
CREATE UNIQUE INDEX "clients_kvkNumber_key" ON "clients"("kvkNumber");

-- CreateIndex
CREATE UNIQUE INDEX "clients_vatNumber_key" ON "clients"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "clients_iban_key" ON "clients"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "e_signatures_verificationCode_key" ON "e_signatures"("verificationCode");

-- CreateIndex
CREATE UNIQUE INDEX "security_controls_controlId_key" ON "security_controls"("controlId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "btw_records_invoiceId_key" ON "btw_records"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_reservations_invoiceId_key" ON "tax_reservations"("invoiceId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditors" ADD CONSTRAINT "creditors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditor_validations" ADD CONSTRAINT "creditor_validations_creditorId_fkey" FOREIGN KEY ("creditorId") REFERENCES "creditors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_creditorId_fkey" FOREIGN KEY ("creditorId") REFERENCES "creditors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_approvals" ADD CONSTRAINT "client_approvals_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_validations" ADD CONSTRAINT "client_validations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_consents" ADD CONSTRAINT "client_consents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_consents" ADD CONSTRAINT "client_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_consents" ADD CONSTRAINT "client_consents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "e_signatures" ADD CONSTRAINT "e_signatures_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "legal_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_verifications" ADD CONSTRAINT "signature_verifications_signatureId_fkey" FOREIGN KEY ("signatureId") REFERENCES "e_signatures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psd2_authentications" ADD CONSTRAINT "psd2_authentications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_retention_records" ADD CONSTRAINT "data_retention_records_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "data_retention_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_standardServiceId_fkey" FOREIGN KEY ("standardServiceId") REFERENCES "standard_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standard_services" ADD CONSTRAINT "standard_services_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_email_logs" ADD CONSTRAINT "invoice_email_logs_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "btw_records" ADD CONSTRAINT "btw_records_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_reservations" ADD CONSTRAINT "tax_reservations_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
