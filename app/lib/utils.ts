
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Euro
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Format date to Dutch locale
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  
  return new Intl.DateTimeFormat('nl-NL', options || defaultOptions).format(date);
}

// Format date and time
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Get relative time (e.g., "2 dagen geleden")
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Zojuist';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minuten geleden`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} uur geleden`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} dagen geleden`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weken geleden`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} maanden geleden`;
}

// Get invoice status color
export function getInvoiceStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-50';
    case 'sent':
      return 'text-blue-600 bg-blue-50';
    case 'overdue':
      return 'text-red-600 bg-red-50';
    case 'draft':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Get appointment status color
export function getAppointmentStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'text-blue-600 bg-blue-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Get document status color
export function getDocumentStatusColor(status: string): string {
  switch (status) {
    case 'signed':
      return 'text-green-600 bg-green-50';
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'pending_signature':
      return 'text-orange-600 bg-orange-50';
    case 'draft':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

// Translate status to Dutch
export function translateStatus(status: string, type: 'invoice' | 'appointment' | 'document'): string {
  if (type === 'invoice') {
    switch (status) {
      case 'paid':
        return 'Betaald';
      case 'sent':
        return 'Verzonden';
      case 'overdue':
        return 'Vervallen';
      case 'draft':
        return 'Concept';
      default:
        return status;
    }
  }
  
  if (type === 'appointment') {
    switch (status) {
      case 'scheduled':
        return 'Gepland';
      case 'completed':
        return 'Voltooid';
      case 'cancelled':
        return 'Geannuleerd';
      default:
        return status;
    }
  }
  
  if (type === 'document') {
    switch (status) {
      case 'signed':
        return 'Ondertekend';
      case 'completed':
        return 'Voltooid';
      case 'pending_signature':
        return 'Wacht op handtekening';
      case 'draft':
        return 'Concept';
      default:
        return status;
    }
  }
  
  return status;
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate IBAN format
export function isValidIBAN(iban: string): boolean {
  // Basic IBAN validation - remove spaces and check format
  const cleanIban = iban.replace(/\s/g, '').toLowerCase();
  
  // Check if it's a Dutch IBAN (starts with NL and is 18 characters)
  if (cleanIban.startsWith('nl') && cleanIban.length === 18) {
    return /^nl\d{2}[a-z]{4}\d{10}$/.test(cleanIban);
  }
  
  // Basic check for other European IBANs (15-34 characters, starts with 2 letters)
  return /^[a-z]{2}\d{2}[a-z0-9]{4,30}$/.test(cleanIban) && cleanIban.length >= 15 && cleanIban.length <= 34;
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

// BTW/Belasting utility functies
export function calculateBTW(amount: number, btwRate: number): number {
  return Math.round(amount * (btwRate / 100) * 100) / 100;
}

export function calculateAmountExclBTW(totalAmount: number, btwRate: number): number {
  return Math.round((totalAmount / (1 + btwRate / 100)) * 100) / 100;
}

export function calculateTotalAmount(amount: number, btwRate: number): number {
  const btwAmount = calculateBTW(amount, btwRate);
  return Math.round((amount + btwAmount) * 100) / 100;
}

export function calculateTaxReservation(amount: number, reservationRate: number): number {
  return Math.round(amount * (reservationRate / 100) * 100) / 100;
}

export function getBTWQuarter(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `Q${quarter}-${year}`;
}

export function getNextBTWDeadline(quarter: string): Date {
  const [q, year] = quarter.split('-');
  const quarterNum = parseInt(q.replace('Q', ''));
  const yearNum = parseInt(year);
  
  // BTW deadline is altijd de laatste dag van de maand na het kwartaal
  const deadlineMonth = quarterNum * 3; // Q1=maart, Q2=juni, Q3=september, Q4=december
  return new Date(yearNum, deadlineMonth, 0); // Laatste dag van de maand
}

export function getBTWStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-50';
    case 'prepaid':
      return 'text-blue-600 bg-blue-50';
    case 'reserved':
      return 'text-orange-600 bg-orange-50';
    case 'pending':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getTaxReservationStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50';
    case 'used':
      return 'text-blue-600 bg-blue-50';
    case 'released':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function translateBTWStatus(status: string): string {
  switch (status) {
    case 'paid':
      return 'Betaald';
    case 'prepaid':
      return 'Vooruitbetaald';
    case 'reserved':
      return 'Gereserveerd';
    case 'pending':
      return 'Openstaand';
    default:
      return status;
  }
}

export function translateTaxReservationStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Actief';
    case 'used':
      return 'Gebruikt';
    case 'released':
      return 'Vrijgegeven';
    default:
      return status;
  }
}
