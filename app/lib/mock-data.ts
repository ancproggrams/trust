
import { 
  Client, Invoice, Appointment, Document, InvoiceItem, BTWRecord, TaxReservation, TaxSettings,
  Creditor, CreditorValidation, Payment, AuditLog, UserProfile, DemoSettings,
  ValidationStatus, BusinessType, OnboardingStep, ValidationMethod, PaymentStatus, PaymentMethod, AuditAction
} from './types';
import { calculateBTW, calculateTotalAmount, getBTWQuarter, getNextBTWDeadline, calculateTaxReservation } from './utils';

// Mock Clients Data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.nl',
    phone: '+31 20 123 4567',
    company: 'Acme Corporation B.V.',
    address: 'Hoofdstraat 123, 1000 AB Amsterdam',
    createdAt: new Date('2024-01-15'),
    totalInvoiced: 15750.00,
  },
  {
    id: '2',
    name: 'TechStart Solutions',
    email: 'info@techstart.nl',
    phone: '+31 30 234 5678',
    company: 'TechStart Solutions B.V.',
    address: 'Innovation Park 45, 3500 CD Utrecht',
    createdAt: new Date('2024-02-20'),
    totalInvoiced: 8900.00,
  },
  {
    id: '3',
    name: 'Green Energy Partners',
    email: 'hello@greenenergy.nl',
    phone: '+31 40 345 6789',
    company: 'Green Energy Partners',
    address: 'Energieweg 67, 5600 EF Eindhoven',
    createdAt: new Date('2024-03-10'),
    totalInvoiced: 22300.00,
  },
  {
    id: '4',
    name: 'Digital Marketing Pro',
    email: 'team@digitalmarketingpro.nl',
    phone: '+31 10 456 7890',
    company: 'Digital Marketing Pro',
    address: 'Marketingplein 89, 3000 GH Rotterdam',
    createdAt: new Date('2024-04-01'),
    totalInvoiced: 5640.00,
  },
  {
    id: '5',
    name: 'Healthcare Innovations',
    email: 'contact@healthcareinnovations.nl',
    phone: '+31 50 567 8901',
    company: 'Healthcare Innovations B.V.',
    address: 'Medisch Centrum 12, 9700 IJ Groningen',
    createdAt: new Date('2024-05-15'),
    totalInvoiced: 11800.00,
  },
];

// Mock Invoice Items
const mockInvoiceItems: InvoiceItem[] = [
  {
    id: '1',
    description: 'Website ontwikkeling',
    quantity: 40,
    rate: 85.00,
    amount: 3400.00,
  },
  {
    id: '2',
    description: 'SEO optimalisatie',
    quantity: 20,
    rate: 75.00,
    amount: 1500.00,
  },
  {
    id: '3',
    description: 'Consultancy uren',
    quantity: 15,
    rate: 95.00,
    amount: 1425.00,
  },
];

// Create invoices with BTW calculations
const createInvoiceWithBTW = (invoice: any): Invoice => {
  const btwRate = 21; // 21% BTW
  const btwAmount = calculateBTW(invoice.amount, btwRate);
  const totalAmount = calculateTotalAmount(invoice.amount, btwRate);
  
  return {
    ...invoice,
    btwAmount,
    totalAmount,
    btwRate,
  };
};

