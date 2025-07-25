
'use client';

import React from 'react';
import { ApprovalDashboard } from '@/components/admin/approval-dashboard';

export default function AdminApprovalsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Goedkeuringen</h1>
          <p className="text-gray-600 mt-2">
            Beheer klant registraties en onboarding goedkeuringen
          </p>
        </div>
        
        <ApprovalDashboard />
      </div>
    </div>
  );
}
