
'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Building2, 
  Mail, 
  Phone,
  Users
} from 'lucide-react';
import { mockClients } from '@/lib/mock-data';
import { Client } from '@/lib/types';
import { formatCurrency, formatDate, generateId, getInitials } from '@/lib/utils';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients as Client[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    });
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company || '',
      address: client.address || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.name || !formData.email) {
      alert('Naam en email zijn verplicht');
      return;
    }

    const newClient: Partial<Client> = {
      id: generateId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      address: formData.address || undefined,
      createdAt: new Date(),
      totalInvoiced: 0,
    };

    setClients([...clients, newClient as Client]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleSaveEdit = () => {
    if (!selectedClient || !formData.name || !formData.email) {
      alert('Naam en email zijn verplicht');
      return;
    }

    const updatedClients = clients.map(client =>
      client.id === selectedClient.id
        ? {
            ...client,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company || undefined,
            address: formData.address || undefined,
          }
        : client
    );

    setClients(updatedClients);
    setIsEditDialogOpen(false);
    setSelectedClient(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!selectedClient) return;

    const updatedClients = clients.filter(client => client.id !== selectedClient.id);
    setClients(updatedClients);
    setIsDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="space-y-8">
      <Header 
        title="Klanten" 
        description={`Beheer je ${clients.length} klanten en hun informatie`}
      />
      
      <div className="px-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek klanten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAdd} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Klant
          </Button>
        </div>

        {/* Clients Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klant</TableHead>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Totaal Gefactureerd</TableHead>
                    <TableHead>Toegevoegd</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {client.company ? (
                            <>
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{client.company}</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Geen bedrijf</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(client.totalInvoiced)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(client.createdAt)}
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
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(client)}
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
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Geen klanten gevonden' : 'Nog geen klanten'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Probeer een andere zoekterm'
                    : 'Voeg je eerste klant toe om te beginnen'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Eerste Klant Toevoegen
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuwe Klant Toevoegen</DialogTitle>
            <DialogDescription>
              Voeg een nieuwe klant toe aan je database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Naam *</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jan Janssen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">E-mail *</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jan@voorbeeld.nl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Telefoon</Label>
              <Input
                id="add-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+31 6 12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-company">Bedrijf</Label>
              <Input
                id="add-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-address">Adres</Label>
              <Input
                id="add-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Hoofdstraat 123, 1000 AB Amsterdam"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveAdd}>
              Klant Toevoegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Klant Bewerken</DialogTitle>
            <DialogDescription>
              Bewerk de gegevens van {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Naam *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jan Janssen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jan@voorbeeld.nl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefoon</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+31 6 12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Bedrijf</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Adres</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Hoofdstraat 123, 1000 AB Amsterdam"
              />
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
            <AlertDialogTitle>Klant Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je <strong>{selectedClient?.name}</strong> wilt verwijderen? 
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
