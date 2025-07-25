
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  // Basic information
  name: string;
  email: string;
  phone: string;
  
  // Business details
  company?: string;
  kvkNumber?: string;
  vatNumber?: string;
  businessType: BusinessType;
  
  // Contact details
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  
  // Admin/Accounting contact
  adminContactName?: string;
  adminContactEmail?: string;
  adminContactPhone?: string;
  adminDepartment?: string;
  
  // Banking information
  iban?: string;
  bankName?: string;
  accountHolder?: string;
  postboxNumber?: string;
  
  // Workflow status
  onboardingStatus: ClientOnboardingStatus;
  onboardingStep: OnboardingStep;
  onboardingCompletedAt?: Date;
  
  // Validation status
  validationStatus: ValidationStatus;
  validatedAt?: Date;
  validatedBy?: string;
  rejectionReason?: string;
  
  // Admin approval
  approvalStatus: ClientApprovalStatus;
  approvedAt?: Date;
  approvedBy?: string;
  approvalNotes?: string;
  
  // Email confirmation
  emailConfirmed: boolean;
  emailConfirmedAt?: Date;
  emailConfirmationToken?: string;
  emailConfirmationExpiresAt?: Date;
  
  // Validation results
  kvkValidated: boolean;
  kvkValidatedAt?: Date;
  btwValidated: boolean;
  btwValidatedAt?: Date;
  ibanValidated: boolean;
  ibanValidatedAt?: Date;
  
  // Security controls
  isActive: boolean;
  canCreateInvoices: boolean;
  invoicePermissionGrantedAt?: Date;
  invoicePermissionGrantedBy?: string;
  
  totalInvoiced: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: number; // Bedrag excl. BTW
  btwAmount: number; // BTW bedrag
  totalAmount: number; // Totaal incl. BTW
  btwRate: number; // BTW percentage (21, 9, 0)
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  createdAt: Date;
  description: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description?: string;
  date: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  clientId?: string;
  clientName?: string;
  title: string;
  description?: string;
  type: 'contract' | 'invoice' | 'agreement' | 'other';
  status: 'draft' | 'pending_signature' | 'signed' | 'completed';
  createdAt: Date;
  signedAt?: Date;
  fileUrl?: string;
  signatureUrl?: string;
  content?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// BTW/Belasting gerelateerde types
export interface BTWRecord {
  id: string;
  invoiceId: string;
  amount: number; // Totaal factuurbedrag excl. BTW
  btwAmount: number; // BTW bedrag
  btwRate: number; // BTW percentage (21, 9, 0)
  status: 'reserved' | 'prepaid' | 'pending' | 'paid';
  quarter: string; // Q1-2024
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
}

export interface TaxReservation {
  id: string;
  invoiceId: string;
  amount: number; // Gereserveerd bedrag voor omzetbelasting
  reservationRate: number; // Percentage dat wordt gereserveerd
  year: number;
  status: 'active' | 'used' | 'released';
  createdAt: Date;
}

export interface TaxSettings {
  // BTW instellingen
  defaultBTWRate: number; // 21%
  btwEnabled: boolean;
  quarterlyBTWPrepaymentsEnabled: boolean;
  btwPrepaymentAmount: number; // Standaard vooruitbetaling per kwartaal
  
  // Omzetbelasting instellingen
  taxReservationEnabled: boolean;
  taxReservationRate: number; // Percentage van omzet dat wordt gereserveerd
  annualTaxThreshold: number; // Drempel voor omzetbelasting
  
  // Belastingdienst instellingen
  taxOfficeContactEmail: string;
  taxFilingMethod: 'manual' | 'automatic';
  lastTaxFilingDate?: Date;
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  upcomingAppointments: number;
  totalClients: number;
  completedAppointments: number;
  // BTW gerelateerde stats
  totalBTWOwed: number;
  totalBTWPrepaid: number;
  nextBTWPaymentDue: Date | null;
  // Omzetbelasting stats
  totalTaxReserved: number;
  currentYearRevenue: number;
  estimatedYearEndTax: number;
  // Crediteur stats
  totalCreditors: number;
  pendingCreditorValidations: number;
  pendingPayments: number;
}

