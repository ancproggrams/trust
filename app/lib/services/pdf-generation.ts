
import { InvoicePDFData, Invoice } from '@/lib/types';
import InvoiceCalculationService from './invoice-calculation';

export interface PDFGenerationOptions {
  template?: 'default' | 'minimal' | 'professional';
  watermark?: boolean;
  includePaymentInstructions?: boolean;
  language?: 'nl' | 'en';
}

export class PDFGenerationService {
  private static readonly TEMPLATES = {
    default: 'Trust.io - Standaard Factuurtemplate',
    minimal: 'Trust.io - Minimaal Template', 
    professional: 'Trust.io - Professioneel Template'
  };

  // Generate PDF content as HTML (to be converted to PDF later)
  static generatePDFHTML(
    data: InvoicePDFData,
    options: PDFGenerationOptions = {}
  ): string {
    const {
      template = 'professional',
      watermark = false,
      includePaymentInstructions = true,
      language = 'nl'
    } = options;

    const { invoice, companyInfo, clientInfo } = data;
    
    return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factuur ${invoice.invoiceNumber}</title>
        <style>
            ${this.getStyleSheet(template, watermark)}
        </style>
    </head>
    <body>
        <div class="invoice-container">
            ${this.generateHeader(companyInfo, language)}
            ${this.generateInvoiceDetails(invoice, language)}
            ${this.generateClientInfo(clientInfo, language)}
            ${this.generateLineItems(invoice.lineItems, language)}
            ${this.generateTotals(invoice, language)}
            ${includePaymentInstructions ? this.generatePaymentInstructions(companyInfo, invoice, language) : ''}
            ${this.generateFooter(companyInfo, language)}
            ${watermark ? this.generateWatermark() : ''}
        </div>
    </body>
    </html>`;
  }

  private static getStyleSheet(template: string, watermark: boolean): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #1f2937;
            background: white;
        }
        
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            position: relative;
            ${watermark ? 'overflow: hidden;' : ''}
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
        }
        
        .company-logo {
            font-size: 24px;
            font-weight: 700;
            color: #3b82f6;
        }
        
        .company-info {
            text-align: right;
            font-size: 12px;
            color: #6b7280;
        }
        
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .invoice-title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .invoice-meta {
            font-size: 12px;
            color: #6b7280;
        }
        
        .client-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .client-info h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #374151;
        }
        
        .line-items {
            margin-bottom: 30px;
        }
        
        .line-items table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
        }
        
        .line-items th {
            background: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid #d1d5db;
            font-size: 12px;
        }
        
        .line-items td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }
        
        .line-items .amount {
            text-align: right;
            font-weight: 500;
        }
        
        .totals {
            margin-left: auto;
            width: 300px;
            margin-bottom: 30px;
        }
        
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .totals td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .totals .total-row {
            background: #f3f4f6;
            font-weight: 600;
            font-size: 16px;
        }
        
        .totals .amount {
            text-align: right;
        }
        
        .payment-instructions {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .payment-instructions h3 {
            color: #0c4a6e;
            margin-bottom: 10px;
        }
        
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #9ca3af;
        }
        
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            font-weight: 700;
            color: rgba(239, 68, 68, 0.1);
            z-index: -1;
            pointer-events: none;
        }
        
        @media print {
            body { margin: 0; }
            .invoice-container { 
                max-width: none; 
                margin: 0; 
                padding: 0;
                box-shadow: none;
            }
        }
    `;
  }

  private static generateHeader(companyInfo: any, language: string): string {
    return `
        <div class="header">
            <div>
                <div class="company-logo">Trust.io</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">
                    Facturatie & Administratie Platform
                </div>
            </div>
            <div class="company-info">
                <strong>${companyInfo.name}</strong><br>
                ${companyInfo.address}<br>
                ${companyInfo.postalCode} ${companyInfo.city}<br>
                ${companyInfo.country}<br><br>
                KvK: ${companyInfo.kvkNumber}<br>
                BTW: ${companyInfo.vatNumber}<br>
                IBAN: ${companyInfo.iban}
            </div>
        </div>
    `;
  }

  private static generateInvoiceDetails(invoice: Invoice, language: string): string {
    const labels = language === 'nl' ? {
      invoice: 'FACTUUR',
      number: 'Factuurnummer',
      date: 'Factuurdatum',
      dueDate: 'Vervaldatum'
    } : {
      invoice: 'INVOICE',
      number: 'Invoice Number',
      date: 'Invoice Date',
      dueDate: 'Due Date'
    };

    return `
        <div class="invoice-details">
            <div>
                <h1 class="invoice-title">${labels.invoice}</h1>
                ${invoice.title ? `<div style="font-size: 16px; color: #6b7280; margin-bottom: 10px;">${invoice.title}</div>` : ''}
            </div>
            <div class="invoice-meta">
                <div><strong>${labels.number}:</strong> ${invoice.invoiceNumber}</div>
                <div><strong>${labels.date}:</strong> ${new Date(invoice.issueDate).toLocaleDateString('nl-NL')}</div>
                <div><strong>${labels.dueDate}:</strong> ${new Date(invoice.dueDate).toLocaleDateString('nl-NL')}</div>
            </div>
        </div>
    `;
  }

