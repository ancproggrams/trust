
'use client';

import { useState, useCallback } from 'react';
import { BTWValidationResult, BTWValidationState } from '@/lib/types/btw-validation';

interface UseBTWValidationOptions {
  onValidationComplete?: (result: BTWValidationResult) => void;
  onError?: (error: string) => void;
  autoValidate?: boolean;
  debounceMs?: number;
}

interface UseBTWValidationReturn {
  validation: BTWValidationState;
  validateBTW: (btwNumber: string) => Promise<BTWValidationResult | null>;
  clearValidation: () => void;
  isValidBTWFormat: (btwNumber: string) => boolean;
}

export function useBTWValidation(options: UseBTWValidationOptions = {}): UseBTWValidationReturn {
  const {
    onValidationComplete,
    onError,
    autoValidate = false,
    debounceMs = 800
  } = options;

  const [validation, setValidation] = useState<BTWValidationState>({
    isValidating: false,
    hasValidated: false,
    result: undefined,
    error: undefined
  });

  /**
   * Check if BTW number format is valid
   */
  const isValidBTWFormat = useCallback((btwNumber: string): boolean => {
    if (!btwNumber || typeof btwNumber !== 'string') {
      return false;
    }

    const cleaned = btwNumber.replace(/[\s\-\.]/g, '').toUpperCase();
    
    // EU VAT number patterns
    const patterns: Record<string, RegExp> = {
      NL: /^NL\d{9}B\d{2}$/,
      DE: /^DE\d{9}$/,
      FR: /^FR[A-Z0-9]{2}\d{9}$/,
      BE: /^BE\d{10}$/,
      AT: /^ATU\d{8}$/,
      DK: /^DK\d{8}$/,
      ES: /^ES[A-Z]\d{7}[A-Z]$/,
      FI: /^FI\d{8}$/,
      GB: /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/,
      IT: /^IT\d{11}$/,
      LU: /^LU\d{8}$/,
      PT: /^PT\d{9}$/,
      SE: /^SE\d{12}$/
    };

    const countryCode = cleaned.substring(0, 2);
    const pattern = patterns[countryCode];
    
    return pattern ? pattern.test(cleaned) : false;
  }, []);

  /**
   * Clean BTW number for API call
   */
  const cleanBTWNumber = useCallback((btwNumber: string): string => {
    return btwNumber.replace(/[\s\-\.]/g, '').toUpperCase().trim();
  }, []);

  /**
   * Validate BTW number via API
   */
  const validateBTW = useCallback(async (btwNumber: string): Promise<BTWValidationResult | null> => {
    try {
      // Input validation
      if (!btwNumber?.trim()) {
        const error = 'BTW nummer is vereist';
        setValidation({
          isValidating: false,
          hasValidated: true,
          error
        });
        onError?.(error);
        return null;
      }

      const cleanedBTW = cleanBTWNumber(btwNumber);

      // Format validation
      if (!isValidBTWFormat(cleanedBTW)) {
        const error = 'BTW nummer heeft een ongeldig format';
        setValidation({
          isValidating: false,
          hasValidated: true,
          error
        });
        onError?.(error);
        return null;
      }

      // Start validation
      setValidation({
        isValidating: true,
        hasValidated: false,
        error: undefined
      });

      // Make API call
      const response = await fetch(`/api/validate-btw?btw=${encodeURIComponent(cleanedBTW)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'BTW validatie mislukt');
      }

      if (!responseData.success || !responseData.data) {
        throw new Error('Ongeldige API response');
      }

      const result: BTWValidationResult = {
        ...responseData.data,
        validatedAt: new Date(responseData.data.validatedAt)
      };

      // Update state with successful result
      setValidation({
        isValidating: false,
        hasValidated: true,
        result,
        error: undefined
      });

      // Call success callback
      onValidationComplete?.(result);

      return result;

    } catch (error: any) {
      console.error('BTW validation error:', error);
      
      const errorMessage = error?.message || 'Onbekende fout bij BTW validatie';
      
      setValidation({
        isValidating: false,
        hasValidated: true,
        error: errorMessage
      });

      onError?.(errorMessage);
      return null;
    }
  }, [cleanBTWNumber, isValidBTWFormat, onValidationComplete, onError]);

  /**
   * Clear validation state
   */
  const clearValidation = useCallback(() => {
    setValidation({
      isValidating: false,
      hasValidated: false,
      result: undefined,
      error: undefined
    });
  }, []);

  return {
    validation,
    validateBTW,
    clearValidation,
    isValidBTWFormat
  };
}

/**
 * Hook for bulk BTW validation
 */
interface UseBulkBTWValidationReturn {
  validation: {
    isValidating: boolean;
    results: Map<string, BTWValidationResult>;
    errors: Map<string, string>;
  };
  validateMultiple: (btwNumbers: string[]) => Promise<Map<string, BTWValidationResult>>;
  clearResults: () => void;
}

export function useBulkBTWValidation(): UseBulkBTWValidationReturn {
  const [validation, setValidation] = useState<{
    isValidating: boolean;
    results: Map<string, BTWValidationResult>;
    errors: Map<string, string>;
  }>({
    isValidating: false,
    results: new Map(),
    errors: new Map()
  });

  /**
   * Validate multiple BTW numbers
   */
  const validateMultiple = useCallback(async (btwNumbers: string[]): Promise<Map<string, BTWValidationResult>> => {
    try {
      setValidation(prev => ({
        ...prev,
        isValidating: true
      }));

      const response = await fetch('/api/validate-btw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ btwNumbers })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Bulk BTW validatie mislukt');
      }

      if (!responseData.success || !responseData.data) {
        throw new Error('Ongeldige API response');
      }

      // Convert response data to Map
      const results = new Map<string, BTWValidationResult>();
      const errors = new Map<string, string>();

      Object.entries(responseData.data).forEach(([btwNumber, result]: [string, any]) => {
        const validationResult: BTWValidationResult = {
          ...result,
          validatedAt: new Date(result.validatedAt)
        };

        if (validationResult.isValid) {
          results.set(btwNumber, validationResult);
        } else {
          errors.set(btwNumber, validationResult.error || 'Onbekende validatie fout');
        }
      });

      setValidation({
        isValidating: false,
        results,
        errors
      });

      return results;

    } catch (error: any) {
      console.error('Bulk BTW validation error:', error);
      
      const errorMessage = error?.message || 'Onbekende fout bij bulk BTW validatie';
      const errors = new Map<string, string>();
      
      // Add error for all BTW numbers
      btwNumbers.forEach(btwNumber => {
        errors.set(btwNumber, errorMessage);
      });

      setValidation({
        isValidating: false,
        results: new Map(),
        errors
      });

      return new Map();
    }
  }, []);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setValidation({
      isValidating: false,
      results: new Map(),
      errors: new Map()
    });
  }, []);

  return {
    validation,
    validateMultiple,
    clearResults
  };
}