// Onboarding & Registration Types
export interface UserProfile {
  id: string;
  userId: string;
  // Business details
  companyName?: string;
  kvkNumber?: string;
  vatNumber?: string;
  // Contact information
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  // Banking details
  iban?: string;
  bankName?: string;
  accountHolder?: string;
  // Validation status
  validationStatus: ValidationStatus;
  validatedAt?: Date;
  validatedBy?: string;
  rejectionReason?: string;
  // Business type
  businessType: BusinessType;
  // Onboarding
  onboardingStep: OnboardingStep;
  onboardingCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingFormData {
  // Step 1: Basic Info
  name: string;
  email: string;
  phone?: string;
  
  // Step 2: Business Details
  companyName?: string;
  kvkNumber?: string;
  vatNumber?: string;
  businessType: BusinessType;
  
  // Step 3: Contact Details
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  
  // Step 4: Banking Info
  iban?: string;
  bankName?: string;
  accountHolder?: string;
  
  // Registration type
  isDemo: boolean;
  
  // Terms acceptance
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  
  // KvK validation result
  kvkValidationResult?: KvKValidationResult;
}

// Creditor Management Types
export interface Creditor {
  id: string;
  userId: string;
  // Basic information
  name: string;
  email?: string;
  phone?: string;
  // Business details
  companyName?: string;
  kvkNumber?: string;
  vatNumber?: string;
  // Contact details
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  // Banking information
  iban?: string;
  bankName?: string;
  accountHolder?: string;
  // Validation
  validationStatus: ValidationStatus;
  validatedAt?: Date;
  validatedBy?: string;
  rejectionReason?: string;
  // Settings
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditorValidation {
  id: string;
  creditorId: string;
  validationType: ValidationMethod;
  status: ValidationStatus;
  // Validation details
  requestedBy: string;
  requestedAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  // Documentation
  documents: string[];
  notes?: string;
  rejectionReason?: string;
  // Automated validation results
  kvkValidated?: boolean;
  ibanValidated?: boolean;
  emailValidated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  creditorId: string;
  creditorName: string;
  amount: number;
  description?: string;
  reference?: string;
  status: PaymentStatus;
  scheduledAt?: Date;
  processedAt?: Date;
  method: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

// Audit & Logging Types
export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  // Change details
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  // Context
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Demo System Types
export interface DemoSettings {
  isDemo: boolean;
  demoExpiresAt?: Date;
  demoDataResetInterval: number; // minutes
  lastResetAt?: Date;
  allowedDemoFeatures: DemoFeature[];
}

export interface DemoData {
  clients: Client[];
  invoices: Invoice[];
  appointments: Appointment[];
  documents: Document[];
  creditors: Creditor[];
  payments: Payment[];
}

// Admin Dashboard Types
export interface AdminStats {
  totalUsers: number;
  pendingValidations: number;
  totalCreditors: number;
  totalPayments: number;
  recentValidations: CreditorValidation[];
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastBackup?: Date;
  validationQueueSize: number;
  paymentQueueSize: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  priority: NotificationPriority;
  createdAt: Date;
  expiresAt?: Date;
}

// Extended Auth Context Type
export interface ExtendedAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: () => Promise<boolean>;
  register: (data: OnboardingFormData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

// Enum Types (matching Prisma schema)
export type ValidationStatus = 'PENDING' | 'IN_REVIEW' | 'VALIDATED' | 'REJECTED' | 'EXPIRED';
export type BusinessType = 'ZZP' | 'BV' | 'VOF' | 'EENMANSZAAK' | 'OTHER';
export type OnboardingStep = 'BASIC_INFO' | 'BUSINESS_DETAILS' | 'BANKING_INFO' | 'VERIFICATION' | 'COMPLETED';
export type ValidationMethod = 'AUTOMATIC' | 'MANUAL' | 'HYBRID';
export type PaymentStatus = 'PENDING' | 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PaymentMethod = 'BANK_TRANSFER' | 'SEPA_DIRECT_DEBIT' | 'MANUAL';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VALIDATE' | 'REJECT' | 'APPROVE' | 'PAYMENT_PROCESS' | 'STATUS_CHANGE';
export type DemoFeature = 'INVOICES' | 'CLIENTS' | 'APPOINTMENTS' | 'DOCUMENTS' | 'CREDITORS' | 'PAYMENTS' | 'BTW' | 'TAX';
export type NotificationType = 'VALIDATION_REQUIRED' | 'PAYMENT_DUE' | 'CREDITOR_VALIDATED' | 'SYSTEM_ALERT' | 'BTW_DEADLINE' | 'CLIENT_APPROVAL_REQUIRED' | 'INVOICE_PERMISSION_REQUEST' | 'COMPLIANCE_WARNING' | 'SECURITY_ALERT' | 'WORKFLOW_UPDATE';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// New onboarding and workflow enum types
export type ClientOnboardingStatus = 'PENDING_VALIDATION' | 'EMAIL_SENT' | 'CLIENT_CONFIRMED' | 'ADMIN_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type ClientApprovalStatus = 'PENDING_APPROVAL' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_CHANGES' | 'ESCALATED';
export type ApprovalPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type EmailType = 'CLIENT_CONFIRMATION' | 'ADMIN_NOTIFICATION' | 'APPROVAL_NOTIFICATION' | 'REJECTION_NOTIFICATION' | 'REMINDER' | 'WELCOME' | 'PASSWORD_RESET' | 'INVOICE_NOTIFICATION' | 'PAYMENT_REMINDER';
export type EmailStatus = 'PENDING' | 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED' | 'BOUNCED' | 'SPAM';
export type UserRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'USER' | 'CLIENT_VIEWER' | 'INVOICE_MANAGER' | 'CREDITOR_MANAGER' | 'READ_ONLY';

// KvK API Integration Types
export interface KvKCompanyData {
  kvkNumber: string;
  name: string;
  tradeName?: string;
  legalForm?: string;
  businessStatus?: string;
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  website?: string;
  sbiCodes?: Array<{
    code: string;
    description: string;
    indication: string;
  }>;
  establishmentDate?: string;
  employeeCount?: string;
}

export interface KvKValidationResult {
  isValid: boolean;
  companyData?: KvKCompanyData;
  error?: string;
  source: 'openkvk' | 'cache' | 'fallback';
  validatedAt: Date;
}

export interface KvKValidationState {
  isValidating: boolean;
  hasValidated: boolean;
  result?: KvKValidationResult;
  error?: string;
}

// BTW/VAT API Integration Types
export interface BTWValidationResult {
  btwNumber: string;
  isValid: boolean;
  companyName?: string;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  validatedAt: Date;
  source: 'API' | 'CACHE' | 'FALLBACK';
  error?: string;
  warnings?: string[];
}

export interface BTWValidationState {
  isValidating: boolean;
  hasValidated: boolean;
  result?: BTWValidationResult;
  error?: string;
}

// Technical Validation Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
  warnings?: string[];
}

export interface FormValidationState {
  isValidating: boolean;
  hasErrors: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string[]>;
  validatedFields: Set<string>;
}

// Enhanced Creditor form with KvK and BTW validation
export interface CreditorFormData {
  // Basic information
  name: string;
  email?: string;
  phone?: string;
  // Business details with validation
  companyName?: string;
  kvkNumber?: string;
  vatNumber?: string;
  // Contact details
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  // Banking information
  iban?: string;
  bankName?: string;
  accountHolder?: string;
  // Validation states
  kvkValidation?: KvKValidationState;
  btwValidation?: BTWValidationState;
}

// Client onboarding workflow types
export interface ClientApproval {
  id: string;
  clientId: string;
  status: ClientApprovalStatus;
  requestedBy: string;
  requestedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvalNotes?: string;
  rejectionReason?: string;
  documents: string[];
  validationChecks?: Record<string, any>;
  workflowStep: string;
  priority: ApprovalPriority;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  clientId?: string;
  type: EmailType;
  recipient: string;
  subject: string;
  template: string;
  language: string;
  templateData?: Record<string, any>;
  htmlContent?: string;
  textContent?: string;
  status: EmailStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  confirmationToken?: string;
  confirmedAt?: Date;
  confirmationData?: Record<string, any>;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  provider?: string;
  providerMessageId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientValidation {
  id: string;
  clientId: string;
  validationType: ValidationMethod;
  status: ValidationStatus;
  kvkCheck?: Record<string, any>;
  btwCheck?: Record<string, any>;
  ibanCheck?: Record<string, any>;
  emailCheck?: Record<string, any>;
  phoneCheck?: Record<string, any>;
  addressCheck?: Record<string, any>;
  requestedBy: string;
  requestedAt: Date;
  validatedBy?: string;
  validatedAt?: Date;
  overallScore?: number;
  findings?: Record<string, any>;
  recommendations?: string;
  notes?: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  userId: string;
  role: UserRoleType;
  permissions: string[];
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  scopeType?: string;
  scopeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  targetRoles: string[];
  targetUsers: string[];
  entityType?: string;
  entityId?: string;
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
  publishedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  viewedBy: string[];
  acknowledgedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced client form for onboarding
export interface ClientFormData {
  // Basic information - Step 1
  name: string;
  email: string;
  phone: string;
  
  // Business details - Step 2
  company?: string;
  kvkNumber?: string;
  vatNumber?: string;
  businessType: BusinessType;
  
  // Contact details - Step 3
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  
  // Admin contact - Step 4
  adminContactName?: string;
  adminContactEmail?: string;
  adminContactPhone?: string;
  adminDepartment?: string;
  
  // Banking info - Step 5
  iban?: string;
  bankName?: string;
  accountHolder?: string;
  postboxNumber?: string;
  
  // Validation states
  kvkValidation?: KvKValidationState;
  btwValidation?: BTWValidationState;
  
  // Workflow
  onboardingStep: OnboardingStep;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
}

// Email template system
export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailType;
  language: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplateData {
  clientName: string;
  companyName?: string;
  confirmationUrl?: string;
  adminContactName?: string;
  adminContactEmail?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  nextSteps?: string;
  supportEmail: string;
  supportPhone: string;
  platformUrl: string;
  brandName: string;
  [key: string]: any;
}

// Admin dashboard types
export interface AdminDashboardStats {
  pendingApprovals: number;
  pendingValidations: number;
  emailsSentToday: number;
  emailsFailedToday: number;
  newClientsThisWeek: number;
  completedOnboardingsThisWeek: number;
  averageApprovalTime: number; // hours
  clientsByStatus: Record<ClientOnboardingStatus, number>;
  validationsByType: Record<ValidationMethod, number>;
  emailsByStatus: Record<EmailStatus, number>;
}

export interface WorkflowState {
  clientId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  validationResults: {
    kvk: boolean;
    btw: boolean;
    iban: boolean;
    email: boolean;
    phone: boolean;
  };
  requiresAdminReview: boolean;
  blockers: string[];
  nextAction: string;
  estimatedCompletion?: Date;
}

// Permission system
export interface Permission {
  action: string;
  resource: string;
  scope?: string;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  requiredRole?: UserRoleType;
  requiredPermissions?: string[];
}

// Re-export audit types for convenience
export type {
  AuditEvent,
  AuditFilter,
  ComplianceCheck,
  ComplianceReport,
  ComplianceIssue,
  AuditConfiguration,
  ValidationRule,
  AuditMiddleware,
  ImmuDBRecord,
  ImmuDBVerification,
  ComplianceDashboard,
  RetentionPolicy,
  RetentionStatus
} from './types/audit';
