
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
