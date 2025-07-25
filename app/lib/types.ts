
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

// Enhanced Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  title?: string;
  description: string;
  notes?: string;
  
  // Amounts
  subtotal: number;
  btwAmount: number;
  totalAmount: number;
  btwRate: number;
  
  // Dates
  issueDate: string;
  dueDate: string;
  dueDateType: DueDateType;
  
  // Status and tracking
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  
  // PDF and email
  pdfPath?: string;
  pdfGenerated: boolean;
  pdfGeneratedAt?: string;
  emailSent: boolean;
  emailSentAt?: string;
  
  // Late payment
  remindersSent: number;
  lastReminderAt?: string;
  interestRate?: number;
  
  // Relations
  client: Client;
  lineItems: InvoiceLineItem[];
  emailLogs?: InvoiceEmailLog[];
  
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitType: InvoiceUnitType;
  rate: number;
  amount: number;
  notes?: string;
  category?: string;
  sortOrder: number;
  standardService?: StandardService;
}

export interface StandardService {
  id: string;
  name: string;
  description?: string;
  category?: string;
  defaultRate: number;
  unitType: InvoiceUnitType;
  isActive: boolean;
  isDefault: boolean;
  timesUsed: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceEmailLog {
  id: string;
  emailType: InvoiceEmailType;
  recipient: string;
  subject: string;
  status: EmailStatus;
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  retryCount: number;
  provider?: string;
  providerMessageId?: string;
  createdAt: string;
}

// Form types for invoice creation
export interface InvoiceFormData {
  title?: string;
  description: string;
  notes?: string;
  clientId: string;
  dueDateType: DueDateType;
  customDueDate?: string;
  lineItems: InvoiceLineItemFormData[];
}

export interface InvoiceLineItemFormData {
  description: string;
  quantity: number;
  unitType: InvoiceUnitType;
  rate: number;
  notes?: string;
  category?: string;
  standardServiceId?: string;
}

export interface StandardServiceFormData {
  name: string;
  description?: string;
  category?: string;
  defaultRate: number;
  unitType: InvoiceUnitType;
  isDefault?: boolean;
}

// Calculation types
export interface InvoiceCalculation {
  subtotal: number;
  btwAmount: number;
  totalAmount: number;
  lineItems: {
    id?: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
}

// PDF generation types
export interface InvoicePDFData {
  invoice: Invoice;
  companyInfo: {
    name: string;
    address: string;
    postalCode: string;
    city: string;
    country: string;
    kvkNumber: string;
    vatNumber: string;
    iban: string;
  };
  clientInfo: {
    name: string;
    company?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
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

// Enhanced invoice enum types
export type DueDateType = 'SEVEN_DAYS' | 'FOURTEEN_DAYS' | 'THIRTY_DAYS' | 'CUSTOM';
export type InvoiceUnitType = 'HOURS' | 'AMOUNT' | 'DAYS' | 'PIECES' | 'KILOMETERS' | 'PERCENTAGE' | 'OTHER';
export type InvoiceEmailType = 'INVOICE_SENT' | 'REMINDER_SENT' | 'FINAL_NOTICE' | 'PAYMENT_RECEIVED' | 'INVOICE_CANCELLED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

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
// ===== COMPLIANCE & LEGAL DOCUMENT TYPES =====

// Legal Document Types
export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  description?: string;
  version: string;
  language: string;
  content: string;
  templateData?: Record<string, any>;
  status: DocumentStatus;
  publishedAt?: Date;
  effectiveFrom: Date;
  expiresAt?: Date;
  jurisdiction: string;
  legalBasis?: string;
  complianceStandard: string[];
  parentVersion?: string;
  changeReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  signatures?: ESignature[];
  consents?: ClientConsent[];
  createdAt: Date;
  updatedAt: Date;
}

// Client Consent (GDPR)
export interface ClientConsent {
  id: string;
  clientId?: string;
  userId?: string;
  documentId: string;
  document: LegalDocument;
  consentType: ConsentType;
  purpose: string;
  legalBasis: GDPRLegalBasis;
  status: ConsentStatus;
  givenAt?: Date;
  withdrawnAt?: Date;
  expiredAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  method: ConsentMethod;
  evidence?: Record<string, any>;
  dataCategories: string[];
  retentionPeriod?: number;
  thirdPartySharing: boolean;
  thirdParties: string[];
  auditTrail?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Digital Signature
export interface ESignature {
  id: string;
  signerId?: string;
  signerEmail: string;
  signerName: string;
  signerRole?: string;
  documentId: string;
  document: LegalDocument;
  signatureData: string; // Base64 encoded
  signatureType: SignatureType;
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  certificateId?: string;
  hashValue: string;
  verificationCode: string;
  status: SignatureStatus;
  signedAt?: Date;
  witnessedBy?: string;
  witnessedAt?: Date;
  complianceLevel: ComplianceLevel;
  auditTrail?: Record<string, any>;
  verifications?: SignatureVerification[];
  createdAt: Date;
  updatedAt: Date;
}

// Signature Verification
export interface SignatureVerification {
  id: string;
  signatureId: string;
  signature: ESignature;
  verifiedBy?: string;
  verificationType: VerificationType;
  result: VerificationResult;
  hashMatches: boolean;
  timestampValid: boolean;
  certificateValid?: boolean;
  verifiedAt: Date;
  notes?: string;
}

// Wwft (Anti-Money Laundering) Check
export interface WwftCheck {
  id: string;
  entityType: string;
  entityId: string;
  cddLevel: CDDLevel;
  riskLevel: RiskLevel;
  identityVerified: boolean;
  identityDocuments: string[];
  identityVerifiedAt?: Date;
  identityVerifiedBy?: string;
  beneficialOwnership?: Record<string, any>;
  beneficialOwnersVerified: boolean;
  pepCheck: boolean;
  pepStatus: PEPStatus;
  pepCheckDate?: Date;
  sanctionsCheck: boolean;
  sanctionsResult: SanctionsResult;
  sanctionsCheckDate?: Date;
  monitoringEnabled: boolean;
  monitoringLevel: MonitoringLevel;
  recordsRetainUntil: Date;
  status: ComplianceStatus;
  completedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  nextReviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// PSD2 Strong Customer Authentication
export interface PSD2Authentication {
  id: string;
  userId: string;
  user: User;
  knowledgeFactor?: string;
  possessionFactor?: string;
  inherenceFactor?: string;
  transactionId?: string;
  amount?: number;
  payee?: string;
  transactionType?: string;
  status: AuthenticationStatus;
  authenticatedAt?: Date;
  expiresAt: Date;
  riskScore?: number;
  exemptionApplied: boolean;
  exemptionReason?: string;
  ipAddress: string;
  deviceId?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Data Retention Policy
export interface DataRetentionPolicy {
  id: string;
  name: string;
  description?: string;
  dataCategory: string;
  entityType: string;
  retentionPeriod: number;
  legalBasis: string;
  jurisdiction: string;
  autoDelete: boolean;
  deletionMethod: DeletionMethod;
  notifyBefore?: number;
  isActive: boolean;
  retentionRecords?: DataRetentionRecord[];
  createdAt: Date;
  updatedAt: Date;
}

// Data Retention Record
export interface DataRetentionRecord {
  id: string;
  policyId: string;
  policy: DataRetentionPolicy;
  entityType: string;
  entityId: string;
  entityData?: Record<string, any>;
  scheduledFor: Date;
  deletedAt?: Date;
  deletionResult?: DeletionResult;
  deletedBy?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ISO 27001 Security Control
export interface SecurityControl {
  id: string;
  controlId: string;
  title: string;
  description: string;
  category: string;
  implementationStatus: ImplementationStatus;
  implementedBy?: string;
  implementedAt?: Date;
  evidence: string[];
  procedures?: string;
  responsibleParty?: string;
  riskLevel: RiskLevel;
  riskMitigation?: string;
  lastReviewed?: Date;
  reviewedBy?: string;
  nextReview?: Date;
  auditFindings?: string;
  isoRequirement?: string;
  otherStandards: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Business Continuity Plan (ISO 22301)
export interface BusinessContinuityPlan {
  id: string;
  name: string;
  description?: string;
  scope: string;
  version: string;
  businessImpactAnalysis?: Record<string, any>;
  riskAssessment?: Record<string, any>;
  rto?: number; // Recovery Time Objective
  rpo?: number; // Recovery Point Objective
  mtpd?: number; // Maximum Tolerable Period of Disruption
  procedures: string;
  contacts?: Record<string, any>;
  resources?: Record<string, any>;
  lastTested?: Date;
  testedBy?: string;
  testResults?: string;
  nextTest?: Date;
  status: PlanStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Legal Document Form Data
export interface LegalDocumentFormData {
  type: LegalDocumentType;
  title: string;
  description?: string;
  content: string;
  language?: string;
  templateData?: Record<string, any>;
  jurisdiction?: string;
  legalBasis?: string;
  complianceStandard?: string[];
  effectiveFrom?: Date;
  expiresAt?: Date;
}

// Consent Form Data
export interface ConsentFormData {
  documentId: string;
  consentType: ConsentType;
  purpose: string;
  legalBasis: GDPRLegalBasis;
  dataCategories: string[];
  retentionPeriod?: number;
  thirdPartySharing?: boolean;
  thirdParties?: string[];
  evidence?: Record<string, any>;
}

// E-Signature Form Data
export interface ESignatureFormData {
  documentId: string;
  signerEmail: string;
  signerName: string;
  signerRole?: string;
  signatureData: string;
  signatureType: SignatureType;
  location?: string;
  witnessedBy?: string;
}

// Compliance Dashboard Stats
export interface ComplianceDashboardStats {
  totalDocuments: number;
  activeDocuments: number;
  pendingSignatures: number;
  activeConsents: number;
  withdrawnConsents: number;
  complianceChecks: {
    total: number;
    compliant: number;
    nonCompliant: number;
    pending: number;
  };
  wwftChecks: {
    total: number;
    completed: number;
    pending: number;
    highRisk: number;
  };
  dataRetention: {
    totalPolicies: number;
    scheduledDeletions: number;
    completedDeletions: number;
  };
  securityControls: {
    total: number;
    implemented: number;
    partiallyImplemented: number;
    notImplemented: number;
  };
}

// Compliance Enum Types
export type LegalDocumentType = 
  | 'TERMS_CONDITIONS'
  | 'PRIVACY_POLICY'
  | 'AUTHORIZATION_AGREEMENT'
  | 'COOKIE_POLICY'
  | 'PROCESSOR_AGREEMENT'
  | 'GDPR_CONSENT'
  | 'SERVICE_AGREEMENT'
  | 'NDA';

export type DocumentStatus = 
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'WITHDRAWN';

export type ComplianceLevel = 
  | 'STANDARD'
  | 'ENHANCED'
  | 'REGULATORY';

export type ComplianceStatus = 
  | 'PENDING'
  | 'COMPLIANT'
  | 'NON_COMPLIANT';

export type ConsentType =
  | 'DATA_PROCESSING'
  | 'MARKETING'
  | 'PROFILING'
  | 'THIRD_PARTY_SHARING'
  | 'COOKIES'
  | 'NEWSLETTER'
  | 'RESEARCH';

export type GDPRLegalBasis =
  | 'CONSENT'
  | 'CONTRACT'
  | 'LEGAL_OBLIGATION'
  | 'VITAL_INTERESTS'
  | 'PUBLIC_TASK'
  | 'LEGITIMATE_INTERESTS';

export type ConsentStatus =
  | 'PENDING'
  | 'GIVEN'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'INVALID';

export type ConsentMethod =
  | 'WEB_FORM'
  | 'EMAIL_CONFIRMATION'
  | 'PAPER_FORM'
  | 'PHONE_CONSENT'
  | 'API'
  | 'IMPORT';

export type SignatureType =
  | 'DRAWN'
  | 'TYPED'
  | 'UPLOADED'
  | 'BIOMETRIC'
  | 'CERTIFICATE';

export type SignatureStatus =
  | 'PENDING'
  | 'SIGNED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'INVALID'
  | 'WITNESSED';

export type VerificationType =
  | 'HASH_VERIFICATION'
  | 'TIMESTAMP_CHECK'
  | 'CERTIFICATE_CHECK'
  | 'BIOMETRIC_MATCH'
  | 'MANUAL_REVIEW';

export type VerificationResult =
  | 'VALID'
  | 'INVALID'
  | 'INCONCLUSIVE'
  | 'EXPIRED'
  | 'REVOKED'
  | 'PENDING';

export type CDDLevel =
  | 'SIMPLIFIED'
  | 'STANDARD'
  | 'ENHANCED';

export type RiskLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type PEPStatus =
  | 'NOT_PEP'
  | 'DOMESTIC_PEP'
  | 'FOREIGN_PEP'
  | 'INTERNATIONAL_PEP'
  | 'FAMILY_MEMBER'
  | 'CLOSE_ASSOCIATE';

export type SanctionsResult =
  | 'CLEAR'
  | 'POTENTIAL_MATCH'
  | 'CONFIRMED_MATCH'
  | 'FALSE_POSITIVE'
  | 'UNDER_REVIEW';

export type MonitoringLevel =
  | 'BASIC'
  | 'STANDARD'
  | 'ENHANCED'
  | 'CONTINUOUS';

export type AuthenticationStatus =
  | 'PENDING'
  | 'AUTHENTICATED'
  | 'FAILED'
  | 'EXPIRED'
  | 'EXEMPTED';

export type DeletionMethod =
  | 'SOFT_DELETE'
  | 'SECURE_DELETE'
  | 'ANONYMIZATION'
  | 'PSEUDONYMIZATION'
  | 'ARCHIVAL';

export type DeletionResult =
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'FAILED'
  | 'PENDING'
  | 'CANCELLED'
  | 'ERROR';

export type ImplementationStatus =
  | 'NOT_IMPLEMENTED'
  | 'PARTIALLY_IMPLEMENTED'
  | 'IMPLEMENTED'
  | 'NOT_APPLICABLE'
  | 'UNDER_REVIEW';

export type PlanStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'ARCHIVED'
  | 'SUPERSEDED';

// Extended Client Form Data
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

// Due date calculation helpers
export const DUE_DATE_OPTIONS = [
  { value: 'SEVEN_DAYS', label: '7 dagen', days: 7 },
  { value: 'FOURTEEN_DAYS', label: '14 dagen', days: 14 },
  { value: 'THIRTY_DAYS', label: '30 dagen', days: 30 },
  { value: 'CUSTOM', label: 'Aangepaste datum', days: 0 }
] as const;

export const UNIT_TYPE_OPTIONS = [
  { value: 'HOURS', label: 'Uren', symbol: 'uur' },
  { value: 'AMOUNT', label: 'Vast bedrag', symbol: '€' },
  { value: 'DAYS', label: 'Dagen', symbol: 'dag' },
  { value: 'PIECES', label: 'Stuks', symbol: 'st' },
  { value: 'KILOMETERS', label: 'Kilometers', symbol: 'km' },
  { value: 'PERCENTAGE', label: 'Percentage', symbol: '%' },
  { value: 'OTHER', label: 'Anders', symbol: '' }
] as const;
