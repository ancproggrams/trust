
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
  Calendar, 
  TrendingUp,
  Eye,
  MoreHorizontal,
  Receipt,
  PiggyBank,
  AlertTriangle,
  Calculator,
  Building2,
  UserCheck,
  CreditCardIcon,
  PlayCircle
} from 'lucide-react';
// LEGACY REMOVED: Mock data imports replaced by API calls
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime,
  getInvoiceStatusColor,
  getAppointmentStatusColor,
  translateStatus 
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { AuditTrailWidget } from '@/components/dashboard/audit-trail-widget';
import { ComplianceWidget } from '@/components/dashboard/compliance-widget';
import { useState, useEffect } from 'react';
import { DashboardStats, Invoice, Appointment } from '@/lib/types';

export default function DashboardPage() {
  const { isDemo, user } = useAuth();
  
  // State for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
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

        // Fetch upcoming appointments from API  
        const appointmentsResponse = await fetch('/api/appointments?upcoming=true&limit=5');
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          setUpcomingAppointments(appointmentsData.appointments || []);
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
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
    <div className="space-y-8">
      {/* Demo Indicator */}
      {isDemo && (
        <div className="px-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
            <PlayCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Demo Modus Actief
              </p>
              <p className="text-xs text-blue-700">
                Je gebruikt ZZP Trust in demo modus met voorbeelddata. Alle functionaliteiten zijn beschikbaar voor testing.
              </p>
            </div>
          </div>
        </div>
      )}

      <Header 
        title={isDemo ? "Demo Dashboard" : "Welkom terug!"} 
        description={isDemo ? "Ontdek ZZP Trust met voorbeelddata" : "Hier is een overzicht van je ZZP activiteiten"} 
      />
      
      <div className="px-6">
        {/* Stats Grid - Algemeen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
            title="Geplande Afspraken"
            value={dashboardStats.upcomingAppointments}
            description="Komende week"
            icon={Calendar}
          />
        </div>

        {/* Stats Grid - Crediteuren */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Invoices */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Recente Facturen</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/invoices">
                  <Eye className="h-4 w-4 mr-2" />
                  Bekijk alle
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Factuur</TableHead>
                        <TableHead>Klant</TableHead>
                        <TableHead>Bedrag</TableHead>
                        <TableHead>BTW</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {invoice.client?.name || 'Onbekende klant'}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(invoice.subtotal)} excl. BTW
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
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
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nog geen facturen aangemaakt</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Aankomende Afspraken</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/appointments">
                  <Eye className="h-4 w-4 mr-2" />
                  Bekijk alle
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Afspraak</TableHead>
                        <TableHead>Klant</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {appointment.clientName}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(appointment.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={getAppointmentStatusColor(appointment.status)}
                            >
                              {translateStatus(appointment.status, 'appointment')}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen afspraken gepland</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Audit & Compliance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audit Trail Widget */}
          <div>
            <AuditTrailWidget limit={8} showFilters={false} />
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
