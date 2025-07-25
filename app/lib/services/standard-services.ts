
import { StandardService, StandardServiceFormData, InvoiceUnitType } from '@/lib/types';

export interface StandardServiceCategory {
  id: string;
  name: string;
  description?: string;
  services: StandardService[];
}

export class StandardServicesService {
  // Default service categories and templates
  static readonly DEFAULT_CATEGORIES = [
    'Ontwikkeling',
    'Design',
    'Consultancy',
    'Projectmanagement',
    'Marketing',
    'Administratie',
    'Anders'
  ];

  static readonly DEFAULT_SERVICES: Partial<StandardServiceFormData>[] = [
    {
      name: 'Webontwikkeling',
      description: 'Frontend en backend webdevelopment',
      category: 'Ontwikkeling',
      defaultRate: 75,
      unitType: 'HOURS' as InvoiceUnitType
    },
    {
      name: 'UI/UX Design',
      description: 'Gebruikersinterface en gebruikerservaring ontwerp',
      category: 'Design',
      defaultRate: 65,
      unitType: 'HOURS' as InvoiceUnitType
    },
    {
      name: 'Projectconsultancy',
      description: 'Strategisch advies en projectbegeleiding',
      category: 'Consultancy',
      defaultRate: 95,
      unitType: 'HOURS' as InvoiceUnitType
    },
    {
      name: 'Projectmanagement',
      description: 'Projectleiding en coördinatie',
      category: 'Projectmanagement',
      defaultRate: 85,
      unitType: 'HOURS' as InvoiceUnitType
    },
    {
      name: 'SEO Optimalisatie',
      description: 'Zoekmachine optimalisatie diensten',
      category: 'Marketing',
      defaultRate: 60,
      unitType: 'HOURS' as InvoiceUnitType
    },
    {
      name: 'Administratieve ondersteuning',
      description: 'Algemene administratieve werkzaamheden',
      category: 'Administratie',
      defaultRate: 35,
      unitType: 'HOURS' as InvoiceUnitType
    },
    {
      name: 'Reiskosten',
      description: 'Kilometervergoeding voor reizen',
      category: 'Anders',
      defaultRate: 0.19,
      unitType: 'KILOMETERS' as InvoiceUnitType
    },
    {
      name: 'Hosting & Domein',
      description: 'Maandelijkse hosting en domeinkosten',
      category: 'Anders',
      defaultRate: 15,
      unitType: 'AMOUNT' as InvoiceUnitType
    }
  ];

  // Validate service data
  static validateService(data: StandardServiceFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Servicenaam is verplicht');
    } else if (data.name.length > 100) {
      errors.push('Servicenaam mag maximaal 100 karakters bevatten');
    }

    if (data.description && data.description.length > 500) {
      errors.push('Beschrijving mag maximaal 500 karakters bevatten');
    }

    if (data.category && data.category.length > 50) {
      errors.push('Categorie mag maximaal 50 karakters bevatten');
    }

    if (data.defaultRate < 0) {
      errors.push('Standaardtarief moet 0 of hoger zijn');
    }

    if (data.defaultRate > 9999.99) {
      errors.push('Standaardtarief mag maximaal €9.999,99 zijn');
    }

    if (!data.unitType) {
      errors.push('Eenheidstype is verplicht');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Group services by category
  static groupByCategory(services: StandardService[]): StandardServiceCategory[] {
    const grouped = services.reduce((acc, service) => {
      const category = service.category || 'Anders';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    }, {} as Record<string, StandardService[]>);

    return Object.entries(grouped).map(([name, services]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      services: services.sort((a, b) => a.name.localeCompare(b.name))
    }));
  }

  // Get most used services
  static getMostUsedServices(services: StandardService[], limit: number = 5): StandardService[] {
    return services
      .filter(service => service.isActive)
      .sort((a, b) => b.timesUsed - a.timesUsed)
      .slice(0, limit);
  }

  // Get default services
  static getDefaultServices(services: StandardService[]): StandardService[] {
    return services.filter(service => service.isDefault && service.isActive);
  }

