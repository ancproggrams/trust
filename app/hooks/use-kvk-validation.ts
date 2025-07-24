
'use client';

import { useState, useCallback } from 'react';
import { KvKValidationResult, KvKValidationState } from '@/lib/types';

interface UseKvKValidationOptions {
  onValidationComplete?: (result: KvKValidationResult) => void;
  onError?: (error: string) => void;
  autoValidate?: boolean;
  debounceMs?: number;
}

interface UseKvKValidationReturn {
  validation: KvKValidationState;
  validateKvK: (kvkNumber: string) => Promise<KvKValidationResult | null>;
  clearValidation: () => void;
  isValidKvKFormat: (kvkNumber: string) => boolean;
}

export function useKvKValidation(options: UseKvKValidationOptions = {}): UseKvKValidationReturn {
  const {
    onValidationComplete,
    onError,
    autoValidate = false,
    debounceMs = 500
  } = options;

  const [validation, setValidation] = useState<KvKValidationState>({
    isValidating: false,
    hasValidated: false,
    result: undefined,
    error: undefined
  });

  /**
   * Check if KvK number format is valid
   */
  const isValidKvKFormat = useCallback((kvkNumber: string): boolean => {
    if (!kvkNumber || typeof kvkNumber !== 'string') {
      return false;
    }

    // Remove spaces and dashes
    const cleaned = kvkNumber.replace(/[\s-]/g, '');
    
    // Should be exactly 8 digits
    return /^\d{8}$/.test(cleaned);
  }, []);

  /**
   * Clean KvK number for API call
   */
  const cleanKvKNumber = useCallback((kvkNumber: string): string => {
    return kvkNumber.replace(/[\s-]/g, '').padStart(8, '0');
  }, []);

  /**
   * Validate KvK number via API
   */
  const validateKvK = useCallback(async (kvkNumber: string): Promise<KvKValidationResult | null> => {
    try {
      // Input validation
      if (!kvkNumber?.trim()) {
        const error = 'KvK nummer is vereist';
        setValidation({
          isValidating: false,
          hasValidated: true,
          error
        });
        onError?.(error);
        return null;
      }

      const cleanedKvK = cleanKvKNumber(kvkNumber);

      // Format validation
      if (!isValidKvKFormat(cleanedKvK)) {
        const error = 'KvK nummer moet 8 cijfers bevatten';
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
      const response = await fetch(`/api/validate-kvk?kvk=${encodeURIComponent(cleanedKvK)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'KvK validatie mislukt');
      }

      if (!responseData.success || !responseData.data) {
        throw new Error('Ongeldige API response');
      }

      const result: KvKValidationResult = {
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
      console.error('KvK validation error:', error);
      
      const errorMessage = error?.message || 'Onbekende fout bij KvK validatie';
      
      setValidation({
        isValidating: false,
        hasValidated: true,
        error: errorMessage
      });

      onError?.(errorMessage);
      return null;
    }
  }, [cleanKvKNumber, isValidKvKFormat, onValidationComplete, onError]);

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
    validateKvK,
    clearValidation,
    isValidKvKFormat
  };
}

/**
 * Hook for bulk KvK validation
 */
interface UseBulkKvKValidationReturn {
  validation: {
    isValidating: boolean;
    results: Map<string, KvKValidationResult>;
    errors: Map<string, string>;
  };
  validateMultiple: (kvkNumbers: string[]) => Promise<Map<string, KvKValidationResult>>;
  clearResults: () => void;
}

export function useBulkKvKValidation(): UseBulkKvKValidationReturn {
  const [validation, setValidation] = useState<{
    isValidating: boolean;
    results: Map<string, KvKValidationResult>;
    errors: Map<string, string>;
  }>({
    isValidating: false,
    results: new Map(),
    errors: new Map()
  });

  /**
   * Validate multiple KvK numbers
   */
  const validateMultiple = useCallback(async (kvkNumbers: string[]): Promise<Map<string, KvKValidationResult>> => {
    try {
      setValidation(prev => ({
        ...prev,
        isValidating: true
      }));

      const response = await fetch('/api/validate-kvk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kvkNumbers })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Bulk KvK validatie mislukt');
      }

      if (!responseData.success || !responseData.data) {
        throw new Error('Ongeldige API response');
      }

      // Convert response data to Map
      const results = new Map<string, KvKValidationResult>();
      const errors = new Map<string, string>();

      Object.entries(responseData.data).forEach(([kvkNumber, result]: [string, any]) => {
        const validationResult: KvKValidationResult = {
          ...result,
          validatedAt: new Date(result.validatedAt)
        };

        if (validationResult.isValid) {
          results.set(kvkNumber, validationResult);
        } else {
          errors.set(kvkNumber, validationResult.error || 'Onbekende validatie fout');
        }
      });

      setValidation({
        isValidating: false,
        results,
        errors
      });

      return results;

    } catch (error: any) {
      console.error('Bulk KvK validation error:', error);
      
      const errorMessage = error?.message || 'Onbekende fout bij bulk KvK validatie';
      const errors = new Map<string, string>();
      
      // Add error for all KvK numbers
      kvkNumbers.forEach(kvkNumber => {
        errors.set(kvkNumber, errorMessage);
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