  private static generateClientInfo(clientInfo: any, language: string): string {
    const label = language === 'nl' ? 'Factuuradres' : 'Bill To';
    
    return `
        <div class="client-info">
            <h3>${label}</h3>
            <div>
                ${clientInfo.name}<br>
                ${clientInfo.company ? `${clientInfo.company}<br>` : ''}
                ${clientInfo.address ? `${clientInfo.address}<br>` : ''}
                ${clientInfo.postalCode && clientInfo.city ? `${clientInfo.postalCode} ${clientInfo.city}<br>` : ''}
                ${clientInfo.country ? `${clientInfo.country}` : ''}
            </div>
        </div>
    `;
  }

  private static generateLineItems(lineItems: any[], language: string): string {
    const labels = language === 'nl' ? {
      description: 'Omschrijving',
      quantity: 'Aantal',
      rate: 'Tarief',
      amount: 'Bedrag'
    } : {
      description: 'Description',
      quantity: 'Quantity',
      rate: 'Rate',
      amount: 'Amount'
    };

    const rows = lineItems.map(item => `
        <tr>
            <td>
                <strong>${item.description}</strong>
                ${item.notes ? `<br><span style="font-size: 12px; color: #6b7280;">${item.notes}</span>` : ''}
            </td>
            <td class="amount">${InvoiceCalculationService.formatQuantity(item.quantity, item.unitType)}</td>
            <td class="amount">${InvoiceCalculationService.formatCurrency(item.rate)}</td>
            <td class="amount">${InvoiceCalculationService.formatCurrency(item.amount)}</td>
        </tr>
    `).join('');

    return `
        <div class="line-items">
            <table>
                <thead>
                    <tr>
                        <th>${labels.description}</th>
                        <th style="text-align: right;">${labels.quantity}</th>
                        <th style="text-align: right;">${labels.rate}</th>
                        <th style="text-align: right;">${labels.amount}</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
  }

  private static generateTotals(invoice: Invoice, language: string): string {
    const labels = language === 'nl' ? {
      subtotal: 'Subtotaal',
      btw: `BTW (${invoice.btwRate}%)`,
      total: 'Totaal'
    } : {
      subtotal: 'Subtotal',
      btw: `VAT (${invoice.btwRate}%)`,
      total: 'Total'
    };

    return `
        <div class="totals">
            <table>
                <tr>
                    <td>${labels.subtotal}</td>
                    <td class="amount">${InvoiceCalculationService.formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr>
                    <td>${labels.btw}</td>
                    <td class="amount">${InvoiceCalculationService.formatCurrency(invoice.btwAmount)}</td>
                </tr>
                <tr class="total-row">
                    <td>${labels.total}</td>
                    <td class="amount">${InvoiceCalculationService.formatCurrency(invoice.totalAmount)}</td>
                </tr>
            </table>
        </div>
    `;
  }

  private static generatePaymentInstructions(companyInfo: any, invoice: Invoice, language: string): string {
    const content = language === 'nl' ? {
      title: 'Betaalgegevens',
      instructions: `
        Gelieve het totaalbedrag van ${InvoiceCalculationService.formatCurrency(invoice.totalAmount)} 
        uiterlijk ${new Date(invoice.dueDate).toLocaleDateString('nl-NL')} te voldoen op onderstaande rekening.
      `,
      reference: 'Vermeld bij de betaling:',
      account: 'Rekeningnummer:',
      accountHolder: 'Rekeninghouder:'
    } : {
      title: 'Payment Instructions',
      instructions: `
        Please pay the total amount of ${InvoiceCalculationService.formatCurrency(invoice.totalAmount)} 
        before ${new Date(invoice.dueDate).toLocaleDateString('en-US')} to the account below.
      `,
      reference: 'Payment reference:',
      account: 'Account number:',
      accountHolder: 'Account holder:'
    };

    return `
        <div class="payment-instructions">
            <h3>${content.title}</h3>
            <p>${content.instructions}</p>
            <div style="margin-top: 15px;">
                <div><strong>${content.account}</strong> ${companyInfo.iban}</div>
                <div><strong>${content.accountHolder}</strong> ${companyInfo.name}</div>
                <div><strong>${content.reference}</strong> ${invoice.invoiceNumber}</div>
            </div>
        </div>
    `;
  }

  private static generateFooter(companyInfo: any, language: string): string {
    const text = language === 'nl' 
      ? 'Deze factuur is gegenereerd door Trust.io - Facturatie & Administratie Platform'
      : 'This invoice was generated by Trust.io - Invoicing & Administration Platform';

    return `
        <div class="footer">
            <p>${text}</p>
            <p style="margin-top: 10px;">
                ${companyInfo.name} | KvK: ${companyInfo.kvkNumber} | BTW: ${companyInfo.vatNumber}
            </p>
        </div>
    `;
  }

  private static generateWatermark(): string {
    return `<div class="watermark">CONCEPT</div>`;
  }

  // Generate PDF file path
  static generatePDFPath(invoiceNumber: string): string {
    const sanitizedNumber = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '');
    return `/uploads/invoices/${sanitizedNumber}.pdf`;
  }

  // Get PDF download URL
  static getPDFDownloadURL(pdfPath: string): string {
    return `/api/files${pdfPath}`;
  }
}

export default PDFGenerationService;
