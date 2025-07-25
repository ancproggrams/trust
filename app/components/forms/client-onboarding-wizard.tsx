
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building, 
  MapPin, 
  Users, 
  CreditCard,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { KvKValidationField } from './kvk-validation-field';
import { BTWValidationField } from './btw-validation-field';
import { useKvKValidation } from '@/hooks/use-kvk-validation';
import { useBTWValidation } from '@/hooks/use-btw-validation';
import { 
  ClientFormData, 
  OnboardingStep, 
  BusinessType,
  KvKValidationState,
  BTWValidationState
} from '@/lib/types';

interface OnboardingWizardProps {
  initialData?: Partial<ClientFormData>;
  onComplete: (data: ClientFormData) => Promise<void>;
  onStepChange?: (step: OnboardingStep, data: Partial<ClientFormData>) => void;
}

const steps: Array<{
  id: OnboardingStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'BASIC_INFO',
    title: 'Basis Informatie',
    description: 'Uw persoonlijke gegevens',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 'BUSINESS_DETAILS',
    title: 'Bedrijf Details',
    description: 'KVK en BTW gegevens',
    icon: <Building className="w-5 h-5" />
  },
  {
    id: 'BANKING_INFO',
    title: 'Contact Details',
    description: 'Adres en contact informatie',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'VERIFICATION',
    title: 'Administratie Contact',
    description: 'Contact persoon administratie',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'COMPLETED',
    title: 'Bank Gegevens',
    description: 'IBAN en bank informatie',
    icon: <CreditCard className="w-5 h-5" />
  }
];

