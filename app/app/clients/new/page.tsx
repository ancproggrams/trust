
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClientOnboardingWizard } from '@/components/forms/client-onboarding-wizard';
import { useClientOnboarding } from '@/hooks/use-client-onboarding';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ClientFormData } from '@/lib/types';

export default function NewClientPage() {
  const router = useRouter();
  const { submitOnboarding, isSubmitting, error, clearError } = useClientOnboarding();

  const handleOnboardingComplete = async (data: ClientFormData) => {
    try {
      await submitOnboarding(data);
      // Redirect is handled in the hook
    } catch (err) {
      // Error is handled in the hook
      console.error('Onboarding error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
              <button 
                onClick={clearError}
                className="ml-2 text-red-600 hover:text-red-800 underline"
              >
                Sluiten
              </button>
            </AlertDescription>
          </Alert>
        )}

        <ClientOnboardingWizard
          onComplete={handleOnboardingComplete}
          onStepChange={(step, data) => {
            console.log('Step changed:', step, data);
          }}
        />
      </div>
    </div>
  );
}
