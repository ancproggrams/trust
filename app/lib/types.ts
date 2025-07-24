
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
  amount: number;
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

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  upcomingAppointments: number;
  totalClients: number;
  completedAppointments: number;
}
