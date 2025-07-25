
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InvoiceDetailView from '@/components/invoices/invoice-detail-view';
import EnhancedInvoiceWizard from '@/components/forms/enhanced-invoice-wizard';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/lib/types';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const invoiceId = params.id as string;

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const loadClients = async () => {
    if (clients.length > 0) return; // Already loaded

    setLoadingClients(true);
    try {
      const response = await fetch('/api/clients?canCreateInvoices=true&limit=100');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon klanten niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoadingClients(false);
    }
  };

  const handleEdit = async () => {
    await loadClients();
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    // Navigate back to invoices list after deletion
    router.push('/dashboard/invoices');
  };

  const handleInvoiceUpdated = (invoice: any) => {
    setShowEditDialog(false);
    toast({
      title: "Factuur bijgewerkt",
      description: `Factuur ${invoice.invoiceNumber} is succesvol bijgewerkt.`,
    });
    // The detail view will automatically refresh
  };

  const handleBack = () => {
    router.push('/dashboard/invoices');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar Facturen
        </Button>
      </div>

      <InvoiceDetailView
        invoiceId={invoiceId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
      />

      {/* Edit Invoice Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Factuur Bewerken</DialogTitle>
          </DialogHeader>
          
          {loadingClients ? (
            <div className="py-8 text-center">Klanten laden...</div>
          ) : clients.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Kon klanten niet laden voor bewerking.
              </p>
              <Button onClick={() => setShowEditDialog(false)}>
                Sluit
              </Button>
            </div>
          ) : (
            <EnhancedInvoiceWizard
              clients={clients}
              onSuccess={handleInvoiceUpdated}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