// Mock Invoices Data
export const mockInvoices: Invoice[] = [
  createInvoiceWithBTW({
    id: '1',
    clientId: '1',
    clientName: 'Acme Corporation',
    invoiceNumber: 'INV-2024-001',
    amount: 6325.00,
    status: 'paid',
    dueDate: new Date('2024-07-31'),
    createdAt: new Date('2024-07-01'),
    description: 'Website ontwikkeling en SEO optimalisatie',
    items: mockInvoiceItems.slice(0, 2),
  }),
  createInvoiceWithBTW({
    id: '2',
    clientId: '2',
    clientName: 'TechStart Solutions',
    invoiceNumber: 'INV-2024-002',
    amount: 4750.00,
    status: 'sent',
    dueDate: new Date('2024-08-15'),
    createdAt: new Date('2024-07-15'),
    description: 'Consultancy en implementatie',
    items: [mockInvoiceItems[2]],
  }),
  createInvoiceWithBTW({
    id: '3',
    clientId: '3',
    clientName: 'Green Energy Partners',
    invoiceNumber: 'INV-2024-003',
    amount: 7800.00,
    status: 'overdue',
    dueDate: new Date('2024-07-20'),
    createdAt: new Date('2024-06-20'),
    description: 'Energie management systeem',
    items: mockInvoiceItems,
  }),
  createInvoiceWithBTW({
    id: '4',
    clientId: '4',
    clientName: 'Digital Marketing Pro',
    invoiceNumber: 'INV-2024-004',
    amount: 2850.00,
    status: 'draft',
    dueDate: new Date('2024-08-30'),
    createdAt: new Date('2024-07-20'),
    description: 'Marketing automation setup',
    items: [mockInvoiceItems[1]],
  }),
  createInvoiceWithBTW({
    id: '5',
    clientId: '5',
    clientName: 'Healthcare Innovations',
    invoiceNumber: 'INV-2024-005',
    amount: 5200.00,
    status: 'sent',
    dueDate: new Date('2024-08-25'),
    createdAt: new Date('2024-07-25'),
    description: 'Healthtech platform ontwikkeling',
    items: [mockInvoiceItems[0]],
  }),
];

// Mock Appointments Data
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Acme Corporation',
    title: 'Project kickoff meeting',
    description: 'Bespreken van project requirements en timeline',
    date: new Date('2024-08-05T10:00:00'),
    duration: 90,
    status: 'scheduled',
    location: 'Online via Teams',
    createdAt: new Date('2024-07-20'),
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'TechStart Solutions',
    title: 'Consultancy sessie',
    description: 'Advies over technische architectuur',
    date: new Date('2024-08-07T14:00:00'),
    duration: 120,
    status: 'scheduled',
    location: 'Utrecht kantoor',
    createdAt: new Date('2024-07-22'),
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Green Energy Partners',
    title: 'Demo presentatie',
    description: 'Demonstratie van energie management dashboard',
    date: new Date('2024-07-30T09:00:00'),
    duration: 60,
    status: 'completed',
    location: 'Eindhoven kantoor',
    createdAt: new Date('2024-07-15'),
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Digital Marketing Pro',
    title: 'Strategie bespreking',
    description: 'Planning voor Q4 marketing campagnes',
    date: new Date('2024-08-10T11:00:00'),
    duration: 75,
    status: 'scheduled',
    location: 'Online via Zoom',
    createdAt: new Date('2024-07-24'),
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'Healthcare Innovations',
    title: 'Security review',
    description: 'Beoordeling van beveiligingsmaatregelen',
    date: new Date('2024-08-12T13:30:00'),
    duration: 90,
    status: 'scheduled',
    location: 'Groningen kantoor',
    createdAt: new Date('2024-07-26'),
  },
];