  // Search services
  static searchServices(services: StandardService[], query: string): StandardService[] {
    if (!query.trim()) return services;

    const searchTerm = query.toLowerCase().trim();
    return services.filter(service => 
      service.name.toLowerCase().includes(searchTerm) ||
      service.description?.toLowerCase().includes(searchTerm) ||
      service.category?.toLowerCase().includes(searchTerm)
    );
  }

  // Filter services by category
  static filterByCategory(services: StandardService[], category: string): StandardService[] {
    if (!category || category === 'all') return services;
    return services.filter(service => service.category === category);
  }

  // Filter active services
  static getActiveServices(services: StandardService[]): StandardService[] {
    return services.filter(service => service.isActive);
  }

  // Calculate service statistics
  static calculateStatistics(services: StandardService[]): {
    totalServices: number;
    activeServices: number;
    totalUsage: number;
    averageRate: number;
    categoryCounts: Record<string, number>;
    unitTypeCounts: Record<string, number>;
  } {
    const activeServices = services.filter(s => s.isActive);
    const totalUsage = services.reduce((sum, s) => sum + s.timesUsed, 0);
    const averageRate = activeServices.length > 0 
      ? activeServices.reduce((sum, s) => sum + s.defaultRate, 0) / activeServices.length
      : 0;

    const categoryCounts = services.reduce((acc, service) => {
      const category = service.category || 'Anders';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const unitTypeCounts = services.reduce((acc, service) => {
      acc[service.unitType] = (acc[service.unitType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalServices: services.length,
      activeServices: activeServices.length,
      totalUsage,
      averageRate: Math.round(averageRate * 100) / 100,
      categoryCounts,
      unitTypeCounts
    };
  }

  // Format service for display
  static formatServiceDisplay(service: StandardService): string {
    const rate = new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(service.defaultRate);

    const unitMap = {
      'HOURS': 'per uur',
      'DAYS': 'per dag',
      'AMOUNT': 'vast bedrag',
      'PIECES': 'per stuk',
      'KILOMETERS': 'per km',
      'PERCENTAGE': 'percentage',
      'OTHER': ''
    };

    const unit = unitMap[service.unitType] || '';
    return `${service.name} - ${rate} ${unit}`.trim();
  }

  // Export services to CSV
  static exportToCSV(services: StandardService[]): string {
    const headers = [
      'Naam',
      'Beschrijving',
      'Categorie',
      'Standaardtarief',
      'Eenheidstype',
      'Actief',
      'Standaard',
      'Aantal keer gebruikt',
      'Laatst gebruikt',
      'Aangemaakt'
    ];

    const rows = services.map(service => [
      service.name,
      service.description || '',
      service.category || '',
      service.defaultRate.toString(),
      service.unitType,
      service.isActive ? 'Ja' : 'Nee',
      service.isDefault ? 'Ja' : 'Nee',
      service.timesUsed.toString(),
      service.lastUsedAt ? new Date(service.lastUsedAt).toLocaleDateString('nl-NL') : '',
      new Date(service.createdAt).toLocaleDateString('nl-NL')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Import services from CSV
  static parseCSVImport(csvContent: string): {
    success: StandardServiceFormData[];
    errors: { row: number; errors: string[] }[];
  } {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { success: [], errors: [{ row: 0, errors: ['CSV bestand is leeg of ongeldig'] }] };
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const success: StandardServiceFormData[] = [];
    const errors: { row: number; errors: string[] }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      
      try {
        const serviceData: StandardServiceFormData = {
          name: values[0] || '',
          description: values[1] || undefined,
          category: values[2] || undefined,
          defaultRate: parseFloat(values[3]) || 0,
          unitType: (values[4] as InvoiceUnitType) || 'HOURS',
          isDefault: values[6]?.toLowerCase() === 'ja'
        };

        const validation = this.validateService(serviceData);
        if (validation.isValid) {
          success.push(serviceData);
        } else {
          errors.push({ row: i + 1, errors: validation.errors });
        }
      } catch (error) {
        errors.push({ row: i + 1, errors: ['Fout bij het verwerken van rij gegevens'] });
      }
    }

    return { success, errors };
  }
}

export default StandardServicesService;
