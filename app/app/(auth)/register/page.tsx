
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, Mail, Lock, User, Building2, Phone, MapPin, 
  CreditCard, CheckCircle, ArrowLeft, ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { OnboardingFormData, BusinessType, KvKValidationResult, KvKCompanyData } from '@/lib/types';
import { KvKValidationField } from '@/components/forms/kvk-validation-field';
import { BTWValidationField } from '@/components/forms/btw-validation-field';
import { isValidEmail, isValidIBAN } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Basisgegevens', description: 'Persoonlijke informatie' },
  { id: 2, title: 'Bedrijfsgegevens', description: 'KvK en BTW informatie' },
  { id: 3, title: 'Contactgegevens', description: 'Adres en telefoon' },
  { id: 4, title: 'Bankgegevens', description: 'IBAN en bankinfo' },
  { id: 5, title: 'Bevestiging', description: 'Voorwaarden en registratie' },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    kvkNumber: '',
    vatNumber: '',
    businessType: 'ZZP',
    address: '',
    postalCode: '',
    city: '',
    country: 'Netherlands',
    iban: '',
    bankName: '',
    accountHolder: '',
    isDemo: false,
    acceptedTerms: false,
    acceptedPrivacy: false,
  });

  const { register } = useAuth();
  const router = useRouter();

  const updateFormData = (field: keyof OnboardingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // KvK validation handlers
  const handleKvKValidationResult = (result: KvKValidationResult | null) => {
    setFormData(prev => ({
      ...prev,
      kvkValidationResult: result || undefined
    }));
  };

  const handleCompanyDataSelect = (companyData: KvKCompanyData) => {
    // Auto-fill form fields with validated company data
    setFormData(prev => ({
      ...prev,
      companyName: companyData.name || prev.companyName,
      address: companyData.address?.street && companyData.address?.houseNumber 
        ? `${companyData.address.street} ${companyData.address.houseNumber}` 
        : prev.address,
      postalCode: companyData.address?.postalCode || prev.postalCode,
      city: companyData.address?.city || prev.city,
      country: companyData.address?.country || prev.country,
    }));
  };

  const validateStep = (step: number): boolean => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('Naam is verplicht');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Email is verplicht');
          return false;
        }
        if (!isValidEmail(formData.email)) {
          setError('Voer een geldig emailadres in');
          return false;
        }
        break;
      case 2:
        if (!formData.companyName?.trim()) {
          setError('Bedrijfsnaam is verplicht');
          return false;
        }
        if (!formData.businessType) {
          setError('Selecteer een bedrijfstype');
          return false;
        }
        break;
      case 3:
        if (!formData.address?.trim()) {
          setError('Adres is verplicht');
          return false;
        }
        if (!formData.city?.trim()) {
          setError('Plaats is verplicht');
          return false;
        }
        break;
      case 4:
        if (formData.iban && !isValidIBAN(formData.iban)) {
          setError('Voer een geldig IBAN nummer in');
          return false;
        }
        break;
      case 5:
        if (!formData.acceptedTerms) {
          setError('Accepteer de algemene voorwaarden');
          return false;
        }
        if (!formData.acceptedPrivacy) {
          setError('Accepteer het privacybeleid');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsLoading(true);

    try {
      const success = await register(formData);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Registratie mislukt. Controleer je gegevens en probeer opnieuw.');
      }
    } catch (error) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Persoonlijke gegevens</h2>
              <p className="text-sm text-muted-foreground">
                Vul je naam en emailadres in om te beginnen
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Volledige naam *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Jan Janssen"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="jan@voorbeeld.nl"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+31 6 12345678"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Bedrijfsgegevens</h2>
              <p className="text-sm text-muted-foreground">
                Informatie over je bedrijf en KvK registratie
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Bedrijfsnaam *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Jan Janssen Consultancy"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Bedrijfstype *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => updateFormData('businessType', value as BusinessType)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecteer bedrijfstype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZZP">ZZP (Zelfstandige zonder personeel)</SelectItem>
                    <SelectItem value="BV">B.V. (Besloten vennootschap)</SelectItem>
                    <SelectItem value="VOF">V.O.F. (Vennootschap onder firma)</SelectItem>
                    <SelectItem value="EENMANSZAAK">Eenmanszaak</SelectItem>
                    <SelectItem value="OTHER">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <KvKValidationField
                value={formData.kvkNumber || ''}
                onChange={(value) => updateFormData('kvkNumber', value)}
                onValidationResult={handleKvKValidationResult}
                onCompanyDataSelect={handleCompanyDataSelect}
                label="KvK nummer"
                placeholder="12345678"
                showValidationDetails={true}
                autoValidate={true}
                className="[&_input]:h-12"
              />

              <BTWValidationField
                value={formData.vatNumber || ''}
                onChange={(value) => updateFormData('vatNumber', value)}
                onValidationResult={(result) => {
                  if (result && result.isValid && result.companyName) {
                    // Cross-validate with KvK data if available
                    if (formData.companyName && result.companyName) {
                      const similarity = result.companyName.toLowerCase().includes(formData.companyName.toLowerCase()) ||
                                       formData.companyName.toLowerCase().includes(result.companyName.toLowerCase());
                      if (!similarity) {
                        console.warn('BTW company name does not match KvK company name');
                      }
                    }
                  }
                }}
                label="BTW nummer"
                placeholder="NL123456789B01"
                autoValidate={true}
                className="[&_input]:h-12"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Contactgegevens</h2>
              <p className="text-sm text-muted-foreground">
                Je bedrijfsadres en contactinformatie
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adres *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Hoofdstraat 123"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postcode</Label>
                  <Input
                    id="postalCode"
                    placeholder="1000AB"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Plaats *</Label>
                  <Input
                    id="city"
                    placeholder="Amsterdam"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateFormData('country', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecteer land" />
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Bankgegevens</h2>
              <p className="text-sm text-muted-foreground">
                Je IBAN en bankinformatie voor betalingen
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN nummer</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="iban"
                    placeholder="NL91ABNA0417164300"
                    value={formData.iban}
                    onChange={(e) => updateFormData('iban', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Banknaam</Label>
                <Input
                  id="bankName"
                  placeholder="ABN AMRO"
                  value={formData.bankName}
                  onChange={(e) => updateFormData('bankName', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">Rekeninghouder</Label>
                <Input
                  id="accountHolder"
                  placeholder="Jan Janssen"
                  value={formData.accountHolder}
                  onChange={(e) => updateFormData('accountHolder', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 Deze gegevens zijn optioneel maar helpen bij het automatisch verwerken van betalingen.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Bevestig je registratie</h2>
              <p className="text-sm text-muted-foreground">
                Controleer je gegevens en accepteer de voorwaarden
              </p>
            </div>

            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <h3 className="font-medium text-gray-900">Overzicht van je gegevens:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Naam:</strong> {formData.name}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Bedrijf:</strong> {formData.companyName}</div>
                  <div><strong>Type:</strong> {formData.businessType}</div>
                  {formData.address && <div><strong>Adres:</strong> {formData.address}, {formData.city}</div>}
                </div>
              </div>

              {/* Demo Option */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="isDemo"
                  checked={formData.isDemo}
                  onCheckedChange={(checked) => updateFormData('isDemo', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="isDemo" className="text-sm font-medium">
                    Registreer als demo account
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Demo accounts hebben beperkte functionaliteit en testdata
                  </p>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptedTerms}
                    onCheckedChange={(checked) => updateFormData('acceptedTerms', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="text-sm">
                      Ik accepteer de{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        algemene voorwaarden
                      </Link>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.acceptedPrivacy}
                    onCheckedChange={(checked) => updateFormData('acceptedPrivacy', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="privacy" className="text-sm">
                      Ik accepteer het{' '}
                      <Link href="/privacy" className="text-primary hover:underline">
                        privacybeleid
                      </Link>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white text-lg font-bold">
                  ZT
                </div>
                <span className="text-2xl font-bold text-gray-900">ZZP Trust</span>
              </div>
            </div>
            
            {/* Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Stap {currentStep} van {STEPS.length}</span>
                <span>{Math.round(progress)}% voltooid</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step indicators */}
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      step.id === currentStep
                        ? 'bg-primary text-white'
                        : step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step Content */}
            {renderStep()}

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Vorige</span>
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <span>Volgende</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registreren...</span>
                    </>
                  ) : (
                    <>
                      <span>Account aanmaken</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-muted-foreground">
                Heb je al een account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Log hier in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
