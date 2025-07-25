
import { InvoiceFormData, InvoiceLineItemFormData, InvoiceCalculation, DueDateType } from '@/lib/types';

// BTW rates in Netherlands
export const BTW_RATES = {
  HIGH: 21,    // Standard rate
  LOW: 9,      // Reduced rate for specific items
  ZERO: 0      // Zero rate
} as const;

export class InvoiceCalculationService {
  static calculateLineItem(quantity: number, rate: number): number {
    return Math.round((quantity * rate) * 100) / 100;
  }

  static calculateSubtotal(lineItems: InvoiceLineItemFormData[]): number {
    return lineItems.reduce((total, item) => {
      const lineAmount = this.calculateLineItem(item.quantity, item.rate);
      return total + lineAmount;
    }, 0);
  }

  static calculateBTW(subtotal: number, btwRate: number = BTW_RATES.HIGH): number {
    return Math.round((subtotal * (btwRate / 100)) * 100) / 100;
  }

  static calculateTotal(subtotal: number, btwAmount: number): number {
    return Math.round((subtotal + btwAmount) * 100) / 100;
  }

  static calculateInvoice(
    lineItems: InvoiceLineItemFormData[], 
    btwRate: number = BTW_RATES.HIGH
  ): InvoiceCalculation {
    const calculatedLineItems = lineItems.map((item, index) => ({
      id: `temp-${index}`,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: this.calculateLineItem(item.quantity, item.rate)
    }));

    const subtotal = this.calculateSubtotal(lineItems);
    const btwAmount = this.calculateBTW(subtotal, btwRate);
    const totalAmount = this.calculateTotal(subtotal, btwAmount);

    return {
      subtotal,
      btwAmount,
      totalAmount,
      lineItems: calculatedLineItems
    };
  }

  static calculateDueDate(issueDate: Date, dueDateType: DueDateType, customDate?: Date): Date {
    const dueDate = new Date(issueDate);
    
    switch (dueDateType) {
      case 'SEVEN_DAYS':
        dueDate.setDate(dueDate.getDate() + 7);
        break;
      case 'FOURTEEN_DAYS':
        dueDate.setDate(dueDate.getDate() + 14);
        break;
      case 'THIRTY_DAYS':
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      case 'CUSTOM':
        return customDate || new Date();
      default:
        dueDate.setDate(dueDate.getDate() + 14); // Default to 14 days
    }
    
    return dueDate;
  }

  static generateInvoiceNumber(prefix: string = 'INV', year?: number): string {
    const currentYear = year || new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${prefix}-${currentYear}-${timestamp}${random}`;
  }

  static validateLineItems(lineItems: InvoiceLineItemFormData[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (lineItems.length === 0) {
      errors.push('Er moet minimaal één regel aanwezig zijn');
    }

    lineItems.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors.push(`Regel ${index + 1}: Omschrijving is verplicht`);
      }
      if (item.quantity <= 0) {
        errors.push(`Regel ${index + 1}: Aantal moet groter zijn dan 0`);
      }
      if (item.rate <= 0) {
        errors.push(`Regel ${index + 1}: Tarief moet groter zijn dan 0`);
      }
      if (item.description && item.description.length > 500) {
        errors.push(`Regel ${index + 1}: Omschrijving is te lang (max 500 karakters)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency
    }).format(amount);
  }

  static formatQuantity(quantity: number, unitType: string): string {
    const formatter = new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return `${formatter.format(quantity)}`;
  }

  // Calculate interest for late payments
  static calculateInterest(
    amount: number, 
    daysLate: number, 
    annualRate: number = 12
  ): number {
    const dailyRate = annualRate / 365 / 100;
    const interest = amount * dailyRate * daysLate;
    return Math.round(interest * 100) / 100;
  }

  // Calculate days between dates
  static daysBetween(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if invoice is overdue
  static isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  // Get overdue days
  static getOverdueDays(dueDate: Date): number {
    if (!this.isOverdue(dueDate)) return 0;
    return this.daysBetween(new Date(dueDate), new Date());
  }
}

export default InvoiceCalculationService;