// Mock Documents Data
export const mockDocuments: Document[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Acme Corporation',
    title: 'Website Development Contract',
    description: 'Overeenkomst voor website ontwikkeling project',
    type: 'contract',
    status: 'signed',
    createdAt: new Date('2024-07-01'),
    signedAt: new Date('2024-07-03'),
    content: 'Contract voor website ontwikkeling inclusief SEO optimalisatie...',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'TechStart Solutions',
    title: 'NDA Agreement',
    description: 'Geheimhoudingsverklaring voor consultancy project',
    type: 'agreement',
    status: 'pending_signature',
    createdAt: new Date('2024-07-15'),
    content: 'Geheimhoudingsovereenkomst betreffende vertrouwelijke informatie...',
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Green Energy Partners',
    title: 'Project Proposal',
    description: 'Voorstel voor energie management systeem',
    type: 'other',
    status: 'completed',
    createdAt: new Date('2024-06-15'),
    signedAt: new Date('2024-06-20'),
    content: 'Projectvoorstel voor implementatie van energie management dashboard...',
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Digital Marketing Pro',
    title: 'Service Agreement',
    description: 'Overeenkomst voor marketing automation services',
    type: 'agreement',
    status: 'draft',
    createdAt: new Date('2024-07-20'),
    content: 'Service overeenkomst voor marketing automation en consultancy...',
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'Healthcare Innovations',
    title: 'Security Compliance Document',
    description: 'Beveiligingsrichtlijnen en compliance documentatie',
    type: 'other',
    status: 'pending_signature',
    createdAt: new Date('2024-07-25'),
    content: 'Documentatie betreffende beveiligingsmaatregelen en compliance...',
  },
];

// Helper functions for data operations
export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};

export const getInvoicesByClientId = (clientId: string): Invoice[] => {
  return mockInvoices.filter(invoice => invoice.clientId === clientId);
};

export const getAppointmentsByClientId = (clientId: string): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.clientId === clientId);
};

export const getDocumentsByClientId = (clientId: string): Document[] => {
  return mockDocuments.filter(document => document.clientId === clientId);
};

