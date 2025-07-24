
import { Client, Invoice, Appointment, Document, InvoiceItem, BTWRecord, TaxReservation, TaxSettings } from './types';
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
