
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  createdAt: Date;
  totalInvoiced: number;
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
export type NotificationType = 'VALIDATION_REQUIRED' | 'PAYMENT_DUE' | 'CREDITOR_VALIDATED' | 'SYSTEM_ALERT' | 'BTW_DEADLINE';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

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

// Enhanced Creditor form with KvK validation
export interface CreditorFormData {
  // Basic information
  name: string;
  email?: string;
  phone?: string;
  // Business details with KvK validation
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
  // KvK validation state
  kvkValidation?: KvKValidationState;
}
