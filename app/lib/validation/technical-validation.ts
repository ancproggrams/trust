
/**
 * Technical validation utilities for various data formats
 * Enhanced validation functions for phone numbers, IBAN, postal codes, etc.
 */

import * as IBAN from 'iban';
import validator from 'validator';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
  warnings?: string[];
}

/**
 * Enhanced phone number validation with international support
 */
export function validatePhoneNumber(phone: string, country = 'NL'): ValidationResult {
  if (!phone?.trim()) {
    return { isValid: false, error: 'Telefoonnummer is vereist' };
  }

  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  const patterns: Record<string, { regex: RegExp; format: (phone: string) => string }> = {
    NL: {
      regex: /^(\+31|0031|31|0)[1-9]\d{8}$/,
      format: (p: string) => {
        const digits = p.replace(/^\+?31|^0031|^0/, '');
        return `+31${digits}`;
      }
    },
    DE: {
      regex: /^(\+49|0049|49|0)\d{10,11}$/,
      format: (p: string) => {
        const digits = p.replace(/^\+?49|^0049|^0/, '');
        return `+49${digits}`;
      }
    },
    FR: {
      regex: /^(\+33|0033|33|0)[1-9]\d{8}$/,
      format: (p: string) => {
        const digits = p.replace(/^\+?33|^0033|^0/, '');
        return `+33${digits}`;
      }
    },
    BE: {
      regex: /^(\+32|0032|32|0)[1-9]\d{8}$/,
      format: (p: string) => {
        const digits = p.replace(/^\+?32|^0032|^0/, '');
        return `+32${digits}`;
      }
    },
    GB: {
      regex: /^(\+44|0044|44|0)[1-9]\d{9,10}$/,
      format: (p: string) => {
        const digits = p.replace(/^\+?44|^0044|^0/, '');
        return `+44${digits}`;
      }
    }
  };

  const pattern = patterns[country];
  if (!pattern) {
    return { isValid: false, error: `Landcode ${country} wordt niet ondersteund` };
  }

  if (!pattern.regex.test(cleaned)) {
    return { 
      isValid: false, 
      error: `Ongeldig telefoonnummer format voor ${country}` 
    };
  }

  const normalized = pattern.format(cleaned);
  
  return {
    isValid: true,
    normalized,
    warnings: []
  };
}

/**
 * Enhanced IBAN validation with country-specific checks
 */
export function validateIBANNumber(iban: string): ValidationResult {
  if (!iban?.trim()) {
    return { isValid: false, error: 'IBAN is vereist' };
  }

  const cleaned = iban.replace(/[\s\-]/g, '').toUpperCase();
  
  // Basic format check
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'IBAN moet beginnen met 2 letters gevolgd door 2 cijfers' 
    };
  }

  // Length validation by country
  const countryLengths: Record<string, number> = {
    AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22,
    BH: 22, BR: 25, BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22,
    DK: 18, DO: 28, EE: 20, EG: 29, ES: 24, FI: 18, FO: 18, FR: 27,
    GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21, HU: 28,
    IE: 22, IL: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20, LB: 28,
    LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22,
    MK: 19, MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28,
    PS: 29, PT: 25, QA: 29, RO: 24, RS: 22, SA: 24, SE: 24, SI: 19,
    SK: 24, SM: 27, TN: 24, TR: 26, UA: 29, VG: 24, XK: 20
  };

  const countryCode = cleaned.substring(0, 2);
  const expectedLength = countryLengths[countryCode];

  if (!expectedLength) {
    return { 
      isValid: false, 
      error: `Landcode ${countryCode} wordt niet ondersteund` 
    };
  }

  if (cleaned.length !== expectedLength) {
    return { 
      isValid: false, 
      error: `IBAN voor ${countryCode} moet ${expectedLength} karakters hebben` 
    };
  }

  // Use IBAN library for checksum validation
  try {
    const isValid = IBAN.isValid(cleaned);
    if (!isValid) {
      return { isValid: false, error: 'IBAN checksum is ongeldig' };
    }

    // Format IBAN with spaces for readability
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();

    return {
      isValid: true,
      normalized: formatted,
      warnings: []
    };
  } catch (error) {
    return { isValid: false, error: 'IBAN validatie mislukt' };
  }
}

/**
 * Enhanced postal code validation with country-specific formats
 */
export function validatePostalCode(postalCode: string, country = 'NL'): ValidationResult {
  if (!postalCode?.trim()) {
    return { isValid: false, error: 'Postcode is vereist' };
  }

  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();

  const patterns: Record<string, { regex: RegExp; format: (code: string) => string }> = {
    NL: {
      regex: /^\d{4}[A-Z]{2}$/,
      format: (code: string) => `${code.substring(0, 4)} ${code.substring(4)}`
    },
    DE: {
      regex: /^\d{5}$/,
      format: (code: string) => code
    },
    FR: {
      regex: /^\d{5}$/,
      format: (code: string) => code
    },
    BE: {
      regex: /^\d{4}$/,
      format: (code: string) => code
    },
    GB: {
      regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
      format: (code: string) => {
        const match = code.match(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/);
        return match ? `${match[1]} ${match[2]}` : code;
      }
    }
  };

  const pattern = patterns[country];
  if (!pattern) {
    return { isValid: false, error: `Landcode ${country} wordt niet ondersteund` };
  }

  if (!pattern.regex.test(cleaned)) {
    return { 
      isValid: false, 
      error: `Ongeldig postcode format voor ${country}` 
    };
  }

  const formatted = pattern.format(cleaned);

  return {
    isValid: true,
    normalized: formatted,
    warnings: []
  };
}

