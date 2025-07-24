
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
  MoreHorizontal
} from 'lucide-react';
import { 
  mockInvoices, 
  mockClients, 
  mockAppointments,
  getRecentInvoices,
  getUpcomingAppointments 
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

export default function DashboardPage() {
  // Calculate stats
  const totalRevenue = mockInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const pendingInvoices = mockInvoices.filter(invoice => invoice.status === 'sent').length;
  const totalClients = mockClients.length;
  const upcomingAppointmentsCount = mockAppointments.filter(
    appointment => appointment.status === 'scheduled' && appointment.date > new Date()
  ).length;

  const recentInvoices = getRecentInvoices(5);
  const upcomingAppointments = getUpcomingAppointments(5);

  return (
    <div className="space-y-8">
      <Header 
        title="Welkom terug!" 
        description="Hier is een overzicht van je ZZP activiteiten" 
      />
      
      <div className="px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Totale Omzet"
            value={formatCurrency(totalRevenue)}
            description="Dit jaar"
            icon={TrendingUp}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Openstaande Facturen"
            value={pendingInvoices}
            description="Wachten op betaling"
            icon={CreditCard}
          />
          <StatsCard
            title="Actieve Klanten"
            value={totalClients}
            description="Totaal aantal"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatsCard
            title="Geplande Afspraken"
            value={upcomingAppointmentsCount}
            description="Komende week"
            icon={Calendar}
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
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.amount)}
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
