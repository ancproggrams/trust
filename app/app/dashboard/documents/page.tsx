
'use client';

import { useState, useEffect } from 'react';
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
  FileText,
  Download,
  Send,
  PenTool,
  Eye,
  Upload,
  FileCheck,
  Clock,
  AlertCircle
} from 'lucide-react';
// LEGACY REMOVED: Mock data imports replaced by API calls
import { Document } from '@/lib/types';
import { 
  formatDate, 
  generateId, 
  getDocumentStatusColor,
  translateStatus,
  getInitials 
} from '@/lib/utils';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch documents
        const docsResponse = await fetch('/api/documents');
        if (docsResponse.ok) {
          const docsData = await docsResponse.json();
          setDocuments(docsData.documents || []);
        }

        // Fetch clients
        const clientsResponse = await fetch('/api/clients');
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          setClients(clientsData.clients || []);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    type: 'contract' as Document['type'],
    content: '',
  });

  // Filter documents based on search term, type, and status
  const filteredDocuments = documents.filter(document => {
    const matchesSearch = 
      document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || document.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sort documents by creation date
  const sortedDocuments = filteredDocuments.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      type: 'contract',
      content: '',
    });
  };

  const handleAdd = () => {
    setIsAddDialogOpen(true);
    resetForm();
  };

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setFormData({
      clientId: document.clientId || '',
      title: document.title,
      description: document.description || '',
      type: document.type,
      content: document.content || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.title || !formData.type) {
      alert('Vul alle verplichte velden in');
      return;
    }

    let client: typeof clients[0] | undefined = undefined;
    if (formData.clientId) {
      client = clients.find(c => c.id === formData.clientId);
    }

    const newDocument: Document = {
      id: generateId(),
      clientId: formData.clientId || undefined,
      clientName: client?.name || undefined,
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
      status: 'draft',
      createdAt: new Date(),
      content: formData.content || undefined,
    };

    setDocuments([...documents, newDocument]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleSaveEdit = () => {
    if (!selectedDocument || !formData.title || !formData.type) {
      alert('Vul alle verplichte velden in');
      return;
    }

    let client: typeof clients[0] | undefined = undefined;
    if (formData.clientId) {
      client = clients.find(c => c.id === formData.clientId);
    }

    const updatedDocuments = documents.map(document =>
      document.id === selectedDocument.id
        ? {
            ...document,
            clientId: formData.clientId || undefined,
            clientName: client?.name || undefined,
            title: formData.title,
            description: formData.description || undefined,
            type: formData.type,
            content: formData.content || undefined,
          }
        : document
    );

    setDocuments(updatedDocuments);
    setIsEditDialogOpen(false);
    setSelectedDocument(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!selectedDocument) return;

    const updatedDocuments = documents.filter(document => document.id !== selectedDocument.id);
    setDocuments(updatedDocuments);
    setIsDeleteDialogOpen(false);
    setSelectedDocument(null);
  };

  const handleStatusChange = (document: Document, newStatus: Document['status']) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === document.id ? { ...doc, status: newStatus } : doc
    );
    setDocuments(updatedDocuments);
  };

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'contract':
        return FileText;
      case 'invoice':
        return FileCheck;
      case 'agreement':
        return PenTool;
      default:
        return FileText;
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return FileCheck;
      case 'pending_signature':
        return Clock;
      case 'draft':
        return Edit;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-8">
      <Header 
        title="Documenten" 
        description={`Beheer je ${documents.length} documenten en contracten`}
      />
      
      <div className="px-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek documenten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter op type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem>
              <SelectItem value="contract">Contracten</SelectItem>
              <SelectItem value="invoice">Facturen</SelectItem>
              <SelectItem value="agreement">Overeenkomsten</SelectItem>
              <SelectItem value="other">Overige</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter op status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle statussen</SelectItem>
              <SelectItem value="draft">Concept</SelectItem>
              <SelectItem value="pending_signature">Wacht op handtekening</SelectItem>
              <SelectItem value="signed">Ondertekend</SelectItem>
              <SelectItem value="completed">Voltooid</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Document
          </Button>
        </div>

        {/* Documents Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {sortedDocuments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Klant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aangemaakt</TableHead>
                    <TableHead>Ondertekend</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((document) => {
                    const TypeIcon = getTypeIcon(document.type);
                    const StatusIcon = getStatusIcon(document.status);
                    
                    return (
                      <TableRow key={document.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {document.title}
                              </div>
                              {document.description && (
                                <div className="text-sm text-muted-foreground truncate max-w-48">
                                  {document.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {document.clientName ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {getInitials(document.clientName)}
                              </div>
                              <div className="font-medium">{document.clientName}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Geen klant</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {document.type === 'contract' && 'Contract'}
                            {document.type === 'invoice' && 'Factuur'}
                            {document.type === 'agreement' && 'Overeenkomst'}
                            {document.type === 'other' && 'Overig'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge
                              variant="secondary"
                              className={getDocumentStatusColor(document.status)}
                            >
                              {translateStatus(document.status, 'document')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(document.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {document.signedAt ? (
                            <span className="text-sm text-green-600">
                              {formatDate(document.signedAt)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Niet ondertekend
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/documents/${document.id}/sign`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Bekijken
                                </Link>
                              </DropdownMenuItem>
                              {document.status === 'draft' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(document, 'pending_signature')}
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Versturen voor handtekening
                                </DropdownMenuItem>
                              )}
                              {(document.status === 'pending_signature' || document.status === 'draft') && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/documents/${document.id}/sign`}>
                                    <PenTool className="mr-2 h-4 w-4" />
                                    Ondertekenen
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(document)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Bewerken
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(document)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Geen documenten gevonden' 
                    : 'Nog geen documenten'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Probeer je zoekfilters aan te passen'
                    : 'Upload of maak je eerste document om te beginnen'
                  }
                </p>
                {!searchTerm && typeFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Eerste Document Maken
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Document Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuw Document Maken</DialogTitle>
            <DialogDescription>
              Maak een nieuw document of contract
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-title">Titel *</Label>
              <Input
                id="add-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Website Development Contract"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: Document['type']) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Factuur</SelectItem>
                  <SelectItem value="agreement">Overeenkomst</SelectItem>
                  <SelectItem value="other">Overig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-client">Klant (optioneel)</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant (optioneel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen klant</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Beschrijving</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Korte beschrijving van het document..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-content">Inhoud</Label>
              <Textarea
                id="add-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="De volledige inhoud van het document..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleSaveAdd}>
              Document Maken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Bewerken</DialogTitle>
            <DialogDescription>
              Bewerk de details van dit document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Website Development Contract"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select value={formData.type} onValueChange={(value: Document['type']) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="invoice">Factuur</SelectItem>
                  <SelectItem value="agreement">Overeenkomst</SelectItem>
                  <SelectItem value="other">Overig</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-client">Klant (optioneel)</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een klant (optioneel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen klant</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beschrijving</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Korte beschrijving van het document..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Inhoud</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="De volledige inhoud van het document..."
                rows={4}
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
            <AlertDialogTitle>Document Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je het document <strong>{selectedDocument?.title}</strong> wilt verwijderen? 
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
