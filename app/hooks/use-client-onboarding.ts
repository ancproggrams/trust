
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClientFormData, WorkflowState } from '@/lib/types';

interface UseClientOnboardingReturn {
  isSubmitting: boolean;
  error: string | null;
  workflowState: WorkflowState | null;
  submitOnboarding: (data: ClientFormData) => Promise<void>;
  updateWorkflowStep: (clientId: string, step: string, validationResults?: any) => Promise<void>;
  clearError: () => void;
}

export function useClientOnboarding(): UseClientOnboardingReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const router = useRouter();

  const submitOnboarding = useCallback(async (data: ClientFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // First create the client
      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(errorData.error || 'Failed to create client');
      }

      const { client } = await clientResponse.json();

      // Then process the workflow to trigger email confirmation
      await updateWorkflowStep(client.id, 'VERIFICATION', {
        kvk: data.kvkValidation?.result,
        btw: data.btwValidation?.result,
      });

      // Redirect to confirmation page
      router.push(`/onboarding/confirmation?clientId=${client.id}`);

    } catch (err) {
      console.error('Onboarding submission error:', err);
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  const updateWorkflowStep = useCallback(async (
    clientId: string, 
    step: string, 
    validationResults?: any
  ) => {
    try {
      const response = await fetch('/api/clients/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          step,
          validationResults,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update workflow');
      }

      const { workflowState: newState } = await response.json();
      setWorkflowState(newState);

    } catch (err) {
      console.error('Workflow update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSubmitting,
    error,
    workflowState,
    submitOnboarding,
    updateWorkflowStep,
    clearError,
  };
}
