
import * as z from 'zod';
import * as IBAN from 'iban';
import validator from 'validator';

// Enhanced validation schemas with multilingual support
export const createValidationSchemas = (t: any) => ({
  // User Profile Schema (Enhanced with mandatory fields)
  userProfileSchema: z.object({
    // Basic info
    name: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.nameTooShort'))
      .max(100, t('validation.nameTooLong')),
    
    email: z.string()
      .min(1, t('messages.requiredField'))
      .email(t('messages.invalidEmail')),
    
    phone: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^(\+31|0)[1-9]\d{8}$/, t('messages.invalidPhone')),
    
    // Business details (MANDATORY)
    companyName: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.companyNameTooShort'))
      .max(200, t('validation.companyNameTooLong')),
    
    kvkNumber: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^\d{8}$/, t('messages.invalidKvK'))
      .refine(async (val) => await validateKvKNumber(val), {
        message: t('validation.kvkNotFound')
      }),
    
    vatNumber: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^NL\d{9}B\d{2}$/, t('validation.invalidVATFormat')),
    
    // Contact details (MANDATORY)
    address: z.string()
      .min(1, t('messages.requiredField'))
      .min(5, t('validation.addressTooShort'))
      .max(200, t('validation.addressTooLong')),
    
    postalCode: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^\d{4}\s?[A-Z]{2}$/i, t('validation.invalidPostalCode')),
    
    city: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.cityTooShort'))
      .max(100, t('validation.cityTooLong')),
    
    country: z.string()
      .min(1, t('messages.requiredField'))
      .default('Netherlands'),
    
    // Banking details (MANDATORY)
    iban: z.string()
      .min(1, t('messages.requiredField'))
      .refine((val) => IBAN.isValid(val), {
        message: t('messages.invalidIBAN')
      }),
    
    bankName: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.bankNameTooShort'))
      .max(100, t('validation.bankNameTooLong')),
    
    accountHolder: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.accountHolderTooShort'))
      .max(100, t('validation.accountHolderTooLong')),
    
    businessType: z.enum(['ZZP', 'BV', 'VOF', 'EENMANSZAAK', 'OTHER'], {
      message: t('validation.invalidBusinessType')
    }),
  }),

  // Creditor Schema (Enhanced with mandatory fields)
  creditorSchema: z.object({
    name: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.nameTooShort'))
      .max(100, t('validation.nameTooLong')),
    
    email: z.string()
      .min(1, t('messages.requiredField'))
      .email(t('messages.invalidEmail')),
    
    phone: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, t('messages.invalidPhone')),
    
    companyName: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.companyNameTooShort'))
      .max(200, t('validation.companyNameTooLong')),
    
    kvkNumber: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^\d{8}$/, t('messages.invalidKvK')),
    
    vatNumber: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^[A-Z]{2}\d{8,12}$/, t('validation.invalidVATFormat')),
    
    address: z.string()
      .min(1, t('messages.requiredField'))
      .min(5, t('validation.addressTooShort'))
      .max(200, t('validation.addressTooLong')),
    
    postalCode: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^\d{4,5}\s?[A-Z]{2}$/i, t('validation.invalidPostalCode')),
    
    city: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.cityTooShort'))
      .max(100, t('validation.cityTooLong')),
    
    country: z.string()
      .min(1, t('messages.requiredField'))
      .default('Netherlands'),
    
    iban: z.string()
      .min(1, t('messages.requiredField'))
      .refine((val) => IBAN.isValid(val), {
        message: t('messages.invalidIBAN')
      }),
    
    bankName: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.bankNameTooShort'))
      .max(100, t('validation.bankNameTooLong')),
    
    accountHolder: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.accountHolderTooShort'))
      .max(100, t('validation.accountHolderTooLong')),
  }),

  // Invoice Schema (Enhanced)
  invoiceSchema: z.object({
    clientId: z.string()
      .min(1, t('messages.requiredField')),
    
    invoiceNumber: z.string()
      .min(1, t('messages.requiredField'))
      .regex(/^[A-Z0-9-]{3,20}$/, t('validation.invalidInvoiceNumber')),
    
    amount: z.number()
      .min(0.01, t('validation.amountTooSmall'))
      .max(999999.99, t('validation.amountTooLarge')),
    
    btwRate: z.number()
      .min(0, t('validation.invalidBTWRate'))
      .max(25, t('validation.invalidBTWRate')),
    
    dueDate: z.date()
      .min(new Date(), t('validation.dueDateInPast')),
    
    description: z.string()
      .min(1, t('messages.requiredField'))
      .min(5, t('validation.descriptionTooShort'))
      .max(500, t('validation.descriptionTooLong')),
    
    items: z.array(z.object({
      description: z.string()
        .min(1, t('messages.requiredField'))
        .min(3, t('validation.itemDescriptionTooShort'))
        .max(200, t('validation.itemDescriptionTooLong')),
      
      quantity: z.number()
        .min(1, t('validation.quantityTooSmall'))
        .max(9999, t('validation.quantityTooLarge')),
      
      rate: z.number()
        .min(0.01, t('validation.rateTooSmall'))
        .max(99999.99, t('validation.rateTooLarge')),
    })).min(1, t('validation.noInvoiceItems')),
  }),

  // Authentication Schema
  loginSchema: z.object({
    email: z.string()
      .min(1, t('messages.requiredField'))
      .email(t('messages.invalidEmail')),
    
    password: z.string()
      .min(1, t('messages.requiredField'))
      .min(8, t('messages.passwordTooShort')),
  }),

  registerSchema: z.object({
    name: z.string()
      .min(1, t('messages.requiredField'))
      .min(2, t('validation.nameTooShort'))
      .max(100, t('validation.nameTooLong')),
    
    email: z.string()
      .min(1, t('messages.requiredField'))
      .email(t('messages.invalidEmail')),
    
    password: z.string()
      .min(8, t('messages.passwordTooShort'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation.passwordTooWeak')),
    
    confirmPassword: z.string()
      .min(1, t('messages.requiredField')),
    
    acceptedTerms: z.boolean()
      .refine((val) => val === true, {
        message: t('validation.mustAcceptTerms')
      }),
    
    acceptedPrivacy: z.boolean()
      .refine((val) => val === true, {
        message: t('validation.mustAcceptPrivacy')
      }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('messages.passwordsNotMatch'),
    path: ['confirmPassword'],
  }),
});

// Enhanced validation functions
export async function validateKvKNumber(kvkNumber: string): Promise<boolean> {
  try {
    // This would normally call the KvK API
    // For now, return true for demo purposes
    return /^\d{8}$/.test(kvkNumber);
  } catch (error) {
    return false;
  }
}

export function validateIBAN(iban: string): boolean {
  try {
    return validator.isIBAN(iban);
  } catch (error) {
    return false;
  }
}

export function validateVATNumber(vatNumber: string, country = 'NL'): boolean {
  const patterns: Record<string, RegExp> = {
    NL: /^NL\d{9}B\d{2}$/,
    DE: /^DE\d{9}$/,
    FR: /^FR[A-Z0-9]{2}\d{9}$/,
    BE: /^BE\d{10}$/,
  };
  
  const pattern = patterns[country];
  return pattern ? pattern.test(vatNumber) : false;
}

export function validatePostalCode(postalCode: string, country = 'NL'): boolean {
  const patterns: Record<string, RegExp> = {
    NL: /^\d{4}\s?[A-Z]{2}$/i,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    BE: /^\d{4}$/,
  };
  
  const pattern = patterns[country];
  return pattern ? pattern.test(postalCode) : false;
}

export function validatePhoneNumber(phone: string, country = 'NL'): boolean {
  const patterns: Record<string, RegExp> = {
    NL: /^(\+31|0)[1-9]\d{8}$/,
    DE: /^(\+49|0)\d{10,11}$/,
    FR: /^(\+33|0)[1-9]\d{8}$/,
    BE: /^(\+32|0)[1-9]\d{8}$/,
  };
  
  const pattern = patterns[country];
  return pattern ? pattern.test(phone) : false;
}

// Business rules validation
export function validateBusinessData(data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if KvK and VAT numbers match
  if (data.kvkNumber && data.vatNumber) {
    const kvkDigits = data.kvkNumber.replace(/\D/g, '');
    const vatDigits = data.vatNumber.replace(/\D/g, '');
    
    if (!vatDigits.includes(kvkDigits)) {
      warnings.push('KvK and VAT numbers may not match');
    }
  }

  // Check if IBAN matches country
  if (data.iban && data.country) {
    const ibanCountry = data.iban.substring(0, 2);
    const countryCode = getCountryCode(data.country);
    
    if (ibanCountry !== countryCode) {
      warnings.push('IBAN country does not match business country');
    }
  }

  // Check business name consistency
  if (data.companyName && data.accountHolder) {
    const similarity = calculateStringSimilarity(
      data.companyName.toLowerCase(),
      data.accountHolder.toLowerCase()
    );
    
    if (similarity < 0.5) {
      warnings.push('Company name and account holder may not match');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper functions
function getCountryCode(country: string): string {
  const codes: Record<string, string> = {
    'Netherlands': 'NL',
    'Germany': 'DE',
    'France': 'FR',
    'Belgium': 'BE',
  };
  
  return codes[country] || 'NL';
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