/**
 * Enhanced email validation with domain checks
 */
export function validateEmailAddress(email: string): ValidationResult {
  if (!email?.trim()) {
    return { isValid: false, error: 'E-mailadres is vereist' };
  }

  const cleaned = email.trim().toLowerCase();

  // Basic format validation
  if (!validator.isEmail(cleaned)) {
    return { isValid: false, error: 'Ongeldig e-mailadres format' };
  }

  const warnings: string[] = [];

  // Check for common typos in domains
  const commonTypos = [
    { typo: 'gmial.com', correct: 'gmail.com' },
    { typo: 'gmai.com', correct: 'gmail.com' },
    { typo: 'yahooo.com', correct: 'yahoo.com' },
    { typo: 'hotmial.com', correct: 'hotmail.com' },
    { typo: 'outlok.com', correct: 'outlook.com' }
  ];

  const domain = cleaned.split('@')[1];
  const typo = commonTypos.find(t => domain === t.typo);
  if (typo) {
    warnings.push(`Bedoelde u ${typo.correct}?`);
  }

  // Check for disposable email domains (basic list)
  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org'
  ];
  
  if (disposableDomains.includes(domain)) {
    warnings.push('Dit lijkt een tijdelijk e-mailadres te zijn');
  }

  return {
    isValid: true,
    normalized: cleaned,
    warnings
  };
}

/**
 * Company name validation
 */
export function validateCompanyName(name: string): ValidationResult {
  if (!name?.trim()) {
    return { isValid: false, error: 'Bedrijfsnaam is vereist' };
  }

  const cleaned = name.trim();

  if (cleaned.length < 2) {
    return { isValid: false, error: 'Bedrijfsnaam moet minimaal 2 karakters hebben' };
  }

  if (cleaned.length > 200) {
    return { isValid: false, error: 'Bedrijfsnaam mag maximaal 200 karakters hebben' };
  }

  const warnings: string[] = [];

  // Check for common legal entity suffixes in Netherlands
  const dutchSuffixes = ['B.V.', 'BV', 'N.V.', 'NV', 'V.O.F.', 'VOF', 'C.V.', 'CV', 'Stichting', 'Vereniging'];
  const hasSuffix = dutchSuffixes.some(suffix => 
    cleaned.toUpperCase().includes(suffix.toUpperCase())
  );

  if (!hasSuffix) {
    warnings.push('Overweeg om de rechtsvorm toe te voegen (bijv. B.V., VOF)');
  }

  return {
    isValid: true,
    normalized: cleaned,
    warnings
  };
}

/**
 * Address validation
 */
export function validateAddress(address: string): ValidationResult {
  if (!address?.trim()) {
    return { isValid: false, error: 'Adres is vereist' };
  }

  const cleaned = address.trim();

  if (cleaned.length < 5) {
    return { isValid: false, error: 'Adres moet minimaal 5 karakters hebben' };
  }

  if (cleaned.length > 200) {
    return { isValid: false, error: 'Adres mag maximaal 200 karakters hebben' };
  }

  const warnings: string[] = [];

  // Basic Dutch address format check (street + number)
  const dutchAddressPattern = /^[^0-9]*\d+.*$/;
  if (!dutchAddressPattern.test(cleaned)) {
    warnings.push('Zorg ervoor dat het huisnummer is opgenomen');
  }

  return {
    isValid: true,
    normalized: cleaned,
    warnings
  };
}

/**
 * Bank account holder name validation
 */
export function validateAccountHolder(name: string, companyName?: string): ValidationResult {
  if (!name?.trim()) {
    return { isValid: false, error: 'Rekeninghouder naam is vereist' };
  }

  const cleaned = name.trim();

  if (cleaned.length < 2) {
    return { isValid: false, error: 'Rekeninghouder naam moet minimaal 2 karakters hebben' };
  }

  if (cleaned.length > 100) {
    return { isValid: false, error: 'Rekeninghouder naam mag maximaal 100 karakters hebben' };
  }

  const warnings: string[] = [];

  // If company name is provided, check similarity
  if (companyName) {
    const similarity = calculateStringSimilarity(
      cleaned.toLowerCase(),
      companyName.toLowerCase()
    );

    if (similarity < 0.3) {
      warnings.push('Rekeninghouder naam komt niet overeen met bedrijfsnaam');
    }
  }

  return {
    isValid: true,
    normalized: cleaned,
    warnings
  };
}

/**
 * Helper function to calculate string similarity
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Levenshtein distance calculation
 */
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