export const getRecentInvoices = (limit: number = 5): Invoice[] => {
  return mockInvoices
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const getUpcomingAppointments = (limit: number = 5): Appointment[] => {
  const now = new Date();
  return mockAppointments
    .filter(appointment => appointment.date > now && appointment.status === 'scheduled')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
};

// Mock BTW Records Data
export const mockBTWRecords: BTWRecord[] = mockInvoices.map(invoice => {
  const quarter = getBTWQuarter(invoice.createdAt);
  const dueDate = getNextBTWDeadline(quarter);
  
  return {
    id: `btw-${invoice.id}`,
    invoiceId: invoice.id,
    amount: invoice.amount,
    btwAmount: invoice.btwAmount,
    btwRate: invoice.btwRate,
    status: invoice.status === 'paid' ? 'reserved' : 'pending',
    quarter,
    dueDate,
    paidDate: invoice.status === 'paid' ? new Date(invoice.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined,
    createdAt: invoice.createdAt,
  };
});

// Mock Tax Reservation Data
export const mockTaxReservations: TaxReservation[] = mockInvoices
  .filter(invoice => invoice.status === 'paid')
  .map(invoice => {
    const reservationRate = 25; // 25% reservering voor omzetbelasting
    const reservationAmount = calculateTaxReservation(invoice.amount, reservationRate);
    
    return {
      id: `tax-${invoice.id}`,
      invoiceId: invoice.id,
      amount: reservationAmount,
      reservationRate,
      year: invoice.createdAt.getFullYear(),
      status: 'active',
      createdAt: invoice.createdAt,
    };
  });

// Mock Tax Settings
export const mockTaxSettings: TaxSettings = {
  // BTW instellingen
  defaultBTWRate: 21,
  btwEnabled: true,
  quarterlyBTWPrepaymentsEnabled: true,
  btwPrepaymentAmount: 1500.00,
  
  // Omzetbelasting instellingen
  taxReservationEnabled: true,
  taxReservationRate: 25,
  annualTaxThreshold: 20000.00,
  
  // Belastingdienst instellingen
  taxOfficeContactEmail: 'contact@belastingdienst.nl',
  taxFilingMethod: 'manual',
  lastTaxFilingDate: new Date('2024-06-30'),
};

// BTW gerelateerde helper functions
export const getBTWRecordsByQuarter = (quarter: string): BTWRecord[] => {
  return mockBTWRecords.filter(record => record.quarter === quarter);
};

export const getTaxReservationsByYear = (year: number): TaxReservation[] => {
  return mockTaxReservations.filter(reservation => reservation.year === year);
};

export const getCurrentQuarterBTW = (): BTWRecord[] => {
  const currentQuarter = getBTWQuarter(new Date());
  return getBTWRecordsByQuarter(currentQuarter);
};

export const getTotalBTWOwed = (): number => {
  return mockBTWRecords
    .filter(record => record.status === 'pending' || record.status === 'reserved')
    .reduce((sum, record) => sum + record.btwAmount, 0);
};

export const getTotalBTWPrepaid = (): number => {
  return mockBTWRecords
    .filter(record => record.status === 'prepaid')
    .reduce((sum, record) => sum + record.btwAmount, 0);
};

export const getTotalTaxReserved = (): number => {
  return mockTaxReservations
    .filter(reservation => reservation.status === 'active')
    .reduce((sum, reservation) => sum + reservation.amount, 0);
};

export const getCurrentYearRevenue = (): number => {
  const currentYear = new Date().getFullYear();
  return mockInvoices
    .filter(invoice => invoice.createdAt.getFullYear() === currentYear && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
};

export const getEstimatedYearEndTax = (): number => {
  const currentYearRevenue = getCurrentYearRevenue();
  return calculateTaxReservation(currentYearRevenue, mockTaxSettings.taxReservationRate);
};

// Mock User Profiles Data
export const mockUserProfiles: UserProfile[] = [
  {
    id: '1',
    userId: '1',
    companyName: 'Jan Janssen Consultancy',
    kvkNumber: '12345678',
    vatNumber: 'NL123456789B01',
    phone: '+31 6 12345678',
    address: 'Hoofdstraat 123',
    postalCode: '1000AB',
    city: 'Amsterdam',
    country: 'Netherlands',
    iban: 'NL91ABNA0417164300',
    bankName: 'ABN AMRO',
    accountHolder: 'Jan Janssen',
    validationStatus: 'VALIDATED' as ValidationStatus,
    validatedAt: new Date('2024-01-20'),
    validatedBy: 'system',
    businessType: 'ZZP' as BusinessType,
    onboardingStep: 'COMPLETED' as OnboardingStep,
    onboardingCompletedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
];

// Mock Creditors Data
export const mockCreditors: Creditor[] = [
  {
    id: '1',
    userId: '1',
    name: 'TechSupport B.V.',
    email: 'facturen@techsupport.nl',
    phone: '+31 20 123 4567',
    companyName: 'TechSupport B.V.',
    kvkNumber: '87654321',
    vatNumber: 'NL987654321B01',
    address: 'Techstraat 45',
    postalCode: '1100BB',
    city: 'Amsterdam',
    country: 'Netherlands',
    iban: 'NL12RABO0123456789',
    bankName: 'Rabobank',
    accountHolder: 'TechSupport B.V.',
    validationStatus: 'VALIDATED' as ValidationStatus,
    validatedAt: new Date('2024-06-15'),
    validatedBy: 'admin',
    isActive: true,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: '2',
    userId: '1',
    name: 'Office Solutions',
    email: 'info@officesolutions.nl',
    phone: '+31 30 234 5678',
    companyName: 'Office Solutions Nederland',
    kvkNumber: '56789012',
    vatNumber: 'NL567890123B01',
    address: 'Kantoorpark 12',
    postalCode: '3500CD',
    city: 'Utrecht',
    country: 'Netherlands',
    iban: 'NL34ING0567890123',
    bankName: 'ING Bank',
    accountHolder: 'Office Solutions Nederland',
    validationStatus: 'PENDING' as ValidationStatus,
    isActive: true,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-07-15'),
  },
  {
    id: '3',
    userId: '1',
    name: 'Marketing Experts',
    email: 'billing@marketingexperts.nl',
    phone: '+31 10 345 6789',
    companyName: 'Marketing Experts Rotterdam',
    kvkNumber: '34567890',
    vatNumber: 'NL345678901B01',
    address: 'Marketingweg 89',
    postalCode: '3000GH',
    city: 'Rotterdam',
    country: 'Netherlands',
    iban: 'NL56BUNQ2345678901',
    bankName: 'Bunq',
    accountHolder: 'Marketing Experts Rotterdam',
    validationStatus: 'IN_REVIEW' as ValidationStatus,
    isActive: true,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-22'),
  },
];

// Mock Creditor Validations Data
export const mockCreditorValidations: CreditorValidation[] = [
  {
    id: '1',
    creditorId: '1',
    validationType: 'AUTOMATIC' as ValidationMethod,
    status: 'VALIDATED' as ValidationStatus,
    requestedBy: '1',
    requestedAt: new Date('2024-06-01'),
    validatedBy: 'system',
    validatedAt: new Date('2024-06-15'),
    documents: [],
    notes: 'Automatische validatie succesvol. KvK en IBAN geverifieerd.',
    kvkValidated: true,
    ibanValidated: true,
    emailValidated: true,
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: '2',
    creditorId: '2',
    validationType: 'MANUAL' as ValidationMethod,
    status: 'PENDING' as ValidationStatus,
    requestedBy: '1',
    requestedAt: new Date('2024-07-15'),
    documents: ['kvk-uittreksel.pdf', 'iban-bevestiging.pdf'],
    notes: 'Handmatige validatie vereist vanwege ontbrekende automatische verificatie.',
    kvkValidated: false,
    ibanValidated: false,
    emailValidated: true,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-07-15'),
  },
  {
    id: '3',
    creditorId: '3',
    validationType: 'HYBRID' as ValidationMethod,
    status: 'IN_REVIEW' as ValidationStatus,
    requestedBy: '1',
    requestedAt: new Date('2024-07-20'),
    documents: ['business-certificate.pdf'],
    notes: 'Gedeeltelijke automatische validatie. Handmatige review van bedrijfsgegevens.',
    kvkValidated: true,
    ibanValidated: false,
    emailValidated: true,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-22'),
  },
];

// Mock Payments Data
export const mockPayments: Payment[] = [
  {
    id: '1',
    creditorId: '1',
    creditorName: 'TechSupport B.V.',
    amount: 2500.00,
    description: 'IT ondersteuning Q2 2024',
    reference: 'REF-2024-001',
    status: 'COMPLETED' as PaymentStatus,
    scheduledAt: new Date('2024-07-01'),
    processedAt: new Date('2024-07-01'),
    method: 'BANK_TRANSFER' as PaymentMethod,
    createdAt: new Date('2024-06-25'),
    updatedAt: new Date('2024-07-01'),
  },
  {
    id: '2',
    creditorId: '1',
    creditorName: 'TechSupport B.V.',
    amount: 1750.00,
    description: 'Software licenties',
    reference: 'REF-2024-002',
    status: 'SCHEDULED' as PaymentStatus,
    scheduledAt: new Date('2024-08-15'),
    method: 'BANK_TRANSFER' as PaymentMethod,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: '3',
    creditorId: '2',
    creditorName: 'Office Solutions',
    amount: 450.00,
    description: 'Kantoorbenodigdheden',
    reference: 'REF-2024-003',
    status: 'PENDING' as PaymentStatus,
    method: 'BANK_TRANSFER' as PaymentMethod,
    createdAt: new Date('2024-07-25'),
    updatedAt: new Date('2024-07-25'),
  },
];

// Mock Audit Logs Data
export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Jan Janssen',
    action: 'LOGIN' as AuditAction,
    entity: 'User',
    entityId: '1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-07-25T09:00:00'),
  },
  {
    id: '2',
    userId: '1',
    userName: 'Jan Janssen',
    action: 'CREATE' as AuditAction,
    entity: 'Creditor',
    entityId: '2',
    newValues: {
      name: 'Office Solutions',
      email: 'info@officesolutions.nl',
      validationStatus: 'PENDING',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-07-15T14:30:00'),
  },
  {
    id: '3',
    userId: '1',
    userName: 'Jan Janssen',
    action: 'VALIDATE' as AuditAction,
    entity: 'Creditor',
    entityId: '1',
    oldValues: { validationStatus: 'PENDING' },
    newValues: { validationStatus: 'VALIDATED', validatedAt: '2024-06-15' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-06-15T11:15:00'),
  },
  {
    id: '4',
    userId: '1',
    userName: 'Jan Janssen',
    action: 'PAYMENT_PROCESS' as AuditAction,
    entity: 'Payment',
    entityId: '1',
    oldValues: { status: 'SCHEDULED' },
    newValues: { status: 'COMPLETED', processedAt: '2024-07-01' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: new Date('2024-07-01T10:00:00'),
  },
];

// Mock Demo Settings
export const mockDemoSettings: DemoSettings = {
  isDemo: false,
  demoDataResetInterval: 60, // 1 hour
  allowedDemoFeatures: ['INVOICES', 'CLIENTS', 'APPOINTMENTS', 'DOCUMENTS', 'CREDITORS', 'BTW'],
};

// Helper functions for new data
export const getCreditorById = (id: string): Creditor | undefined => {
  return mockCreditors.find(creditor => creditor.id === id);
};

export const getCreditorsByUserId = (userId: string): Creditor[] => {
  return mockCreditors.filter(creditor => creditor.userId === userId);
};

export const getValidatedCreditors = (): Creditor[] => {
  return mockCreditors.filter(creditor => creditor.validationStatus === 'VALIDATED');
};

export const getPendingValidations = (): Creditor[] => {
  return mockCreditors.filter(creditor => creditor.validationStatus === 'PENDING' || creditor.validationStatus === 'IN_REVIEW');
};

export const getPaymentsByCreditorId = (creditorId: string): Payment[] => {
  return mockPayments.filter(payment => payment.creditorId === creditorId);
};

export const getPendingPayments = (): Payment[] => {
  return mockPayments.filter(payment => payment.status === 'PENDING' || payment.status === 'SCHEDULED');
};

export const getRecentAuditLogs = (limit: number = 10): AuditLog[] => {
  return mockAuditLogs
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const getAuditLogsByEntity = (entity: string, entityId: string): AuditLog[] => {
  return mockAuditLogs
    .filter(log => log.entity === entity && log.entityId === entityId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getUserProfileByUserId = (userId: string): UserProfile | undefined => {
  return mockUserProfiles.find(profile => profile.userId === userId);
};

// Extended dashboard stats with new data
export const getExtendedDashboardStats = () => {
  const baseStats = {
    totalInvoices: mockInvoices.length,
    totalRevenue: mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    pendingInvoices: mockInvoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue').length,
    upcomingAppointments: getUpcomingAppointments().length,
    totalClients: mockClients.length,
    completedAppointments: mockAppointments.filter(appointment => appointment.status === 'completed').length,
    totalBTWOwed: getTotalBTWOwed(),
    totalBTWPrepaid: getTotalBTWPrepaid(),
    nextBTWPaymentDue: null,
    totalTaxReserved: getTotalTaxReserved(),
    currentYearRevenue: getCurrentYearRevenue(),
    estimatedYearEndTax: getEstimatedYearEndTax(),
  };

  // Add new stats
  return {
    ...baseStats,
    totalCreditors: mockCreditors.length,
    pendingCreditorValidations: getPendingValidations().length,
    pendingPayments: getPendingPayments().length,
  };
};

// Demo data helper functions
export const getDemoData = () => {
  return {
    clients: mockClients,
    invoices: mockInvoices,
    appointments: mockAppointments,
    documents: mockDocuments,
    creditors: mockCreditors,
    payments: mockPayments,
  };
};

export const resetDemoData = () => {
  // In a real implementation, this would reset the demo data
  console.log('Demo data reset at:', new Date());
  return getDemoData();
};
