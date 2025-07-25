
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EnhancedInvoiceWizard from '@/components/forms/enhanced-invoice-wizard';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/lib/types';

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/clients?canCreateInvoices=true&limit=100');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      } else {
        throw new Error('Failed to load clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon klanten niet laden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceCreated = (invoice: any) => {
    toast({
      title: "Factuur aangemaakt",
      description: `Factuur ${invoice.invoiceNumber} is succesvol aangemaakt.`,
    });
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const handleCancel = () => {
    router.push('/dashboard/invoices');
  };

  const handleBack = () => {
    router.push('/dashboard/invoices');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Facturen
          </Button>
        </div>
        <div className="text-center py-8">Klanten laden...</div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Facturen
          </Button>
        </div>
        
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Geen gevalideerde klanten</h2>
          <p className="text-muted-foreground mb-4">
            Je hebt nog geen klanten die gevalideerd en goedgekeurd zijn voor facturatie.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push('/dashboard/clients/new')}>
              Nieuwe Klant Toevoegen
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Terug naar Facturen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Terug naar Facturen
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nieuwe Factuur</h1>
          <p className="text-muted-foreground">
            Maak een nieuwe factuur aan met de verbeterde wizard
          </p>
        </div>
      </div>

      <EnhancedInvoiceWizard
        clients={clients}
        onSuccess={handleInvoiceCreated}
        onCancel={handleCancel}
      />
    </div>
  );
}
