
'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedInvoiceList from '@/components/invoices/enhanced-invoice-list';
import EnhancedInvoiceWizard from '@/components/forms/enhanced-invoice-wizard';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/lib/types';

export default function InvoicesPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
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

  const handleCreateInvoice = async () => {
    await loadClients();
    setShowCreateDialog(true);
  };

  const handleInvoiceCreated = (invoice: any) => {
    setShowCreateDialog(false);
    toast({
      title: "Factuur aangemaakt",
      description: `Factuur ${invoice.invoiceNumber} is succesvol aangemaakt.`,
    });
    // The invoice list will automatically refresh
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Facturen</h1>
          <p className="text-muted-foreground">
            Beheer al je facturen en betalingen op één plek
          </p>
        </div>
      </div>

      <EnhancedInvoiceList 
        showCreateButton={true}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuwe Factuur Aanmaken</DialogTitle>
          </DialogHeader>
          
          {loadingClients ? (
            <div className="py-8 text-center">Klanten laden...</div>
          ) : clients.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Je hebt nog geen gevalideerde klanten die facturen kunnen ontvangen.
              </p>
              <Button onClick={() => setShowCreateDialog(false)}>
                Sluit
              </Button>
            </div>
          ) : (
            <EnhancedInvoiceWizard
              clients={clients}
              onSuccess={handleInvoiceCreated}
              onCancel={() => setShowCreateDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
