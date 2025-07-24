
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Save,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Switch } from '@/components/ui/switch';
import { mockTaxSettings } from '@/lib/mock-data';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    address: '',
    bio: '',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailInvoices: true,
    emailAppointments: true,
    emailDocuments: true,
    pushNotifications: false,
    weeklyReport: true,
  });

  // Business Settings
  const [businessData, setBusinessData] = useState({
    companyName: '',
    vatNumber: '',
    chamberOfCommerce: '',
    bankAccount: '',
    invoicePrefix: 'INV',
    defaultPaymentTerms: '30',
  });

  // BTW/Belasting Settings
  const [taxData, setTaxData] = useState({
    defaultBTWRate: mockTaxSettings.defaultBTWRate.toString(),
    btwEnabled: mockTaxSettings.btwEnabled,
    quarterlyBTWPrepaymentsEnabled: mockTaxSettings.quarterlyBTWPrepaymentsEnabled,
    btwPrepaymentAmount: mockTaxSettings.btwPrepaymentAmount.toString(),
    taxReservationEnabled: mockTaxSettings.taxReservationEnabled,
    taxReservationRate: mockTaxSettings.taxReservationRate.toString(),
    annualTaxThreshold: mockTaxSettings.annualTaxThreshold.toString(),
    taxOfficeContactEmail: mockTaxSettings.taxOfficeContactEmail,
    taxFilingMethod: mockTaxSettings.taxFilingMethod,
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleSaveBusiness = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleSaveTax = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <Header 
        title="Instellingen" 
        description="Beheer je account en applicatie voorkeuren"
      />
      
      <div className="px-6">
        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Je instellingen zijn succesvol opgeslagen.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profiel Informatie</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Volledige Naam</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Jan Janssen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="jan@voorbeeld.nl"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoon</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+31 6 12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Bedrijfsnaam</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      placeholder="Mijn ZZP Bedrijf"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Hoofdstraat 123, 1000 AB Amsterdam"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Vertel iets over jezelf en je werkzaamheden..."
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Profiel Opslaan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Business Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Bedrijfsgegevens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Bedrijfsnaam</Label>
                    <Input
                      id="companyName"
                      value={businessData.companyName}
                      onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                      placeholder="Mijn ZZP Onderneming"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">BTW-nummer</Label>
                    <Input
                      id="vatNumber"
                      value={businessData.vatNumber}
                      onChange={(e) => setBusinessData({ ...businessData, vatNumber: e.target.value })}
                      placeholder="NL123456789B01"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chamberOfCommerce">KvK-nummer</Label>
                    <Input
                      id="chamberOfCommerce"
                      value={businessData.chamberOfCommerce}
                      onChange={(e) => setBusinessData({ ...businessData, chamberOfCommerce: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bankrekening</Label>
                    <Input
                      id="bankAccount"
                      value={businessData.bankAccount}
                      onChange={(e) => setBusinessData({ ...businessData, bankAccount: e.target.value })}
                      placeholder="NL12 ABCD 0123 4567 89"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Factuur Voorvoegsel</Label>
                    <Input
                      id="invoicePrefix"
                      value={businessData.invoicePrefix}
                      onChange={(e) => setBusinessData({ ...businessData, invoicePrefix: e.target.value })}
                      placeholder="INV"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Standaard Betalingstermijn (dagen)</Label>
                    <Input
                      id="paymentTerms"
                      type="number"
                      value={businessData.defaultPaymentTerms}
                      onChange={(e) => setBusinessData({ ...businessData, defaultPaymentTerms: e.target.value })}
                      placeholder="30"
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveBusiness} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Bedrijfsgegevens Opslaan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* BTW/Belasting Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>BTW & Belasting Instellingen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* BTW Instellingen */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">BTW Beheer Inschakelen</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatische BTW berekening en tracking
                      </p>
                    </div>
                    <Switch
                      checked={taxData.btwEnabled}
                      onCheckedChange={(checked) => 
                        setTaxData({ ...taxData, btwEnabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultBTWRate">Standaard BTW Tarief (%)</Label>
                      <Input
                        id="defaultBTWRate"
                        type="number"
                        value={taxData.defaultBTWRate}
                        onChange={(e) => setTaxData({ ...taxData, defaultBTWRate: e.target.value })}
                        placeholder="21"
                        disabled={!taxData.btwEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="btwPrepaymentAmount">BTW Vooruitbetaling per Kwartaal (€)</Label>
                      <Input
                        id="btwPrepaymentAmount"
                        type="number"
                        step="0.01"
                        value={taxData.btwPrepaymentAmount}
                        onChange={(e) => setTaxData({ ...taxData, btwPrepaymentAmount: e.target.value })}
                        placeholder="1500.00"
                        disabled={!taxData.btwEnabled}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Kwartaal BTW Vooruitbetalingen</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatisch BTW vooruitbetalen per kwartaal
                      </p>
                    </div>
                    <Switch
                      checked={taxData.quarterlyBTWPrepaymentsEnabled}
                      onCheckedChange={(checked) => 
                        setTaxData({ ...taxData, quarterlyBTWPrepaymentsEnabled: checked })
                      }
                      disabled={!taxData.btwEnabled}
                    />
                  </div>
                </div>

                <hr className="my-6" />

                {/* Omzetbelasting Instellingen */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Omzetbelasting Reservering</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatisch percentage van omzet reserveren voor jaaraangifte
                      </p>
                    </div>
                    <Switch
                      checked={taxData.taxReservationEnabled}
                      onCheckedChange={(checked) => 
                        setTaxData({ ...taxData, taxReservationEnabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxReservationRate">Reservering Percentage (%)</Label>
                      <Input
                        id="taxReservationRate"
                        type="number"
                        value={taxData.taxReservationRate}
                        onChange={(e) => setTaxData({ ...taxData, taxReservationRate: e.target.value })}
                        placeholder="25"
                        disabled={!taxData.taxReservationEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annualTaxThreshold">Jaarlijkse Belasting Drempel (€)</Label>
                      <Input
                        id="annualTaxThreshold"
                        type="number"
                        step="0.01"
                        value={taxData.annualTaxThreshold}
                        onChange={(e) => setTaxData({ ...taxData, annualTaxThreshold: e.target.value })}
                        placeholder="20000.00"
                        disabled={!taxData.taxReservationEnabled}
                      />
                    </div>
                  </div>
                </div>

                <hr className="my-6" />

                {/* Belastingdienst Instellingen */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxOfficeEmail">Belastingdienst Contact Email</Label>
                      <Input
                        id="taxOfficeEmail"
                        type="email"
                        value={taxData.taxOfficeContactEmail}
                        onChange={(e) => setTaxData({ ...taxData, taxOfficeContactEmail: e.target.value })}
                        placeholder="contact@belastingdienst.nl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxFilingMethod">Aangifte Methode</Label>
                      <Select 
                        value={taxData.taxFilingMethod} 
                        onValueChange={(value: 'manual' | 'automatic') => 
                          setTaxData({ ...taxData, taxFilingMethod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Handmatig</SelectItem>
                          <SelectItem value="automatic">Automatisch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleSaveTax} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      BTW & Belasting Opslaan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Side Settings */}
          <div className="space-y-8">
            {/* Notification Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Meldingen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Factuur meldingen</Label>
                      <p className="text-xs text-muted-foreground">
                        Ontvang updates over facturen
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailInvoices}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailInvoices: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Afspraak meldingen</Label>
                      <p className="text-xs text-muted-foreground">
                        Herinneringen voor afspraken
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailAppointments}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailAppointments: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Document meldingen</Label>
                      <p className="text-xs text-muted-foreground">
                        Updates over ondertekeningen
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailDocuments}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailDocuments: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Weekrapport</Label>
                      <p className="text-xs text-muted-foreground">
                        Wekelijkse samenvatting
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weeklyReport: checked })
                      }
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveNotifications} disabled={isSaving} className="w-full">
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Meldingen Opslaan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Beveiliging</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Wachtwoord Wijzigen
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Bevestigen
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Twee-factor Authenticatie
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Account</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">Gratis Account</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lidmaatschap sinds:</span>
                    <span className="font-medium">Juli 2024</span>
                  </div>
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                  Upgrade naar Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
