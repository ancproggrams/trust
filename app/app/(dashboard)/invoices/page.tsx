
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  CreditCard,
  Download,
  Send,
  Filter
} from 'lucide-react';
import { mockInvoices, mockClients } from '@/lib/mock-data';
import { Invoice, InvoiceItem } from '@/lib/types';
import { 
  formatCurrency, 
  formatDate, 
  generateId, 
  getInvoiceStatusColor,
  translateStatus 
} from '@/lib/utils';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    description: '',
    dueDate: '',
    status: 'draft' as Invoice['status'],
  });

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setFormData({
      clientId: '',
      amount: '',
      description: '',
      dueDate: '',
      status: 'draft',
    });
  };

  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith(`INV-${year}`))
      .map(num => parseInt(num.split('-')[2]) || 0);
    
    const nextNumber = Math.max(0, ...existingNumbers) + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
    resetForm();
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      clientId: invoice.clientId,
      amount: invoice.amount.toString(),
      description: invoice.description,
      dueDate: invoice.dueDate.toISOString().split('T')[0],
      status: invoice.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.clientId || !formData.amount || !formData.description) {
      alert('Vul alle verplichte velden in');
      return;
    }

    const client = mockClients.find(c => c.id === formData.clientId);
    if (!client) {
      alert('Selecteer een geldige klant');
      return;
    }

    const newInvoice: Invoice = {
      id: generateId(),
      clientId: formData.clientId,
      clientName: client.name,
      invoiceNumber: generateInvoiceNumber(),
      amount: parseFloat(formData.amount),
      status: formData.status,
      dueDate: new Date(formData.dueDate),
      createdAt: new Date(),
      description: formData.description,
      items: [
        {
          id: generateId(),
          description: formData.description,
          quantity: 1,
          rate: parseFloat(formData.amount),
          amount: parseFloat(formData.amount),
        }
      ],
    };

    setInvoices([...invoices, newInvoice]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleSaveEdit = () => {
    if (!selectedInvoice || !formData.clientId || !formData.amount || !formData.description) {
      alert('Vul alle verplichte velden in');
      return;
    }

    const client = mockClients.find(c => c.id === formData.clientId);
    if (!client) {
      alert('Selecteer een geldige klant');
      return;
    }

    const updatedInvoices = invoices.map(invoice =>
      invoice.id === selectedInvoice.id
        ? {
            ...invoice,
            clientId: formData.clientId,
            clientName: client.name,
            amount: parseFloat(formData.amount),
            description: formData.description,
            dueDate: new Date(formData.dueDate),
            status: formData.status,
            items: [
              {
                id: invoice.items[0]?.id || generateId(),
                description: formData.description,
                quantity: 1,
                rate: parseFloat(formData.amount),
                amount: parseFloat(formData.amount),
              }
            ],
          }
        : invoice
    );

    setInvoices(updatedInvoices);
    setIsEditDialogOpen(false);
    setSelectedInvoice(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!selectedInvoice) return;

    const updatedInvoices = invoices.filter(invoice => invoice.id !== selectedInvoice.id);
    setInvoices(updatedInvoices);
    setIsDeleteDialogOpen(false);
    setSelectedInvoice(null);
  };

  const handleStatusChange = (invoice: Invoice, newStatus: Invoice['status']) => {
    const updatedInvoices = invoices.map(inv =>
      inv.id === invoice.id ? { ...inv, status: newStatus } : inv
    );
    setInvoices(updatedInvoices);
  };

  return (
    <div className="space-y-8">
      <Header 
        title="Facturen" 
        description={`Beheer je ${invoices.length} facturen en betalingen`}
      />
      
      <div className="px-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek facturen..."
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
              <SelectItem value="draft">Concept</SelectItem>
              <SelectItem value="sent">Verzonden</SelectItem>
              <SelectItem value="paid">Betaald</SelectItem>
              <SelectItem value="overdue">Vervallen</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Factuur
          </Button>
        </div>

        {/* Invoices Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {filteredInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Factuur</TableHead>
                    <TableHead>Klant</TableHead>
                    <TableHead>Bedrag</TableHead>
                    <TableHead>Vervaldatum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aangemaakt</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-48">
                          {invoice.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{invoice.clientName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(invoice.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(invoice.dueDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={invoice.status}
                          onValueChange={(value: Invoice['status']) => 
                            handleStatusChange(invoice, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <Badge
                              variant="secondary"
                              className={getInvoiceStatusColor(invoice.status)}
                            >
                              {translateStatus(invoice.status, 'invoice')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Concept</SelectItem>
                            <SelectItem value="sent">Verzonden</SelectItem>
                            <SelectItem value="paid">Betaald</SelectItem>
                            <SelectItem value="overdue">Vervallen</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(invoice.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Versturen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(invoice)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'Geen facturen gevonden' : 'Nog geen facturen'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Probeer je zoekfilters aan te passen'
                    : 'Maak je eerste factuur om te beginnen'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Eerste Factuur Maken
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuwe Factuur Maken</DialogTitle>
            <DialogDescription>
              Maak een nieuwe factuur voor een klant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-client">Klant *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-amount">Bedrag *</Label>
              <Input
                id="add-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Beschrijving *</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Website ontwikkeling project..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-dueDate">Vervaldatum</Label>
              <Input
                id="add-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Invoice['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Concept</SelectItem>
                  <SelectItem value="sent">Verzonden</SelectItem>
                  <SelectItem value="paid">Betaald</SelectItem>
                  <SelectItem value="overdue">Vervallen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveAdd}>
              Factuur Maken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Factuur Bewerken</DialogTitle>
            <DialogDescription>
              Bewerk factuur {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Klant *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Bedrag *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschrijving *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Website ontwikkeling project..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Vervaldatum</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Invoice['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Concept</SelectItem>
                  <SelectItem value="sent">Verzonden</SelectItem>
                  <SelectItem value="paid">Betaald</SelectItem>
                  <SelectItem value="overdue">Vervallen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveEdit}>
              Wijzigingen Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Factuur Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je factuur <strong>{selectedInvoice?.invoiceNumber}</strong> wilt verwijderen? 
              Deze actie kan niet ongedaan gemaakt worden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
