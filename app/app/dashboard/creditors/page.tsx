
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KvKValidationField } from '@/components/forms/kvk-validation-field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, Search, MoreHorizontal, Building2, CheckCircle, XCircle, 
  Clock, AlertTriangle, Eye, Edit, FileText, CreditCard, 
  UserCheck, Mail, Phone, MapPin
} from 'lucide-react';
import { 
  mockCreditors, 
  mockCreditorValidations, 
  mockPayments,
  getCreditorById,
  getPaymentsByCreditorId,
  getPendingValidations,
  getValidatedCreditors
} from '@/lib/mock-data';
import { 
  Creditor, 
  CreditorValidation, 
  Payment, 
  ValidationStatus, 
  BusinessType, 
  ValidationMethod,
  KvKValidationResult,
  KvKCompanyData
} from '@/lib/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface NewCreditorForm {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  kvkNumber: string;
  vatNumber: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  iban: string;
  bankName: string;
  accountHolder: string;
  kvkValidationResult?: KvKValidationResult;
}

const initialFormData: NewCreditorForm = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  kvkNumber: '',
  vatNumber: '',
  address: '',
  postalCode: '',
  city: '',
  country: 'Netherlands',
  iban: '',
  bankName: '',
  accountHolder: '',
};

export default function CreditorsPage() {
  const { isDemo } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewCreditorForm>(initialFormData);
  const [selectedCreditor, setSelectedCreditor] = useState<Creditor | null>(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationNotes, setValidationNotes] = useState('');

  // Filter creditors
  const filteredCreditors = mockCreditors.filter(creditor => {
    const matchesSearch = creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creditor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || creditor.validationStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateFormData = (field: keyof NewCreditorForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCreditor = () => {
    // In a real app, this would call an API
    console.log('Adding creditor:', formData);
    setFormData(initialFormData);
    setIsAddDialogOpen(false);
    // Show success message
  };

  const handleValidateCreditor = (creditor: Creditor, status: 'VALIDATED' | 'REJECTED') => {
    // In a real app, this would call an API
    console.log(`${status} creditor:`, creditor.id, 'Notes:', validationNotes);
    setValidationNotes('');
    setIsValidationDialogOpen(false);
    setSelectedCreditor(null);
    // Show success message
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

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'VALIDATED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Gevalideerd</Badge>;
      case 'IN_REVIEW':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In review</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Geweigerd</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Verlopen</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In behandeling</Badge>;
    }
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case 'VALIDATED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_REVIEW':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  // Statistics
  const stats = {
    total: mockCreditors.length,
    validated: getValidatedCreditors().length,
    pending: getPendingValidations().length,
    totalPayments: mockPayments.length,
    totalPaymentAmount: mockPayments.reduce((sum, payment) => sum + payment.amount, 0)
  };

  return (
    <div className="space-y-8">
      {/* Demo Indicator */}
      {isDemo && (
        <div className="px-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Demo Modus:</strong> Je kunt crediteuren toevoegen en valideren. Alle wijzigingen zijn tijdelijk.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Header 
        title="Crediteurenbeheer" 
        description="Beheer je leveranciers en valideer hun gegevens" 
      />
      
      <div className="px-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Totaal Crediteuren</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.validated}</p>
                  <p className="text-sm text-muted-foreground">Gevalideerd</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Validatie Vereist</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                  <p className="text-sm text-muted-foreground">Betalingen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalPaymentAmount)}</p>
                  <p className="text-sm text-muted-foreground">Totaal Uitbetaald</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="creditors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="creditors">Crediteuren</TabsTrigger>
            <TabsTrigger value="validations">Validaties</TabsTrigger>
            <TabsTrigger value="payments">Betalingen</TabsTrigger>
          </TabsList>

          {/* Creditors Tab */}
          <TabsContent value="creditors" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Crediteuren Overzicht</span>
                  </CardTitle>
                  
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Crediteur Toevoegen</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Nieuwe Crediteur Toevoegen</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Basisgegevens</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="name">Contactpersoon *</Label>
                            <Input
                              id="name"
                              placeholder="Jan Janssen"
                              value={formData.name}
                              onChange={(e) => updateFormData('name', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">E-mailadres</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="jan@voorbeeld.nl"
                              value={formData.email}
                              onChange={(e) => updateFormData('email', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Telefoonnummer</Label>
                            <Input
                              id="phone"
                              placeholder="+31 20 123 4567"
                              value={formData.phone}
                              onChange={(e) => updateFormData('phone', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="companyName">Bedrijfsnaam *</Label>
                            <Input
                              id="companyName"
                              placeholder="Voorbeeld B.V."
                              value={formData.companyName}
                              onChange={(e) => updateFormData('companyName', e.target.value)}
                            />
                          </div>

                          <KvKValidationField
                            value={formData.kvkNumber}
                            onChange={(value) => updateFormData('kvkNumber', value)}
                            onValidationResult={handleKvKValidationResult}
                            onCompanyDataSelect={handleCompanyDataSelect}
                            label="KvK nummer"
                            placeholder="12345678"
                            showValidationDetails={true}
                            autoValidate={true}
                          />

                          <div className="space-y-2">
                            <Label htmlFor="vatNumber">BTW nummer</Label>
                            <Input
                              id="vatNumber"
                              placeholder="NL123456789B01"
                              value={formData.vatNumber}
                              onChange={(e) => updateFormData('vatNumber', e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Address & Banking */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Adres & Bankgegevens</h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="address">Adres</Label>
                            <Input
                              id="address"
                              placeholder="Hoofdstraat 123"
                              value={formData.address}
                              onChange={(e) => updateFormData('address', e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="postalCode">Postcode</Label>
                              <Input
                                id="postalCode"
                                placeholder="1000AB"
                                value={formData.postalCode}
                                onChange={(e) => updateFormData('postalCode', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="city">Plaats</Label>
                              <Input
                                id="city"
                                placeholder="Amsterdam"
                                value={formData.city}
                                onChange={(e) => updateFormData('city', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="iban">IBAN nummer</Label>
                            <Input
                              id="iban"
                              placeholder="NL91ABNA0417164300"
                              value={formData.iban}
                              onChange={(e) => updateFormData('iban', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bankName">Banknaam</Label>
                            <Input
                              id="bankName"
                              placeholder="ABN AMRO"
                              value={formData.bankName}
                              onChange={(e) => updateFormData('bankName', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="accountHolder">Rekeninghouder</Label>
                            <Input
                              id="accountHolder"
                              placeholder="Voorbeeld B.V."
                              value={formData.accountHolder}
                              onChange={(e) => updateFormData('accountHolder', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Annuleren
                        </Button>
                        <Button onClick={handleAddCreditor}>
                          Crediteur Toevoegen
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Zoek crediteuren..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter op status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle statussen</SelectItem>
                      <SelectItem value="PENDING">In behandeling</SelectItem>
                      <SelectItem value="IN_REVIEW">In review</SelectItem>
                      <SelectItem value="VALIDATED">Gevalideerd</SelectItem>
                      <SelectItem value="REJECTED">Geweigerd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crediteur</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Bedrijf</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Laatst Bijgewerkt</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditors.map((creditor) => (
                      <TableRow key={creditor.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{creditor.name}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {creditor.email && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{creditor.email}</span>
                                </div>
                              )}
                              {creditor.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{creditor.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{creditor.companyName}</p>
                            {creditor.address && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{creditor.city}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {creditor.kvkNumber && <p>KvK: {creditor.kvkNumber}</p>}
                            {creditor.vatNumber && <p>BTW: {creditor.vatNumber}</p>}
                            {creditor.iban && <p>IBAN: {creditor.iban.slice(0, 8)}...</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(creditor.validationStatus)}
                            {getStatusBadge(creditor.validationStatus)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(creditor.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Bekijk Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Bewerken
                              </DropdownMenuItem>
                              {creditor.validationStatus === 'PENDING' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCreditor(creditor);
                                    setIsValidationDialogOpen(true);
                                  }}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Valideren
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredCreditors.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Geen crediteuren gevonden met de huidige filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Validations Tab */}
          <TabsContent value="validations" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Validatie Overzicht</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crediteur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aangevraagd</TableHead>
                      <TableHead>Opmerkingen</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCreditorValidations.map((validation) => {
                      const creditor = getCreditorById(validation.creditorId);
                      return (
                        <TableRow key={validation.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{creditor?.name}</p>
                              <p className="text-sm text-muted-foreground">{creditor?.companyName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {validation.validationType === 'AUTOMATIC' ? 'Automatisch' : 
                               validation.validationType === 'MANUAL' ? 'Handmatig' : 'Hybride'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(validation.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(validation.requestedAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {validation.notes || '-'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Details Bekijken
                                </DropdownMenuItem>
                                {validation.status === 'PENDING' && (
                                  <>
                                    <DropdownMenuItem>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Goedkeuren
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Afwijzen
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Betalingen Overzicht</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crediteur</TableHead>
                      <TableHead>Bedrag</TableHead>
                      <TableHead>Beschrijving</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Gepland/Verwerkt</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.creditorName}</p>
                            <p className="text-sm text-muted-foreground">{payment.reference}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              payment.status === 'COMPLETED' ? 'default' :
                              payment.status === 'FAILED' ? 'destructive' :
                              payment.status === 'PROCESSING' ? 'secondary' : 'outline'
                            }
                          >
                            {payment.status === 'COMPLETED' ? 'Voltooid' :
                             payment.status === 'FAILED' ? 'Mislukt' :
                             payment.status === 'PROCESSING' ? 'Verwerken' :
                             payment.status === 'SCHEDULED' ? 'Gepland' : 'In behandeling'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.processedAt ? 
                            formatDateTime(payment.processedAt) : 
                            payment.scheduledAt ? 
                              formatDateTime(payment.scheduledAt) : 
                              formatDateTime(payment.createdAt)
                          }
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Details Bekijken
                              </DropdownMenuItem>
                              {payment.status === 'PENDING' && (
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Verwerken
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Validation Dialog */}
        <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crediteur Valideren</DialogTitle>
            </DialogHeader>
            
            {selectedCreditor && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">{selectedCreditor.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCreditor.companyName}</p>
                  <p className="text-sm text-muted-foreground">{selectedCreditor.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validation-notes">Opmerkingen</Label>
                  <Input
                    id="validation-notes"
                    placeholder="Voeg opmerkingen toe..."
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsValidationDialogOpen(false)}
                  >
                    Annuleren
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleValidateCreditor(selectedCreditor, 'REJECTED')}
                  >
                    Afwijzen
                  </Button>
                  <Button 
                    onClick={() => handleValidateCreditor(selectedCreditor, 'VALIDATED')}
                  >
                    Goedkeuren
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
