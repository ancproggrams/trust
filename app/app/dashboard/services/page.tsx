
'use client';

import React from 'react';
import StandardServicesManager from '@/components/forms/standard-services-manager';

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Standaarddiensten</h1>
        <p className="text-muted-foreground">
          Beheer je standaarddiensten en tarieven voor snelle factuurcreatie
        </p>
      </div>

      <StandardServicesManager />
    </div>
  );
}
