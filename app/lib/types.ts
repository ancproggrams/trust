
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
}