export function ClientOnboardingWizard({ 
  initialData = {}, 
  onComplete, 
  onStepChange 
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('BASIC_INFO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ClientFormData>({
    // Basic info
    name: '',
    email: '',
    phone: '',
    
    // Business details
    company: '',
    kvkNumber: '',
    vatNumber: '',
    businessType: 'ZZP' as BusinessType,
    
    // Contact details
    address: '',
    postalCode: '',
    city: '',
    country: 'Netherlands',
    
    // Admin contact
    adminContactName: '',
    adminContactEmail: '',
    adminContactPhone: '',
    adminDepartment: '',
    
    // Banking info
    iban: '',
    bankName: '',
    accountHolder: '',
    postboxNumber: '',
    
    // Workflow
    onboardingStep: 'BASIC_INFO',
    acceptedTerms: false,
    acceptedPrivacy: false,
    
    ...initialData
  });

  // Validation hooks
  const kvkValidation = useKvKValidation();
  const btwValidation = useBTWValidation();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep, formData);
    }
  }, [currentStep, formData, onStepChange]);

  const updateFormData = (updates: Partial<ClientFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'BASIC_INFO':
        if (!formData.name.trim()) newErrors.name = 'Naam is verplicht';
        if (!formData.email.trim()) newErrors.email = 'Email is verplicht';
        if (!formData.phone.trim()) newErrors.phone = 'Telefoonnummer is verplicht';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ongeldig email adres';
        break;

      case 'BUSINESS_DETAILS':
        if (!formData.company?.trim()) newErrors.company = 'Bedrijfsnaam is verplicht';
        if (!formData.kvkNumber?.trim()) newErrors.kvkNumber = 'KVK nummer is verplicht';
        if (!formData.vatNumber?.trim()) newErrors.vatNumber = 'BTW nummer is verplicht';
        
        // Check validation states
        if (formData.kvkValidation && !formData.kvkValidation.result?.isValid) {
          newErrors.kvkNumber = 'KVK nummer moet geldig zijn';
        }
        if (formData.btwValidation && !formData.btwValidation.result?.isValid) {
          newErrors.vatNumber = 'BTW nummer moet geldig zijn';
        }
        break;

      case 'BANKING_INFO':
        if (!formData.address?.trim()) newErrors.address = 'Adres is verplicht';
        if (!formData.postalCode?.trim()) newErrors.postalCode = 'Postcode is verplicht';
        if (!formData.city?.trim()) newErrors.city = 'Plaats is verplicht';
        break;

      case 'VERIFICATION':
        if (!formData.adminContactName?.trim()) newErrors.adminContactName = 'Contact naam is verplicht';
        if (!formData.adminContactEmail?.trim()) newErrors.adminContactEmail = 'Contact email is verplicht';
        if (!formData.adminDepartment?.trim()) newErrors.adminDepartment = 'Afdeling is verplicht';
        break;

      case 'COMPLETED':
        if (!formData.iban?.trim()) newErrors.iban = 'IBAN is verplicht';
        if (!formData.bankName?.trim()) newErrors.bankName = 'Bank naam is verplicht';
        if (!formData.accountHolder?.trim()) newErrors.accountHolder = 'Rekeninghouder is verplicht';
        if (!formData.acceptedTerms) newErrors.acceptedTerms = 'Voorwaarden moeten geaccepteerd worden';
        if (!formData.acceptedPrivacy) newErrors.acceptedPrivacy = 'Privacy beleid moet geaccepteerd worden';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id;
      setCurrentStep(nextStep);
      updateFormData({ onboardingStep: nextStep });
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].id;
      setCurrentStep(prevStep);
      updateFormData({ onboardingStep: prevStep });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Onboarding submission error:', error);
      setErrors({ submit: 'Er is een fout opgetreden. Probeer het opnieuw.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'BASIC_INFO':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Volledige Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Jan de Vries"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  placeholder="+31 6 12345678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Adres *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="jan@voorbeeld.nl"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        );

      case 'BUSINESS_DETAILS':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Bedrijfsnaam *</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => updateFormData({ company: e.target.value })}
                placeholder="Mijn ZZP Bedrijf"
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Bedrijfstype</Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value: BusinessType) => updateFormData({ businessType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZZP">ZZP (Zelfstandige zonder personeel)</SelectItem>
                  <SelectItem value="EENMANSZAAK">Eenmanszaak</SelectItem>
                  <SelectItem value="VOF">VOF (Vennootschap onder firma)</SelectItem>
                  <SelectItem value="BV">BV (Besloten vennootschap)</SelectItem>
                  <SelectItem value="OTHER">Anders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <KvKValidationField
                  value={formData.kvkNumber || ''}
                  onChange={(value) => updateFormData({ kvkNumber: value })}
                  onValidationResult={(result) => 
                    updateFormData({ 
                      kvkValidation: { 
                        isValidating: false, 
                        hasValidated: true, 
                        result: result || undefined 
                      }
                    })
                  }
                  label="KVK Nummer *"
                  placeholder="12345678"
                  required={true}
                />
              </div>

              <div className="space-y-2">
                <BTWValidationField
                  value={formData.vatNumber || ''}
                  onChange={(value) => updateFormData({ vatNumber: value })}
                  onValidationResult={(result) => 
                    updateFormData({ 
                      btwValidation: { 
                        isValidating: false, 
                        hasValidated: true, 
                        result: result || undefined 
                      }
                    })
                  }
                  label="BTW Nummer *"
                  placeholder="NL123456789B01"
                  required={true}
                />
              </div>
            </div>
          </div>
        );

      case 'BANKING_INFO':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address">Adres *</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => updateFormData({ address: e.target.value })}
                placeholder="Hoofdstraat 123"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postcode *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode || ''}
                  onChange={(e) => updateFormData({ postalCode: e.target.value })}
                  placeholder="1234 AB"
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Plaats *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  placeholder="Amsterdam"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => updateFormData({ country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Netherlands">Nederland</SelectItem>
                    <SelectItem value="Belgium">België</SelectItem>
                    <SelectItem value="Germany">Duitsland</SelectItem>
                    <SelectItem value="Other">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postboxNumber">Postbus Nummer (optioneel)</Label>
              <Input
                id="postboxNumber"
                value={formData.postboxNumber || ''}
                onChange={(e) => updateFormData({ postboxNumber: e.target.value })}
                placeholder="Postbus 1234"
              />
            </div>
          </div>
        );

      case 'VERIFICATION':
        return (
          <div className="space-y-6">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Geef de contactgegevens op van de persoon die verantwoordelijk is voor de administratie.
                Dit kan uzelf zijn of een externe administratiekantoor.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminContactName">Contact Naam *</Label>
                <Input
                  id="adminContactName"
                  value={formData.adminContactName || ''}
                  onChange={(e) => updateFormData({ adminContactName: e.target.value })}
                  placeholder="Jan de Boekhouder"
                  className={errors.adminContactName ? 'border-red-500' : ''}
                />
                {errors.adminContactName && (
                  <p className="text-sm text-red-500">{errors.adminContactName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminContactPhone">Contact Telefoon</Label>
                <Input
                  id="adminContactPhone"
                  value={formData.adminContactPhone || ''}
                  onChange={(e) => updateFormData({ adminContactPhone: e.target.value })}
                  placeholder="+31 20 1234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminContactEmail">Contact Email *</Label>
              <Input
                id="adminContactEmail"
                type="email"
                value={formData.adminContactEmail || ''}
                onChange={(e) => updateFormData({ adminContactEmail: e.target.value })}
                placeholder="administratie@voorbeeld.nl"
                className={errors.adminContactEmail ? 'border-red-500' : ''}
              />
              {errors.adminContactEmail && (
                <p className="text-sm text-red-500">{errors.adminContactEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminDepartment">Afdeling/Functie *</Label>
              <Select 
                value={formData.adminDepartment || ''} 
                onValueChange={(value) => updateFormData({ adminDepartment: value })}
              >
                <SelectTrigger className={errors.adminDepartment ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecteer afdeling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eigenaar/ZZP'er">Eigenaar/ZZP'er</SelectItem>
                  <SelectItem value="Administratie">Administratie afdeling</SelectItem>
                  <SelectItem value="Boekhouder">Externe boekhouder</SelectItem>
                  <SelectItem value="Accountant">Accountantskantoor</SelectItem>
                  <SelectItem value="Financieel adviseur">Financieel adviseur</SelectItem>
                  <SelectItem value="Anders">Anders</SelectItem>
                </SelectContent>
              </Select>
              {errors.adminDepartment && (
                <p className="text-sm text-red-500">{errors.adminDepartment}</p>
              )}
            </div>
          </div>
        );

      case 'COMPLETED':
        return (
          <div className="space-y-6">
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Vul uw bankgegevens in voor betalingen en factuurverwerking.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN Nummer *</Label>
              <Input
                id="iban"
                value={formData.iban || ''}
                onChange={(e) => updateFormData({ iban: e.target.value.toUpperCase() })}
                placeholder="NL91 ABNA 0417 1643 00"
                className={errors.iban ? 'border-red-500' : ''}
              />
              {errors.iban && (
                <p className="text-sm text-red-500">{errors.iban}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Naam *</Label>
                <Input
                  id="bankName"
                  value={formData.bankName || ''}
                  onChange={(e) => updateFormData({ bankName: e.target.value })}
                  placeholder="ABN AMRO"
                  className={errors.bankName ? 'border-red-500' : ''}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500">{errors.bankName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">Rekeninghouder *</Label>
                <Input
                  id="accountHolder"
                  value={formData.accountHolder || ''}
                  onChange={(e) => updateFormData({ accountHolder: e.target.value })}
                  placeholder="J. de Vries"
                  className={errors.accountHolder ? 'border-red-500' : ''}
                />
                {errors.accountHolder && (
                  <p className="text-sm text-red-500">{errors.accountHolder}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onCheckedChange={(checked) => updateFormData({ acceptedTerms: !!checked })}
                />
                <Label htmlFor="acceptedTerms" className="text-sm">
                  Ik accepteer de{' '}
                  <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                    algemene voorwaarden
                  </a>{' '}
                  *
                </Label>
              </div>
              {errors.acceptedTerms && (
                <p className="text-sm text-red-500">{errors.acceptedTerms}</p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptedPrivacy"
                  checked={formData.acceptedPrivacy}
                  onCheckedChange={(checked) => updateFormData({ acceptedPrivacy: !!checked })}
                />
                <Label htmlFor="acceptedPrivacy" className="text-sm">
                  Ik accepteer het{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                    privacy beleid
                  </a>{' '}
                  *
                </Label>
              </div>
              {errors.acceptedPrivacy && (
                <p className="text-sm text-red-500">{errors.acceptedPrivacy}</p>
              )}
            </div>

            {errors.submit && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Klant Onboarding</h1>
          <Badge variant="outline">
            Stap {currentStepIndex + 1} van {steps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="w-full" />
        
        {/* Step Indicators */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex flex-col items-center space-y-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {steps[currentStepIndex].icon}
            <span>{steps[currentStepIndex].title}</span>
          </CardTitle>
          <CardDescription>
            {steps[currentStepIndex].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Vorige</span>
        </Button>

        {currentStep === 'COMPLETED' ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verzenden...</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                <span>Registratie Voltooien</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2"
          >
            <span>Volgende</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
