
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useBTWValidation } from '@/hooks/use-btw-validation';
import { Check, X, Loader2, Building2, MapPin, AlertTriangle } from 'lucide-react';
import { BTWValidationResult } from '@/lib/types/btw-validation';

interface BTWValidationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onValidationResult?: (result: BTWValidationResult | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoValidate?: boolean;
  className?: string;
}

export function BTWValidationField({
  value,
  onChange,
  onValidationResult,
  label = 'BTW Nummer',
  placeholder = 'Bijv. NL123456789B01',
  disabled = false,
  required = false,
  autoValidate = true,
  className = ''
}: BTWValidationFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const { validation, validateBTW, clearValidation, isValidBTWFormat } = useBTWValidation({
    onValidationComplete: (result) => {
      onValidationResult?.(result);
    },
    onError: (error) => {
      console.error('BTW validation error:', error);
    }
  });

  // Auto-validate with debounce
  const debouncedValidation = useCallback((btwNumber: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      if (btwNumber.trim() && isValidBTWFormat(btwNumber)) {
        validateBTW(btwNumber);
      } else if (btwNumber.trim()) {
        // Clear validation for invalid format but don't trigger API call
        clearValidation();
      }
    }, 800);

    setDebounceTimer(timer);
  }, [debounceTimer, isValidBTWFormat, validateBTW, clearValidation]);

  // Handle input changes
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);

    if (autoValidate) {
      debouncedValidation(newValue);
    }
  };

  // Sync with external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
      if (autoValidate && value.trim()) {
        debouncedValidation(value);
      }
    }
  }, [value, inputValue, autoValidate, debouncedValidation]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Determine validation state
  const getValidationState = () => {
    if (!inputValue.trim()) return 'empty';
    if (validation.isValidating) return 'validating';
    if (validation.hasValidated && validation.result) {
      return validation.result.isValid ? 'valid' : 'invalid';
    }
    if (validation.error) return 'error';
    if (inputValue.trim() && !isValidBTWFormat(inputValue)) return 'format-error';
    return 'unknown';
  };

  const validationState = getValidationState();

  // Get validation icon
  const getValidationIcon = () => {
    switch (validationState) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'error':
      case 'format-error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get border color based on validation state
  const getBorderClass = () => {
    switch (validationState) {
      case 'validating':
        return 'border-blue-300 focus:border-blue-500';
      case 'valid':
        return 'border-green-300 focus:border-green-500';
      case 'invalid':
      case 'error':
      case 'format-error':
        return 'border-red-300 focus:border-red-500';
      default:
        return 'border-gray-300 focus:border-blue-500';
    }
  };

  const result = validation.result;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <Label htmlFor="btw-number" className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Input Field */}
      <div className="relative">
        <Input
          id="btw-number"
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${getBorderClass()}`}
        />
        
        {/* Validation Icon */}
        {getValidationIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Format Help Text */}
      {inputValue.trim() && validationState === 'format-error' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Voer een geldig EU BTW nummer in (bijv. NL123456789B01, DE123456789, FR12345678901)
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Error */}
      {validation.error && (
        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {validation.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Success - Company Information */}
      {result && result.isValid && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-800">BTW nummer geldig</span>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    {result.status}
                  </Badge>
                  {result.source && (
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                      {result.source}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Company Name */}
              {result.companyName && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Building2 className="h-3 w-3" />
                  <span>{result.companyName}</span>
                </div>
              )}

              {/* Address */}
              {result.address && (
                <div className="flex items-start gap-2 text-sm text-green-700">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <div>
                    {result.address.street && <div>{result.address.street}</div>}
                    {(result.address.postalCode || result.address.city) && (
                      <div>
                        {result.address.postalCode} {result.address.city}
                      </div>
                    )}
                    {result.address.country && (
                      <div className="text-xs text-green-600">{result.address.country}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="text-xs text-amber-600 space-y-1">
                  {result.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Failed */}
      {result && !result.isValid && !validation.error && (
        <Alert className="border-red-200 bg-red-50">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {result.error || 'BTW nummer is niet geldig of actief'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
