
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Calculator, Calendar, Send, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Client, InvoiceFormData, InvoiceLineItemFormData, StandardService, InvoiceCalculation, DueDateType, InvoiceUnitType, DUE_DATE_OPTIONS, UNIT_TYPE_OPTIONS } from '@/lib/types';
import InvoiceCalculationService from '@/lib/services/invoice-calculation';

interface EnhancedInvoiceWizardProps {
  clients: Client[];
  onSuccess?: (invoice: any) => void;
  onCancel?: () => void;
}

export default function EnhancedInvoiceWizard({ 
  clients = [], 
  onSuccess, 
  onCancel 
}: EnhancedInvoiceWizardProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<InvoiceFormData>({
    title: '',
    description: '',
    notes: '',
    clientId: '',
    dueDateType: 'FOURTEEN_DAYS',
    customDueDate: '',
    lineItems: [{
      description: '',
      quantity: 1,
      unitType: 'HOURS',
      rate: 0,
      notes: '',
      category: '',
      standardServiceId: '',
    }]
  });

  // State
  const [standardServices, setStandardServices] = useState<StandardService[]>([]);
  const [calculation, setCalculation] = useState<InvoiceCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Load standard services
  useEffect(() => {
    loadStandardServices();
  }, []);

  // Auto-calculate when line items change
  useEffect(() => {
    if (formData.lineItems.some(item => item.description && item.quantity > 0 && item.rate > 0)) {
      calculateInvoice();
    }
  }, [formData.lineItems, formData.dueDateType, formData.customDueDate]);

  const loadStandardServices = async () => {
    try {
      const response = await fetch('/api/standard-services?active=true&limit=100');
      if (response.ok) {
        const data = await response.json();
        setStandardServices(data.services || []);
      }
    } catch (error) {
      console.error('Error loading standard services:', error);
    }
  };

  const calculateInvoice = async () => {
    if (formData.lineItems.length === 0) return;

    setIsCalculating(true);
    try {
      const response = await fetch('/api/invoices/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems: formData.lineItems,
          dueDateType: formData.dueDateType,
          customDueDate: formData.customDueDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data.calculation);
      }
    } catch (error) {
      console.error('Error calculating invoice:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleServiceSelect = (lineIndex: number, serviceId: string) => {
    if (!serviceId) return;

    const service = standardServices.find(s => s.id === serviceId);
    if (!service) return;

    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[lineIndex] = {
      ...updatedLineItems[lineIndex],
      standardServiceId: serviceId,
      description: service.name,
      unitType: service.unitType,
      rate: service.defaultRate,
      category: service.category || '',
    };

    setFormData(prev => ({ ...prev, lineItems: updatedLineItems }));
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItemFormData, value: any) => {
    const updatedLineItems = [...formData.lineItems];
    updatedLineItems[index] = { ...updatedLineItems[index], [field]: value };
    setFormData(prev => ({ ...prev, lineItems: updatedLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          description: '',
          quantity: 1,
          unitType: 'HOURS',
          rate: 0,
          notes: '',
          category: '',
          standardServiceId: '',
        }
      ]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length === 1) return;
    const updatedLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lineItems: updatedLineItems }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Klant is verplicht';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Beschrijving is verplicht';
    }

    if (formData.dueDateType === 'CUSTOM' && !formData.customDueDate) {
      newErrors.customDueDate = 'Aangepaste vervaldatum is verplicht';
    }

    // Validate line items
    formData.lineItems.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`lineItem_${index}_description`] = `Regel ${index + 1}: Omschrijving is verplicht`;
      }
      if (item.quantity <= 0) {
        newErrors[`lineItem_${index}_quantity`] = `Regel ${index + 1}: Aantal moet groter zijn dan 0`;
      }
      if (item.rate <= 0) {
        newErrors[`lineItem_${index}_rate`] = `Regel ${index + 1}: Tarief moet groter zijn dan 0`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validatie fout",
        description: "Controleer de ingevoerde gegevens en probeer opnieuw.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Factuur aangemaakt",
          description: `Factuur ${data.invoice.invoiceNumber} is succesvol aangemaakt.`,
        });

        if (onSuccess) {
          onSuccess(data.invoice);
        } else {
          router.push(`/dashboard/invoices/${data.invoice.id}`);
        }
      } else {
        throw new Error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Fout bij aanmaken",
        description: "Er is een fout opgetreden bij het aanmaken van de factuur.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {[
          { step: 1, label: 'Basis', icon: FileText },
          { step: 2, label: 'Regels', icon: Plus },
          { step: 3, label: 'Overzicht', icon: Eye },
        ].map(({ step, label, icon: Icon }) => (
          <div key={step} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 
              ${currentStep >= step 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-400'
              }
            `}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {label}
            </span>
            {step < 3 && <div className="w-8 h-px bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basis Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Klant *</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        {client.company && (
                          <span className="text-sm text-muted-foreground">{client.company}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>

            {/* Selected client info */}
            {selectedClient && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-1">
                    <div><strong>Klant:</strong> {selectedClient.name}</div>
                    {selectedClient.company && <div><strong>Bedrijf:</strong> {selectedClient.company}</div>}
                    <div><strong>Email:</strong> {selectedClient.email}</div>
                    {selectedClient.address && (
                      <div><strong>Adres:</strong> {selectedClient.address}, {selectedClient.postalCode} {selectedClient.city}</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Title and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel (optioneel)</Label>
                <Input
                  id="title"
                  placeholder="Bijv. Website ontwikkeling Q4 2024"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Due Date Type */}
              <div className="space-y-2">
                <Label htmlFor="dueDateType">Vervaldatum</Label>
                <Select 
                  value={formData.dueDateType} 
                  onValueChange={(value: DueDateType) => setFormData(prev => ({ ...prev, dueDateType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DUE_DATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Due Date */}
            {formData.dueDateType === 'CUSTOM' && (
              <div className="space-y-2">
                <Label htmlFor="customDueDate">Aangepaste vervaldatum *</Label>
                <Input
                  id="customDueDate"
                  type="date"
                  value={formData.customDueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDueDate: e.target.value }))}
                />
                {errors.customDueDate && (
                  <p className="text-sm text-red-600">{errors.customDueDate}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Omschrijving *</Label>
              <Textarea
                id="description"
                placeholder="Beschrijf de werkzaamheden of diensten..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
              <Textarea
                id="notes"
                placeholder="Extra opmerkingen of voorwaarden..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} disabled={!formData.clientId || !formData.description}>
                Volgende: Regels
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Line Items */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Factuurregels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.lineItems.map((item, index) => (
                <LineItemRow
                  key={index}
                  item={item}
                  index={index}
                  standardServices={standardServices}
                  onUpdate={updateLineItem}
                  onServiceSelect={handleServiceSelect}
                  onRemove={() => removeLineItem(index)}
                  canRemove={formData.lineItems.length > 1}
                  errors={errors}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addLineItem}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Regel toevoegen
              </Button>

              {/* Calculation Preview */}
              {calculation && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotaal:</span>
                        <span>{InvoiceCalculationService.formatCurrency(calculation.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BTW (21%):</span>
                        <span>{InvoiceCalculationService.formatCurrency(calculation.btwAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Totaal:</span>
                        <span>{InvoiceCalculationService.formatCurrency(calculation.totalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Vorige
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)} 
                  disabled={formData.lineItems.some(item => !item.description || item.quantity <= 0 || item.rate <= 0)}
                >
                  Volgende: Overzicht
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Overzicht & Versturen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InvoicePreview
              formData={formData}
              client={selectedClient}
              calculation={calculation}
              onSubmit={handleSubmit}
              onBack={() => setCurrentStep(2)}
              onCancel={onCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Line Item Row Component
interface LineItemRowProps {
  item: InvoiceLineItemFormData;
  index: number;
  standardServices: StandardService[];
  onUpdate: (index: number, field: keyof InvoiceLineItemFormData, value: any) => void;
  onServiceSelect: (lineIndex: number, serviceId: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  errors: Record<string, string>;
}

function LineItemRow({ 
  item, 
  index, 
  standardServices, 
  onUpdate, 
  onServiceSelect, 
  onRemove, 
  canRemove, 
  errors 
}: LineItemRowProps) {
  const lineAmount = InvoiceCalculationService.calculateLineItem(item.quantity, item.rate);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Service Selection */}
        <div className="space-y-2">
          <Label>Standaarddienst (optioneel)</Label>
          <Select 
            value={item.standardServiceId} 
            onValueChange={(value) => onServiceSelect(index, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecteer een standaarddienst" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Geen standaarddienst</SelectItem>
              {standardServices.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {InvoiceCalculationService.formatCurrency(service.defaultRate)} per {UNIT_TYPE_OPTIONS.find(u => u.value === service.unitType)?.symbol}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Omschrijving *</Label>
          <Input
            placeholder="Beschrijf de dienst of het product"
            value={item.description}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
          />
          {errors[`lineItem_${index}_description`] && (
            <p className="text-sm text-red-600">{errors[`lineItem_${index}_description`]}</p>
          )}
        </div>

        {/* Quantity, Unit Type, Rate */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Aantal *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={item.quantity}
              onChange={(e) => onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)}
            />
            {errors[`lineItem_${index}_quantity`] && (
              <p className="text-sm text-red-600">{errors[`lineItem_${index}_quantity`]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Eenheid</Label>
            <Select 
              value={item.unitType} 
              onValueChange={(value: InvoiceUnitType) => onUpdate(index, 'unitType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tarief *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.rate}
              onChange={(e) => onUpdate(index, 'rate', parseFloat(e.target.value) || 0)}
            />
            {errors[`lineItem_${index}_rate`] && (
              <p className="text-sm text-red-600">{errors[`lineItem_${index}_rate`]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bedrag</Label>
            <div className="h-10 px-3 py-2 bg-gray-50 border rounded-md flex items-center">
              <span className="font-medium">
                {InvoiceCalculationService.formatCurrency(lineAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes and Actions */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Opmerkingen</Label>
            <Input
              placeholder="Extra opmerkingen voor deze regel"
              value={item.notes}
              onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              disabled={!canRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Invoice Preview Component
interface InvoicePreviewProps {
  formData: InvoiceFormData;
  client?: Client;
  calculation: InvoiceCalculation | null;
  onSubmit: () => void;
  onBack: () => void;
  onCancel?: () => void;
  isSubmitting: boolean;
}

function InvoicePreview({ 
  formData, 
  client, 
  calculation, 
  onSubmit, 
  onBack, 
  onCancel, 
  isSubmitting 
}: InvoicePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Invoice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Factuurgegevens</h3>
          <div className="space-y-2 text-sm">
            {formData.title && <div><strong>Titel:</strong> {formData.title}</div>}
            <div><strong>Omschrijving:</strong> {formData.description}</div>
            <div><strong>Vervaldatum:</strong> {DUE_DATE_OPTIONS.find(o => o.value === formData.dueDateType)?.label}</div>
            {formData.notes && <div><strong>Opmerkingen:</strong> {formData.notes}</div>}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Klantgegevens</h3>
          {client && (
            <div className="space-y-2 text-sm">
              <div><strong>Naam:</strong> {client.name}</div>
              {client.company && <div><strong>Bedrijf:</strong> {client.company}</div>}
              <div><strong>Email:</strong> {client.email}</div>
              {client.address && (
                <div><strong>Adres:</strong> {client.address}, {client.postalCode} {client.city}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      <div>
        <h3 className="font-semibold mb-3">Factuurregels</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Omschrijving</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Aantal</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Tarief</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {formData.lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      {item.notes && <div className="text-sm text-gray-600">{item.notes}</div>}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {InvoiceCalculationService.formatQuantity(item.quantity, item.unitType)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {InvoiceCalculationService.formatCurrency(item.rate)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {InvoiceCalculationService.formatCurrency(InvoiceCalculationService.calculateLineItem(item.quantity, item.rate))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      {calculation && (
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotaal:</span>
              <span>{InvoiceCalculationService.formatCurrency(calculation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>BTW (21%):</span>
              <span>{InvoiceCalculationService.formatCurrency(calculation.btwAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Totaal:</span>
              <span>{InvoiceCalculationService.formatCurrency(calculation.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Vorige
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
          )}
        </div>

        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Calculator className="w-4 h-4 mr-2 animate-spin" />
              Aanmaken...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Factuur Aanmaken
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
