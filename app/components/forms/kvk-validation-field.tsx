
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Building2, 
  MapPin, 
  Calendar,
  Users,
  Globe,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useKvKValidation } from '@/hooks/use-kvk-validation';
import { KvKValidationResult, KvKCompanyData } from '@/lib/types';
import { cn } from '@/lib/utils';

interface KvKValidationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onValidationResult?: (result: KvKValidationResult | null) => void;
  onCompanyDataSelect?: (companyData: KvKCompanyData) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidationDetails?: boolean;
  autoValidate?: boolean;
}

export function KvKValidationField({
  value,
  onChange,
  onValidationResult,
  onCompanyDataSelect,
  label = "KvK nummer",
  placeholder = "12345678",
  required = false,
  disabled = false,
  className,
  showValidationDetails = true,
  autoValidate = true
}: KvKValidationFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const { validation, validateKvK, clearValidation, isValidKvKFormat } = useKvKValidation({
    onValidationComplete: (result) => {
      onValidationResult?.(result);
    },
    onError: (error) => {
      console.error('KvK validation error:', error);
    }
  });

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto-validate with debouncing
  useEffect(() => {
    if (!autoValidate || !inputValue.trim()) {
      clearValidation();
      return;
    }

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(() => {
      if (isValidKvKFormat(inputValue)) {
        validateKvK(inputValue);
      } else {
        clearValidation();
      }
    }, 800);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [inputValue, autoValidate, validateKvK, clearValidation, isValidKvKFormat, debounceTimer]);

  // Handle input change
  const handleInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
    
    // Clear validation if input is empty
    if (!newValue.trim()) {
      clearValidation();
    }
  }, [onChange, clearValidation]);

  // Manual validation trigger
  const handleManualValidation = useCallback(() => {
    if (inputValue.trim()) {
      validateKvK(inputValue);
    }
  }, [inputValue, validateKvK]);

  // Handle company data selection
  const handleSelectCompanyData = useCallback(() => {
    if (validation.result?.companyData) {
      onCompanyDataSelect?.(validation.result.companyData);
    }
  }, [validation.result?.companyData, onCompanyDataSelect]);

  // Get validation status
  const getValidationStatus = () => {
    if (validation.isValidating) return 'validating';
    if (validation.error) return 'error';
    if (validation.result?.isValid) return 'valid';
    if (validation.hasValidated && !validation.result?.isValid) return 'invalid';
    return 'idle';
  };

  const validationStatus = getValidationStatus();

  // Get validation icon
  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Format KvK number for display (add spaces for readability)
  const formatKvKNumber = (kvk: string) => {
    const cleaned = kvk.replace(/[\s-]/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    }
    return kvk;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Input Field */}
      <div className="space-y-2">
        <Label htmlFor="kvk-input" className="flex items-center space-x-2">
          <span>{label}</span>
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            id="kvk-input"
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled || validation.isValidating}
            className={cn(
              "pr-10",
              validationStatus === 'valid' && "border-green-500 focus:border-green-500",
              (validationStatus === 'error' || validationStatus === 'invalid') && "border-red-500 focus:border-red-500",
              validation.isValidating && "opacity-75"
            )}
            maxLength={12}
          />
          
          {/* Validation Icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {getValidationIcon()}
          </div>
        </div>

        {/* Manual Validation Button */}
        {!autoValidate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualValidation}
            disabled={!inputValue.trim() || validation.isValidating}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={cn("h-4 w-4", validation.isValidating && "animate-spin")} />
            <span>Valideer KvK</span>
          </Button>
        )}
      </div>

      {/* Validation Messages */}
      {validation.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {validation.error}
          </AlertDescription>
        </Alert>
      )}

      {validation.isValidating && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-700">
            KvK nummer wordt gevalideerd...
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Results */}
      {showValidationDetails && validation.result?.isValid && validation.result.companyData && (
        <CompanyDataPreview 
          companyData={validation.result.companyData} 
          onSelect={onCompanyDataSelect ? handleSelectCompanyData : undefined}
          source={validation.result.source}
        />
      )}
    </div>
  );
}

interface CompanyDataPreviewProps {
  companyData: KvKCompanyData;
  onSelect?: () => void;
  source: 'openkvk' | 'cache' | 'fallback';
}

function CompanyDataPreview({ companyData, onSelect, source }: CompanyDataPreviewProps) {
  const hasAddress = companyData.address && (
    companyData.address.street || 
    companyData.address.city || 
    companyData.address.postalCode
  );

  const getSourceBadge = () => {
    switch (source) {
      case 'openkvk':
        return <Badge variant="outline" className="text-green-600 border-green-200">Live</Badge>;
      case 'cache':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Cache</Badge>;
      case 'fallback':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Fallback</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Bedrijf Gevonden</span>
          </CardTitle>
          {getSourceBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Company Name */}
        <div className="flex items-start space-x-3">
          <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900">{companyData.name}</p>
            {companyData.tradeName && companyData.tradeName !== companyData.name && (
              <p className="text-sm text-gray-600">Handelsnaam: {companyData.tradeName}</p>
            )}
            {companyData.legalForm && (
              <p className="text-sm text-gray-600">Rechtsvorm: {companyData.legalForm}</p>
            )}
          </div>
        </div>

        {/* Address */}
        {hasAddress && (
          <>
            <Separator />
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                {companyData.address?.street && companyData.address?.houseNumber && (
                  <p>{companyData.address.street} {companyData.address.houseNumber}</p>
                )}
                {companyData.address?.postalCode && companyData.address?.city && (
                  <p>{companyData.address.postalCode} {companyData.address.city}</p>
                )}
                {companyData.address?.country && companyData.address.country !== 'Nederland' && (
                  <p>{companyData.address.country}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Additional Info */}
        {(companyData.establishmentDate || companyData.employeeCount || companyData.website) && (
          <>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {companyData.establishmentDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Opgericht: {companyData.establishmentDate}</span>
                </div>
              )}
              
              {companyData.employeeCount && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{companyData.employeeCount} werknemers</span>
                </div>
              )}
              
              {companyData.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a 
                    href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Button */}
        {onSelect && (
          <>
            <Separator />
            <Button 
              onClick={onSelect}
              className="w-full"
              size="sm"
            >
              Gegevens Overnemen
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default KvKValidationField;
