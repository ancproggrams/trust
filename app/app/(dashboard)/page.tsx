
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
import { 
  mockInvoices, 
  mockClients, 
  mockAppointments,
  getRecentInvoices,
  getUpcomingAppointments,
  getTotalBTWOwed,
  getTotalBTWPrepaid,
  getTotalTaxReserved,
  getCurrentYearRevenue,
  getEstimatedYearEndTax,
  mockBTWRecords,
  getExtendedDashboardStats,
  getPendingValidations,
  getPendingPayments
} from '@/lib/mock-data';
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

export default function DashboardPage() {
  const { isDemo, user } = useAuth();
  
  // Get extended dashboard stats
  const stats = getExtendedDashboardStats();
  
  // Find next BTW deadline
  const nextBTWPayment = mockBTWRecords
    .filter(record => record.status === 'pending' || record.status === 'reserved')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

  const recentInvoices = getRecentInvoices(5);
  const upcomingAppointments = getUpcomingAppointments(5);
  const pendingValidations = getPendingValidations();
  const pendingPayments = getPendingPayments();

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
            value={formatCurrency(stats.totalRevenue)}
            description="Dit jaar"
            icon={TrendingUp}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Openstaande Facturen"
            value={stats.pendingInvoices}
            description="Wachten op betaling"
            icon={CreditCard}
          />
          <StatsCard
            title="Actieve Klanten"
            value={stats.totalClients}
            description="Totaal aantal"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Geplande Afspraken"
            value={stats.upcomingAppointments}
            description="Komende week"
            icon={Calendar}
          />
        </div>

        {/* Stats Grid - Crediteuren */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Totale Crediteuren"
            value={stats.totalCreditors}
            description="Geregistreerde leveranciers"
            icon={Building2}
            trend={{ value: 5.3, isPositive: true }}
          />
          <StatsCard
            title="Validaties Vereist"
            value={stats.pendingCreditorValidations}
            description="Wachten op goedkeuring"
            icon={UserCheck}
          />
          <StatsCard
            title="Openstaande Betalingen"
            value={stats.pendingPayments}
            description="Te verwerken uitbetalingen"
            icon={CreditCardIcon}
          />
        </div>

        {/* BTW/Belasting Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="BTW Openstaand"
            value={formatCurrency(stats.totalBTWOwed)}
            description={nextBTWPayment ? `Vervalt ${formatDate(nextBTWPayment.dueDate)}` : "Geen openstaande BTW"}
            icon={Receipt}
            trend={stats.totalBTWOwed > 0 ? { value: 0, isPositive: false } : undefined}
          />
          <StatsCard
            title="BTW Vooruitbetaald"
            value={formatCurrency(stats.totalBTWPrepaid)}
            description="Dit kwartaal"
            icon={PiggyBank}
          />
          <StatsCard
            title="Belasting Gereserveerd"
            value={formatCurrency(stats.totalTaxReserved)}
            description="Voor jaaraangifte"
            icon={Calculator}
            trend={{ value: 15.3, isPositive: true }}
          />
          <StatsCard
            title="Geschatte Jaarbelasting"
            value={formatCurrency(stats.estimatedYearEndTax)}
            description={`Op ${formatCurrency(stats.currentYearRevenue)} omzet`}
            icon={AlertTriangle}
          />
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            {invoice.clientName}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(invoice.amount)} excl. BTW
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
      </div>
    </div>
  );
}
