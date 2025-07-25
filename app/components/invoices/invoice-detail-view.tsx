
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  Send, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar, 
  Clock, 
  Euro, 
  User, 
  Building, 
  Mail,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Invoice, InvoiceEmailLog, InvoiceStatus, InvoiceEmailType } from '@/lib/types';
import InvoiceCalculationService from '@/lib/services/invoice-calculation';

interface InvoiceDetailViewProps {
  invoiceId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function InvoiceDetailView({ 
  invoiceId, 
  onEdit, 
  onDelete, 
  showActions = true 
}: InvoiceDetailViewProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [emailLogs, setEmailLogs] = useState<InvoiceEmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    recipient: '',
    subject: '',
    message: '',
    emailType: 'INVOICE_SENT' as InvoiceEmailType,
    includePDF: true,
    sendToClient: true,
  });

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
      loadEmailHistory();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        
        // Set default email recipient
        if (data.invoice?.client?.email) {
          setEmailForm(prev => ({
            ...prev,
            recipient: data.invoice.client.email,
            subject: `Factuur ${data.invoice.invoiceNumber}`,
          }));
        }
      } else {
        throw new Error('Invoice not found');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon factuur niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmailHistory = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/email`);
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data.emailLogs || []);
      }
    } catch (error) {
      console.error('Error loading email history:', error);
    }
  };

  const generatePDF = async (regenerate = false) => {
    setPdfGenerating(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "PDF gegenereerd",
          description: "De factuur PDF is succesvol gegenereerd.",
        });
        
        // Auto-download the PDF
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        }
        
        // Reload invoice to get updated PDF status
        loadInvoice();
      } else {
        throw new Error(data.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Fout bij PDF generatie",
        description: "Er is een fout opgetreden bij het genereren van de PDF.",
        variant: "destructive",
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (invoice?.pdfPath) {
      window.open(`/api/files${invoice.pdfPath}`, '_blank');
    } else {
      // Generate PDF first
      await generatePDF();
    }
  };

  const sendEmail = async () => {
    setEmailSending(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Email verzonden",
          description: `Factuur email is succesvol verzonden naar ${emailForm.recipient}.`,
        });
        
        setShowEmailDialog(false);
        loadInvoice();
        loadEmailHistory();
      } else {
        if (data.requiresPDF) {
          // Need to generate PDF first
          toast({
            title: "PDF vereist",
            description: "Genereer eerst een PDF voordat je de factuur kunt versturen.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error || 'Failed to send email');
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Fout bij versturen",
        description: "Er is een fout opgetreden bij het versturen van de email.",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  };

  const updateInvoiceStatus = async (newStatus: InvoiceStatus) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Status bijgewerkt",
          description: `Factuurstatus is gewijzigd naar ${getStatusLabel(newStatus)}.`,
        });
        loadInvoice();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon factuurstatus niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const deleteInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Factuur verwijderd",
          description: "De factuur is succesvol verwijderd.",
        });
        
        if (onDelete) {
          onDelete();
        } else {
          router.push('/dashboard/invoices');
        }
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon factuur niet verwijderen.",
        variant: "destructive",
      });
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

  if (!invoice) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Factuur niet gevonden.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            {invoice.title || `Factuur ${invoice.invoiceNumber}`}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge status={invoice.status} />
            <PaymentStatusBadge status={invoice.paymentStatus} />
            {InvoiceCalculationService.isOverdue(new Date(invoice.dueDate)) && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                {InvoiceCalculationService.getOverdueDays(new Date(invoice.dueDate))} dagen te laat
              </Badge>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadPDF} disabled={pdfGenerating}>
              {pdfGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {invoice.pdfGenerated ? 'Download PDF' : 'Genereer PDF'}
            </Button>

            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Verstuur Email
                </Button>
              </DialogTrigger>
              <EmailDialog
                invoice={invoice}
                emailForm={emailForm}
                setEmailForm={setEmailForm}
                onSend={sendEmail}
                sending={emailSending}
                onCancel={() => setShowEmailDialog(false)}
              />
            </Dialog>

            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            )}

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Verwijderen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Factuur verwijderen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Weet je zeker dat je deze factuur wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Annuleren
                    </Button>
                    <Button variant="destructive" onClick={deleteInvoice}>
                      Verwijderen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Invoice Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Factuurgegevens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Factuurnummer</div>
                    <div className="font-mono">{invoice.invoiceNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Factuurdatum</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(invoice.issueDate).toLocaleDateString('nl-NL')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Vervaldatum</div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(invoice.dueDate).toLocaleDateString('nl-NL')}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="flex gap-2">
                      <StatusBadge status={invoice.status} />
                      {invoice.status === 'DRAFT' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateInvoiceStatus('SENT')}
                        >
                          Markeer als Verzonden
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Betaalstatus</div>
                    <PaymentStatusBadge status={invoice.paymentStatus} />
                  </div>
                  {invoice.paymentStatus === 'COMPLETED' && invoice.paidAt && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Betaald op</div>
                      <div>{new Date(invoice.paidAt).toLocaleDateString('nl-NL')}</div>
                    </div>
                  )}
                </div>
              </div>

              {invoice.description && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Omschrijving</div>
                    <p>{invoice.description}</p>
                  </div>
                </>
              )}

              {invoice.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Opmerkingen</div>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Factuurregels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium">Omschrijving</th>
                      <th className="text-right py-3 font-medium">Aantal</th>
                      <th className="text-right py-3 font-medium">Tarief</th>
                      <th className="text-right py-3 font-medium">Bedrag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{item.description}</div>
                            {item.notes && (
                              <div className="text-sm text-muted-foreground">{item.notes}</div>
                            )}
                            {item.standardService && (
                              <Badge variant="outline" className="mt-1">
                                {item.standardService.name}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3">
                          {InvoiceCalculationService.formatQuantity(item.quantity, item.unitType)}
                        </td>
                        <td className="text-right py-3">
                          {InvoiceCalculationService.formatCurrency(item.rate)}
                        </td>
                        <td className="text-right py-3 font-medium">
                          {InvoiceCalculationService.formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotaal:</span>
                    <span>{InvoiceCalculationService.formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BTW ({invoice.btwRate}%):</span>
                    <span>{InvoiceCalculationService.formatCurrency(invoice.btwAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Totaal:</span>
                    <span>{InvoiceCalculationService.formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Betaald:</span>
                        <span>-{InvoiceCalculationService.formatCurrency(invoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Openstaand:</span>
                        <span>{InvoiceCalculationService.formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email History */}
          {emailLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Email Geschiedenis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emailLogs.map((log, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{log.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          Naar: {log.recipient} • {getEmailTypeLabel(log.emailType)}
                        </div>
                      </div>
                      <div className="text-right">
                        <EmailStatusBadge status={log.status} />
                        <div className="text-sm text-muted-foreground">
                          {log.sentAt && new Date(log.sentAt).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Klantgegevens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium">{invoice.client.name}</div>
                {invoice.client.company && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {invoice.client.company}
                  </div>
                )}
              </div>

              {invoice.client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${invoice.client.email}`} className="text-blue-600 hover:underline">
                    {invoice.client.email}
                  </a>
                </div>
              )}

              {invoice.client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3" />
                  <a href={`tel:${invoice.client.phone}`} className="text-blue-600 hover:underline">
                    {invoice.client.phone}
                  </a>
                </div>
              )}

              {invoice.client.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-3 w-3 mt-0.5" />
                  <div>
                    <div>{invoice.client.address}</div>
                    <div>{invoice.client.postalCode} {invoice.client.city}</div>
                    {invoice.client.country && <div>{invoice.client.country}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Betalingsinfo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Totaalbedrag:</span>
                <span className="font-medium">{InvoiceCalculationService.formatCurrency(invoice.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Betaald:</span>
                <span className="font-medium text-green-600">
                  {InvoiceCalculationService.formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm">Openstaand:</span>
                <span className="font-medium">
                  {InvoiceCalculationService.formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="text-sm">Dagen tot vervaldatum:</span>
                <span className={`font-medium ${
                  InvoiceCalculationService.isOverdue(new Date(invoice.dueDate)) 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {InvoiceCalculationService.isOverdue(new Date(invoice.dueDate))
                    ? `-${InvoiceCalculationService.getOverdueDays(new Date(invoice.dueDate))}`
                    : InvoiceCalculationService.daysBetween(new Date(), new Date(invoice.dueDate))
                  }
                </span>
              </div>

              {invoice.paymentStatus === 'PENDING' && (
                <Button 
                  className="w-full mt-4" 
                  onClick={() => updateInvoiceStatus('PAID')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Markeer als Betaald
                </Button>
              )}
            </CardContent>
          </Card>

          {/* PDF Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.pdfGenerated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    PDF beschikbaar
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gegenereerd: {invoice.pdfGeneratedAt && new Date(invoice.pdfGeneratedAt).toLocaleDateString('nl-NL')}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadPDF}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => generatePDF(true)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Regenereer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    Geen PDF beschikbaar
                  </div>
                  <Button variant="outline" size="sm" onClick={() => generatePDF()}>
                    <FileText className="h-3 w-3 mr-1" />
                    Genereer PDF
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const variants: Record<InvoiceStatus, { variant: any; label: string; icon: any }> = {
    DRAFT: { variant: 'secondary', label: 'Concept', icon: Edit2 },
    SENT: { variant: 'default', label: 'Verzonden', icon: Send },
    PAID: { variant: 'success', label: 'Betaald', icon: CheckCircle },
    OVERDUE: { variant: 'destructive', label: 'Achterstallig', icon: AlertCircle },
    CANCELLED: { variant: 'outline', label: 'Geannuleerd', icon: XCircle },
  };

  const { variant, label, icon: Icon } = variants[status] || variants.DRAFT;

  return (
    <Badge variant={variant as any} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'secondary', label: 'In afwachting' },
    PROCESSING: { variant: 'default', label: 'Verwerking' },
    COMPLETED: { variant: 'success', label: 'Voltooid' },
    FAILED: { variant: 'destructive', label: 'Mislukt' },
    CANCELLED: { variant: 'outline', label: 'Geannuleerd' },
  };

  const { variant, label } = variants[status] || variants.PENDING;

  return <Badge variant={variant as any}>{label}</Badge>;
}

function EmailStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'secondary', label: 'In wachtrij' },
    QUEUED: { variant: 'default', label: 'In wachtrij' },
    SENT: { variant: 'success', label: 'Verzonden' },
    DELIVERED: { variant: 'success', label: 'Afgeleverd' },
    OPENED: { variant: 'success', label: 'Geopend' },
    CLICKED: { variant: 'success', label: 'Geklikt' },
    FAILED: { variant: 'destructive', label: 'Mislukt' },
    BOUNCED: { variant: 'destructive', label: 'Gebounced' },
    SPAM: { variant: 'destructive', label: 'Spam' },
  };

  const { variant, label } = variants[status] || variants.PENDING;

  return <Badge variant={variant as any} className="text-xs">{label}</Badge>;
}

function getStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    DRAFT: 'Concept',
    SENT: 'Verzonden',
    PAID: 'Betaald',
    OVERDUE: 'Achterstallig',
    CANCELLED: 'Geannuleerd',
  };
  return labels[status] || status;
}

function getEmailTypeLabel(type: InvoiceEmailType): string {
  const labels: Record<InvoiceEmailType, string> = {
    INVOICE_SENT: 'Factuur verzonden',
    REMINDER_SENT: 'Herinnering',
    FINAL_NOTICE: 'Laatste waarschuwing',
    PAYMENT_RECEIVED: 'Betaling ontvangen',
    INVOICE_CANCELLED: 'Factuur geannuleerd',
  };
  return labels[type] || type;
}

// Email Dialog Component
interface EmailDialogProps {
  invoice: Invoice;
  emailForm: any;
  setEmailForm: (form: any) => void;
  onSend: () => void;
  sending: boolean;
  onCancel: () => void;
}

function EmailDialog({ 
  invoice, 
  emailForm, 
  setEmailForm, 
  onSend, 
  sending, 
  onCancel 
}: EmailDialogProps) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Email Verzenden</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Ontvanger *</Label>
          <Input
            id="recipient"
            type="email"
            value={emailForm.recipient}
            onChange={(e) => setEmailForm({ ...emailForm, recipient: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailType">Email Type</Label>
          <Select 
            value={emailForm.emailType} 
            onValueChange={(value: InvoiceEmailType) => setEmailForm({ ...emailForm, emailType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INVOICE_SENT">Factuur verzonden</SelectItem>
              <SelectItem value="REMINDER_SENT">Herinnering</SelectItem>
              <SelectItem value="FINAL_NOTICE">Laatste waarschuwing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Onderwerp *</Label>
          <Input
            id="subject"
            value={emailForm.subject}
            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
            placeholder="Factuur onderwerp"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Bericht *</Label>
          <Textarea
            id="message"
            value={emailForm.message}
            onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
            placeholder="Voeg een persoonlijk bericht toe..."
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includePDF"
            checked={emailForm.includePDF}
            onChange={(e) => setEmailForm({ ...emailForm, includePDF: e.target.checked })}
          />
          <Label htmlFor="includePDF">PDF bijvoegen</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Annuleren
          </Button>
          <Button onClick={onSend} disabled={sending || !emailForm.recipient || !emailForm.subject || !emailForm.message}>
            {sending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verzenden...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Verzenden
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
