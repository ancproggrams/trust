
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Download, Upload, Star, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { StandardService, StandardServiceFormData, InvoiceUnitType, UNIT_TYPE_OPTIONS } from '@/lib/types';
import StandardServicesService from '@/lib/services/standard-services';
import InvoiceCalculationService from '@/lib/services/invoice-calculation';

export default function StandardServicesManager() {
  const { toast } = useToast();

  // State
  const [services, setServices] = useState<StandardService[]>([]);
  const [filteredServices, setFilteredServices] = useState<StandardService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<StandardService | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState<StandardServiceFormData>({
    name: '',
    description: '',
    category: '',
    defaultRate: 0,
    unitType: 'HOURS',
    isDefault: false,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Categories and stats
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, selectedCategory, showActiveOnly]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/standard-services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        setStats(data.stats);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.services?.map((s: StandardService) => s.category).filter(Boolean))
        ) as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon standaarddiensten niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by active status
    if (showActiveOnly) {
      filtered = StandardServicesService.getActiveServices(filtered);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = StandardServicesService.filterByCategory(filtered, selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = StandardServicesService.searchServices(filtered, searchQuery);
    }

    setFilteredServices(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      defaultRate: 0,
      unitType: 'HOURS',
      isDefault: false,
    });
    setFormErrors([]);
    setEditingService(null);
  };

  const openDialog = (service?: StandardService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category || '',
        defaultRate: service.defaultRate,
        unitType: service.unitType,
        isDefault: service.isDefault,
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    // Validate form
    const validation = StandardServicesService.validateService(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const url = editingService 
        ? `/api/standard-services/${editingService.id}`
        : '/api/standard-services';
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: editingService ? "Service bijgewerkt" : "Service aangemaakt",
          description: `${formData.name} is succesvol ${editingService ? 'bijgewerkt' : 'aangemaakt'}.`,
        });

        setShowDialog(false);
        resetForm();
        loadServices();
      } else {
        throw new Error(data.error || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van de service.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (service: StandardService) => {
    if (!confirm(`Weet je zeker dat je "${service.name}" wilt verwijderen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/standard-services/${service.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Service verwijderd",
          description: data.message,
        });
        loadServices();
      } else {
        throw new Error(data.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van de service.",
        variant: "destructive",
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedServices.length === 0) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst services om een actie uit te voeren.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/standard-services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          serviceIds: selectedServices,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Actie uitgevoerd",
          description: data.message,
        });
        setSelectedServices([]);
        loadServices();
      } else {
        throw new Error(data.error || 'Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Fout bij bulk actie",
        description: "Er is een fout opgetreden bij het uitvoeren van de actie.",
        variant: "destructive",
      });
    }
  };

  const exportServices = () => {
    const csvContent = StandardServicesService.exportToCSV(services);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `standaarddiensten_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedServices.length === filteredServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(filteredServices.map(s => s.id));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Laden...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.totalServices || 0}</div>
            <div className="text-sm text-muted-foreground">Totaal Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.activeServices || 0}</div>
            <div className="text-sm text-muted-foreground">Actief</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.totalUsage || 0}</div>
            <div className="text-sm text-muted-foreground">Totaal Gebruikt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              {stats?.averageRate ? InvoiceCalculationService.formatCurrency(stats.averageRate) : '€0'}
            </div>
            <div className="text-sm text-muted-foreground">Gemiddeld Tarief</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Standaarddiensten Beheer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Active Only Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={setShowActiveOnly}
              />
              <Label htmlFor="active-only">Alleen actief</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Service
                </Button>
              </DialogTrigger>
              <ServiceDialog
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                errors={formErrors}
                isEditing={!!editingService}
                onSubmit={handleSubmit}
                onCancel={() => setShowDialog(false)}
              />
            </Dialog>

            <Button variant="outline" onClick={exportServices}>
              <Download className="h-4 w-4 mr-2" />
              Exporteer CSV
            </Button>

            {selectedServices.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Bulk Acties ({selectedServices.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                    Activeren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                    Deactiveren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('setDefault')}>
                    Als standaard instellen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('unsetDefault')}>
                    Standaard verwijderen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Services List */}
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-2 py-2 border-b">
              <input
                type="checkbox"
                checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                onChange={toggleAllSelection}
                className="rounded"
              />
              <span className="text-sm font-medium">
                Selecteer alle ({filteredServices.length})
              </span>
            </div>

            {filteredServices.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Geen services gevonden. Pas je filters aan of voeg een nieuwe service toe.
                </AlertDescription>
              </Alert>
            ) : (
              filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedServices.includes(service.id)}
                  onToggleSelect={() => toggleServiceSelection(service.id)}
                  onEdit={() => openDialog(service)}
                  onDelete={() => handleDelete(service)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Service Card Component
interface ServiceCardProps {
  service: StandardService;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ServiceCard({ service, isSelected, onToggleSelect, onEdit, onDelete }: ServiceCardProps) {
  const unitOption = UNIT_TYPE_OPTIONS.find(u => u.value === service.unitType);

  return (
    <Card className={`transition-colors ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 rounded"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                {service.isDefault && (
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    Standaard
                  </Badge>
                )}
                {!service.isActive && (
                  <Badge variant="outline">Inactief</Badge>
                )}
              </div>

              {service.description && (
                <p className="text-muted-foreground mb-2">{service.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {service.category && (
                  <div>
                    <span className="font-medium">Categorie:</span> {service.category}
                  </div>
                )}
                <div>
                  <span className="font-medium">Tarief:</span>{' '}
                  {InvoiceCalculationService.formatCurrency(service.defaultRate)}
                  {unitOption && ` per ${unitOption.symbol}`}
                </div>
                <div>
                  <span className="font-medium">Gebruikt:</span> {service.timesUsed}x
                </div>
                {service.lastUsedAt && (
                  <div>
                    <span className="font-medium">Laatst gebruikt:</span>{' '}
                    {new Date(service.lastUsedAt).toLocaleDateString('nl-NL')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Service Dialog Component
interface ServiceDialogProps {
  formData: StandardServiceFormData;
  setFormData: (data: StandardServiceFormData) => void;
  categories: string[];
  errors: string[];
  isEditing: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

function ServiceDialog({ 
  formData, 
  setFormData, 
  categories, 
  errors, 
  isEditing, 
  onSubmit, 
  onCancel 
}: ServiceDialogProps) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Service Bewerken' : 'Nieuwe Service'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Naam *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Naam van de service"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Beschrijving</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Beschrijf de service..."
            rows={3}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categorie</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecteer of typ een categorie" />
            </SelectTrigger>
            <SelectContent>
              {StandardServicesService.DEFAULT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
              {categories.filter(c => !StandardServicesService.DEFAULT_CATEGORIES.includes(c)).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Default Rate and Unit Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultRate">Standaardtarief *</Label>
            <Input
              id="defaultRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.defaultRate}
              onChange={(e) => setFormData({ ...formData, defaultRate: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitType">Eenheidstype *</Label>
            <Select 
              value={formData.unitType} 
              onValueChange={(value: InvoiceUnitType) => setFormData({ ...formData, unitType: value })}
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
        </div>

        {/* Is Default */}
        <div className="flex items-center space-x-2">
          <Switch
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
          />
          <Label htmlFor="isDefault">Als standaardservice instellen</Label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Annuleren
          </Button>
          <Button onClick={onSubmit}>
            {isEditing ? 'Bijwerken' : 'Aanmaken'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
