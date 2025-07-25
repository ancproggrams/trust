
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export default function SettingsPage() {
  const { theme, effectiveTheme } = useTheme();
  
  // Profile settings state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+31 6 12345678',
    companyName: 'Doe Consulting',
    kvkNumber: '12345678',
    vatNumber: 'NL123456789B01',
    address: 'Hoofdstraat 123',
    postalCode: '1234 AB',
    city: 'Amsterdam',
    iban: 'NL91 ABNA 0417 164300'
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailInvoices: true,
    emailPayments: true,
    emailValidations: true,
    emailCompliance: false,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: false
  });

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
    apiAccess: false
  });

  const handleSaveProfile = () => {
    // TODO: Implement profile save
    console.log('Saving profile:', profile);
  };

  const handleSaveNotifications = () => {
    // TODO: Implement notification settings save
    console.log('Saving notifications:', notifications);
  };

  const handleSaveSecurity = () => {
    // TODO: Implement security settings save
    console.log('Saving security:', security);
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Instellingen" 
        description="Beheer je profiel, voorkeuren en beveiligingsinstellingen"
      />
      
      <div className="px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profiel</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Uiterlijk</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Meldingen</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Beveiliging</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Persoonlijke Gegevens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Bedrijfsgegevens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Bedrijfsnaam</Label>
                    <Input
                      id="company"
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kvk">KvK Nummer</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="kvk"
                        value={profile.kvkNumber}
                        onChange={(e) => setProfile({ ...profile, kvkNumber: e.target.value })}
                        className="touch-manipulation"
                      />
                      <Badge variant="secondary" className="px-2 py-1">
                        Geverifieerd
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">BTW Nummer</Label>
                    <Input
                      id="vat"
                      value={profile.vatNumber}
                      onChange={(e) => setProfile({ ...profile, vatNumber: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Adresgegevens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal">Postcode</Label>
                      <Input
                        id="postal"
                        value={profile.postalCode}
                        onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                        className="touch-manipulation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Plaats</Label>
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                        className="touch-manipulation"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card className="dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Bankgegevens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={profile.iban}
                      onChange={(e) => setProfile({ ...profile, iban: e.target.value })}
                      className="touch-manipulation"
                    />
                  </div>
                  <Button onClick={handleSaveProfile} className="w-full sm:w-auto touch-manipulation">
                    <Save className="h-4 w-4 mr-2" />
                    Profiel Opslaan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Uiterlijk & Taal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Kleurenschema</Label>
                    <div className="text-sm text-muted-foreground">
                      Kies tussen licht, donker of systeem thema
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Taal</Label>
                    <div className="text-sm text-muted-foreground">
                      Selecteer je voorkeurstaal
                    </div>
                  </div>
                  <LanguageSwitcher />
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base">Huidige Instellingen</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-3 bg-muted dark:bg-muted/50 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="text-sm">Thema: {theme === 'system' ? 'Systeem' : theme === 'dark' ? 'Donker' : 'Licht'}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-muted dark:bg-muted/50 rounded-lg">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Taal: Nederlands</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificatie Voorkeuren</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Factuur Notificaties</Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang e-mails over factuurupdates
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailInvoices}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailInvoices: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Betaling Notificaties</Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang e-mails over betalingen
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailPayments}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailPayments: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Validatie Notificaties</Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang e-mails over validatie updates
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailValidations}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailValidations: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Compliance Waarschuwingen</Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang belangrijke compliance updates
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailCompliance}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailCompliance: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notificaties</Label>
                      <div className="text-sm text-muted-foreground">
                        Browser notificaties voor belangrijke updates
                      </div>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Wekelijkse Rapporten</Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang wekelijks een overzicht
                      </div>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full sm:w-auto touch-manipulation">
                  <Save className="h-4 w-4 mr-2" />
                  Notificaties Opslaan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Beveiligingsinstellingen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Beveiligingsopties zijn momenteel in ontwikkeling
                    </span>
                  </div>
                </div>

                <div className="space-y-4 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Twee-factor Authenticatie</Label>
                      <div className="text-sm text-muted-foreground">
                        Extra beveiliging voor je account
                      </div>
                    </div>
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                      disabled
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Inlog Waarschuwingen</Label>
                      <div className="text-sm text-muted-foreground">
                        Ontvang waarschuwingen bij nieuwe inlogs
                      </div>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity({ ...security, loginAlerts: checked })}
                      disabled
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSecurity} disabled className="w-full sm:w-auto touch-manipulation">
                  <Save className="h-4 w-4 mr-2" />
                  Beveiliging Opslaan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
