
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  Edit2, 
  MoreHorizontal,
  Calendar,
  Euro,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Invoice, Client, InvoiceStatus } from '@/lib/types';
import InvoiceCalculationService from '@/lib/services/invoice-calculation';

interface EnhancedInvoiceListProps {
  showCreateButton?: boolean;
  clientId?: string; // Filter by specific client
  limit?: number;
  onCreateInvoice?: () => void;
  onSelectInvoice?: (invoice: Invoice) => void;
}

export default function EnhancedInvoiceList({ 
  showCreateButton = true,
  clientId,
  limit,
  onCreateInvoice,
  onSelectInvoice 
}: EnhancedInvoiceListProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>(clientId || 'all');
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const pageLimit = limit || 10;

  // Statistics
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });

  useEffect(() => {
    loadInvoices();
    if (!clientId) {
      loadClients();
    }
  }, [currentPage, statusFilter, clientFilter, sortBy, searchQuery, clientId]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
      });

      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (clientFilter !== 'all') params.set('clientId', clientFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (sortBy) params.set('sort', sortBy);

      const response = await fetch(`/api/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalInvoices(data.pagination?.total || 0);
        
        // Calculate stats
        calculateStats(data.invoices || []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon facturen niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients?limit=100');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const calculateStats = (invoiceList: Invoice[]) => {
    const stats = {
      totalInvoices: invoiceList.length,
      totalRevenue: invoiceList.reduce((sum, inv) => sum + inv.totalAmount, 0),
      pendingInvoices: invoiceList.filter(inv => ['SENT', 'DRAFT'].includes(inv.status)).length,
      overdueInvoices: invoiceList.filter(inv => 
        inv.status !== 'PAID' && InvoiceCalculationService.isOverdue(new Date(inv.dueDate))
      ).length,
    };
    setStats(stats);
  };

  const handleCreateInvoice = () => {
    if (onCreateInvoice) {
      onCreateInvoice();
    } else {
      router.push('/dashboard/invoices/new');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    if (onSelectInvoice) {
      onSelectInvoice(invoice);
    } else {
      router.push(`/dashboard/invoices/${invoice.id}`);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}/edit`);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      if (invoice.pdfPath) {
        window.open(`/api/files${invoice.pdfPath}`, '_blank');
      } else {
        // Generate PDF first
        const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ regenerate: false }),
        });

        const data = await response.json();
        if (response.ok && data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
          loadInvoices(); // Reload to update PDF status
        } else {
          throw new Error(data.error || 'Failed to generate PDF');
        }
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Fout bij PDF download",
        description: "Kon PDF niet downloaden of genereren.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = (invoice: Invoice) => {
    router.push(`/dashboard/invoices/${invoice.id}?action=send-email`);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedInvoices.length === 0) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst facturen om een actie uit te voeren.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Implement bulk actions
      const response = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          invoiceIds: selectedInvoices,
        }),
      });

      if (response.ok) {
        toast({
          title: "Actie uitgevoerd",
          description: `Bulk actie '${action}' succesvol uitgevoerd op ${selectedInvoices.length} facturen.`,
        });
        setSelectedInvoices([]);
        loadInvoices();
      } else {
        throw new Error('Failed to perform bulk action');
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

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id));
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    const icons = {
      DRAFT: Edit2,
      SENT: Send,
      PAID: CheckCircle,
      OVERDUE: AlertCircle,
      CANCELLED: XCircle,
    };
    return icons[status] || FileText;
  };

  const getStatusColor = (status: InvoiceStatus) => {
    const colors = {
      DRAFT: 'text-gray-500',
      SENT: 'text-blue-500',
      PAID: 'text-green-500',
      OVERDUE: 'text-red-500',
      CANCELLED: 'text-gray-400',
    };
    return colors[status] || 'text-gray-500';
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
      {/* Stats Cards */}
      {!clientId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                  <div className="text-sm text-muted-foreground">Totaal Facturen</div>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {InvoiceCalculationService.formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="text-sm text-muted-foreground">Totale Omzet</div>
                </div>
                <Euro className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
                  <div className="text-sm text-muted-foreground">Openstaand</div>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.overdueInvoices}</div>
                  <div className="text-sm text-muted-foreground">Achterstallig</div>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Facturen</CardTitle>
            {showCreateButton && (
              <Button onClick={handleCreateInvoice}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Factuur
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek facturen op nummer, beschrijving of klant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter op status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="DRAFT">Concept</SelectItem>
                <SelectItem value="SENT">Verzonden</SelectItem>
                <SelectItem value="PAID">Betaald</SelectItem>
                <SelectItem value="OVERDUE">Achterstallig</SelectItem>
                <SelectItem value="CANCELLED">Geannuleerd</SelectItem>
              </SelectContent>
            </Select>

            {!clientId && (
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter op klant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle klanten</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sorteer op" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt_desc">Nieuwste eerst</SelectItem>
                <SelectItem value="createdAt_asc">Oudste eerst</SelectItem>
                <SelectItem value="dueDate_asc">Vervaldatum (vroegste)</SelectItem>
                <SelectItem value="dueDate_desc">Vervaldatum (laatste)</SelectItem>
                <SelectItem value="totalAmount_desc">Bedrag (hoog naar laag)</SelectItem>
                <SelectItem value="totalAmount_asc">Bedrag (laag naar hoog)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedInvoices.length} facturen geselecteerd
              </span>
              <Separator orientation="vertical" className="h-4" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Bulk Acties
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('markAsSent')}>
                    Markeer als verzonden
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('markAsPaid')}>
                    Markeer als betaald
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('generatePDF')}>
                    PDF's genereren
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('sendReminders')}>
                    Herinneringen versturen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedInvoices([])}
              >
                Deselecteer Alles
              </Button>
            </div>
          )}

          {/* Invoice List */}
          <div className="space-y-4">
            {/* Select All Header */}
            <div className="flex items-center space-x-2 py-2 border-b">
              <input
                type="checkbox"
                checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                onChange={toggleAllSelection}
                className="rounded"
              />
              <span className="text-sm font-medium">
                Selecteer alle ({invoices.length})
              </span>
            </div>

            {invoices.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Geen facturen gevonden. {showCreateButton && "Maak je eerste factuur aan om te beginnen."}
                </AlertDescription>
              </Alert>
            ) : (
              invoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  isSelected={selectedInvoices.includes(invoice.id)}
                  onToggleSelect={() => toggleInvoiceSelection(invoice.id)}
                  onView={() => handleViewInvoice(invoice)}
                  onEdit={() => handleEditInvoice(invoice)}
                  onDownloadPDF={() => handleDownloadPDF(invoice)}
                  onSendEmail={() => handleSendEmail(invoice)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Pagina {currentPage} van {totalPages} ({totalInvoices} totaal)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Volgende
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Invoice Card Component
interface InvoiceCardProps {
  invoice: Invoice;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDownloadPDF: () => void;
  onSendEmail: () => void;
}

function InvoiceCard({ 
  invoice, 
  isSelected, 
  onToggleSelect, 
  onView, 
  onEdit, 
  onDownloadPDF, 
  onSendEmail 
}: InvoiceCardProps) {
  const StatusIcon = getStatusIcon(invoice.status);
  const statusColor = getStatusColor(invoice.status);
  const isOverdue = invoice.status !== 'PAID' && InvoiceCalculationService.isOverdue(new Date(invoice.dueDate));
  const overdueDays = isOverdue ? InvoiceCalculationService.getOverdueDays(new Date(invoice.dueDate)) : 0;

  return (
    <Card className={`transition-colors cursor-pointer hover:bg-gray-50 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 rounded"
            />
            
            <div className="flex-1 min-w-0" onClick={onView}>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                <StatusBadge status={invoice.status} />
                {isOverdue && (
                  <Badge variant="destructive">
                    {overdueDays} dagen te laat
                  </Badge>
                )}
                {invoice.pdfGenerated && (
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </Badge>
                )}
                {invoice.emailSent && (
                  <Badge variant="outline">
                    <Send className="h-3 w-3 mr-1" />
                    Verzonden
                  </Badge>
                )}
              </div>

              {invoice.title && (
                <p className="text-gray-600 mb-2">{invoice.title}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{invoice.client.name}</span>
                  </div>
                  {invoice.client.company && (
                    <div className="text-gray-500 ml-6">{invoice.client.company}</div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Vervaldatum: {new Date(invoice.dueDate).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="text-gray-500 ml-6">
                    Aangemaakt: {new Date(invoice.createdAt).toLocaleDateString('nl-NL')}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-400" />
                    <span className="font-bold text-lg">
                      {InvoiceCalculationService.formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <div className="text-green-600 ml-6">
                      Betaald: {InvoiceCalculationService.formatCurrency(invoice.paidAmount)}
                    </div>
                  )}
                </div>
              </div>

              {invoice.description && (
                <p className="text-gray-600 mt-2 line-clamp-2">{invoice.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Bewerken
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  {invoice.pdfGenerated ? 'Download PDF' : 'Genereer PDF'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSendEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Email Versturen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const variants: Record<InvoiceStatus, { variant: any; label: string }> = {
    DRAFT: { variant: 'secondary', label: 'Concept' },
    SENT: { variant: 'default', label: 'Verzonden' },
    PAID: { variant: 'default', label: 'Betaald' },
    OVERDUE: { variant: 'destructive', label: 'Achterstallig' },
    CANCELLED: { variant: 'outline', label: 'Geannuleerd' },
  };

  const { variant, label } = variants[status] || variants.DRAFT;

  return <Badge variant={variant as any}>{label}</Badge>;
}

function getStatusIcon(status: InvoiceStatus) {
  const icons = {
    DRAFT: Edit2,
    SENT: Send,
    PAID: CheckCircle,
    OVERDUE: AlertCircle,
    CANCELLED: XCircle,
  };
  return icons[status] || FileText;
}

function getStatusColor(status: InvoiceStatus) {
  const colors = {
    DRAFT: 'text-gray-500',
    SENT: 'text-blue-500',
    PAID: 'text-green-500',
    OVERDUE: 'text-red-500',
    CANCELLED: 'text-gray-400',
  };
  return colors[status] || 'text-gray-500';
}
