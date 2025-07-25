
'use client';

import { Header } from '@/components/dashboard/header';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Users, 
  TrendingUp,
  Eye,
  Receipt,
  PiggyBank,
  AlertTriangle,
  Calculator,
  Building2,
  UserCheck,
  CreditCardIcon,
  PlayCircle,
  FileText,
  Shield
} from 'lucide-react';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime,
  getInvoiceStatusColor,
  translateStatus 
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { AuditTrailWidget } from '@/components/dashboard/audit-trail-widget';
import { ComplianceWidget } from '@/components/dashboard/compliance-widget';
import { useState, useEffect } from 'react';
import { DashboardStats, Invoice } from '@/lib/types';

export default function DashboardPage() {
  const { isDemo, user } = useAuth();
  
  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats from API
        const statsResponse = await fetch('/api/dashboard/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch recent invoices from API
        const invoicesResponse = await fetch('/api/invoices?recent=true&limit=5');
        if (invoicesResponse.ok) {
          const invoicesData = await invoicesResponse.json();
          setRecentInvoices(invoicesData.invoices || []);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Loading state with mobile-friendly skeletons
  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Default stats if API call failed
  const dashboardStats = stats || {
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    upcomingAppointments: 0,
    totalClients: 0,
    completedAppointments: 0,
    totalBTWOwed: 0,
    totalBTWPrepaid: 0,
    nextBTWPaymentDue: null,
    totalTaxReserved: 0,
    currentYearRevenue: 0,
    estimatedYearEndTax: 0,
    totalCreditors: 0,
    pendingCreditorValidations: 0,
    pendingPayments: 0
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Demo Indicator */}
      {isDemo && (
        <div className="px-4 sm:px-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center space-x-3">
            <PlayCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Trust.io Demo Actief
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                Je gebruikt Trust.io in demo modus met voorbeelddata. Alle functionaliteiten zijn beschikbaar voor testing.
              </p>
            </div>
          </div>
        </div>
      )}

      <Header 
        title={isDemo ? "Trust.io Demo" : "Welkom terug!"} 
        description={isDemo ? "Ontdek Trust.io met voorbeelddata" : "Hier is een overzicht van je ZZP activiteiten"} 
      />
      
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Primary Stats Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <StatsCard
            title="Totale Omzet"
            value={formatCurrency(dashboardStats.totalRevenue)}
            description="Dit jaar"
            icon={TrendingUp}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Openstaande Facturen"
            value={dashboardStats.pendingInvoices}
            description="Wachten op betaling"
            icon={CreditCard}
          />
          <StatsCard
            title="Actieve Klanten"
            value={dashboardStats.totalClients}
            description="Totaal aantal"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Totale Facturen"
            value={dashboardStats.totalInvoices}
            description="Dit jaar"
            icon={FileText}
          />
        </div>

        {/* Secondary Stats Grid - Crediteuren */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <StatsCard
            title="Totale Crediteuren"
            value={dashboardStats.totalCreditors}
            description="Geregistreerde leveranciers"
            icon={Building2}
            trend={{ value: 5.3, isPositive: true }}
          />
          <StatsCard
            title="Validaties Vereist"
            value={dashboardStats.pendingCreditorValidations}
            description="Wachten op goedkeuring"
            icon={UserCheck}
          />
          <StatsCard
            title="Openstaande Betalingen"
            value={dashboardStats.pendingPayments}
            description="Te verwerken uitbetalingen"
            icon={CreditCardIcon}
          />
        </div>

        {/* BTW/Belasting Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatsCard
            title="BTW Openstaand"
            value={formatCurrency(dashboardStats.totalBTWOwed)}
            description={dashboardStats.nextBTWPaymentDue ? `Vervalt ${formatDate(dashboardStats.nextBTWPaymentDue)}` : "Geen openstaande BTW"}
            icon={Receipt}
            trend={dashboardStats.totalBTWOwed > 0 ? { value: 0, isPositive: false } : undefined}
          />
          <StatsCard
            title="BTW Vooruitbetaald"
            value={formatCurrency(dashboardStats.totalBTWPrepaid)}
            description="Dit kwartaal"
            icon={PiggyBank}
          />
          <StatsCard
            title="Belasting Gereserveerd"
            value={formatCurrency(dashboardStats.totalTaxReserved)}
            description="Voor jaaraangifte"
            icon={Calculator}
            trend={{ value: 15.3, isPositive: true }}
          />
          <StatsCard
            title="Geschatte Jaarbelasting"
            value={formatCurrency(dashboardStats.estimatedYearEndTax)}
            description={`Op ${formatCurrency(dashboardStats.currentYearRevenue)} omzet`}
            icon={AlertTriangle}
          />
        </div>

        {/* Recent Activity Grid - Mobile Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Recent Invoices */}
          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold dark:text-white">Recente Facturen</CardTitle>
              <Button variant="ghost" size="sm" asChild className="touch-manipulation">
                <Link href="/dashboard/invoices">
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Bekijk alle</span>
                  <span className="sm:hidden">Alle</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Factuur</TableHead>
                          <TableHead className="hidden sm:table-cell">Klant</TableHead>
                          <TableHead>Bedrag</TableHead>
                          <TableHead className="hidden md:table-cell">BTW</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{invoice.invoiceNumber}</div>
                                <div className="text-xs text-muted-foreground sm:hidden">
                                  {invoice.client?.name || 'Onbekende klant'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {invoice.client?.name || 'Onbekende klant'}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatCurrency(invoice.totalAmount)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(invoice.subtotal)} excl.
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">
                              {formatCurrency(invoice.btwAmount)}
                              <div className="text-xs text-muted-foreground">
                                {invoice.btwRate}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={getInvoiceStatusColor(invoice.status)}
                              >
                                {translateStatus(invoice.status, 'invoice')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nog geen facturen aangemaakt</p>
                    <Button variant="outline" size="sm" asChild className="mt-4 touch-manipulation">
                      <Link href="/dashboard/invoices/new">
                        Eerste factuur maken
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm dark:bg-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold dark:text-white">Snelle Acties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild className="h-16 flex-col space-y-2 touch-manipulation">
                  <Link href="/dashboard/invoices/new">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs">Nieuwe Factuur</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-16 flex-col space-y-2 touch-manipulation">
                  <Link href="/dashboard/clients/new">
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Nieuwe Klant</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-16 flex-col space-y-2 touch-manipulation">
                  <Link href="/dashboard/services">
                    <Calculator className="h-5 w-5" />
                    <span className="text-xs">Diensten</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-16 flex-col space-y-2 touch-manipulation">
                  <Link href="/dashboard/tax">
                    <Receipt className="h-5 w-5" />
                    <span className="text-xs">BTW & Belasting</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Audit & Compliance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Audit Trail Widget */}
          <div>
            <AuditTrailWidget limit={6} showFilters={false} />
          </div>
          
          {/* Compliance Widget */}
          <div>
            <ComplianceWidget showDetails={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
