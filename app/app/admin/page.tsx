
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Mail, 
  TrendingUp,
  AlertTriangle,
  Settings,
  Shield,
  FileText,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { useAdminApprovals } from '@/hooks/use-admin-approvals';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { stats, loading, error } = useAdminApprovals();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Dashboard laden...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            Error loading dashboard: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Overzicht van systeem activiteiten en goedkeuringen
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => router.push('/admin/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Instellingen
            </Button>
            <Button onClick={() => router.push('/admin/approvals')}>
              <Shield className="w-4 h-4 mr-2" />
              Goedkeuringen
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wachtende Goedkeuringen</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vereist onmiddellijke actie
                  </p>
                  {stats.pendingApprovals > 0 && (
                    <Button 
                      size="sm" 
                      className="mt-2 w-full" 
                      onClick={() => router.push('/admin/approvals')}
                    >
                      Behandelen
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nieuwe Klanten (Week)</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.newClientsThisWeek}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{Math.round((stats.newClientsThisWeek / 7) * 100) / 100} per dag gemiddeld
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Emails Verstuurd</CardTitle>
                  <Mail className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.emailsSentToday}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.emailsFailedToday > 0 && (
                      <span className="text-red-500">{stats.emailsFailedToday} gefaald</span>
                    )}
                    {stats.emailsFailedToday === 0 && "Alle emails succesvol"}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Goedkeuringstijd</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.averageApprovalTime.toFixed(1)}h
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gemiddelde verwerkingstijd
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Klanten per Status</span>
                  </CardTitle>
                  <CardDescription>
                    Overzicht van alle klant registraties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.clientsByStatus).map(([status, count]) => {
                      const getStatusInfo = (status: string) => {
                        switch (status) {
                          case 'PENDING_VALIDATION':
                            return { label: 'Wacht op Validatie', color: 'gray', icon: Clock };
                          case 'EMAIL_SENT':
                            return { label: 'Email Verstuurd', color: 'blue', icon: Mail };
                          case 'CLIENT_CONFIRMED':
                            return { label: 'Email Bevestigd', color: 'green', icon: CheckCircle };
                          case 'ADMIN_REVIEW':
                            return { label: 'Admin Review', color: 'orange', icon: Users };
                          case 'APPROVED':
                            return { label: 'Goedgekeurd', color: 'green', icon: CheckCircle };
                          case 'REJECTED':
                            return { label: 'Afgewezen', color: 'red', icon: AlertTriangle };
                          default:
                            return { label: status, color: 'gray', icon: Clock };
                        }
                      };

                      const info = getStatusInfo(status);
                      const Icon = info.icon;

                      return (
                        <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-4 h-4 text-${info.color}-500`} />
                            <span className="font-medium">{info.label}</span>
                          </div>
                          <Badge variant="outline" className={`text-${info.color}-600`}>
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Status Overview</span>
                  </CardTitle>
                  <CardDescription>
                    Email delivery en engagement statistieken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.emailsByStatus).map(([status, count]) => {
                      const getEmailStatusInfo = (status: string) => {
                        switch (status) {
                          case 'PENDING':
                            return { label: 'In Wachtrij', color: 'gray' };
                          case 'SENT':
                            return { label: 'Verstuurd', color: 'blue' };
                          case 'DELIVERED':
                            return { label: 'Bezorgd', color: 'green' };
                          case 'OPENED':
                            return { label: 'Geopend', color: 'green' };
                          case 'CLICKED':
                            return { label: 'Geklikt', color: 'green' };
                          case 'FAILED':
                            return { label: 'Gefaald', color: 'red' };
                          case 'BOUNCED':
                            return { label: 'Bounced', color: 'red' };
                          default:
                            return { label: status, color: 'gray' };
                        }
                      };

                      const info = getEmailStatusInfo(status);

                      return (
                        <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{info.label}</span>
                          <Badge variant="outline" className={`text-${info.color}-600`}>
                            {count}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Snelle Acties</CardTitle>
            <CardDescription>
              Veelgebruikte admin functies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/admin/approvals')}
              >
                <Shield className="w-6 h-6" />
                <span>Goedkeuringen</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/admin/users')}
              >
                <Users className="w-6 h-6" />
                <span>Gebruikers</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/admin/audit')}
              >
                <FileText className="w-6 h-6" />
                <span>Audit Logs</span>
              </Button>

              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push('/admin/analytics')}
              >
                <BarChart3 className="w-6 h-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        {stats && stats.pendingApprovals > 5 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-700">
              <strong>Hoge werklast:</strong> Er zijn {stats.pendingApprovals} klanten die wachten op goedkeuring. 
              Overweeg om extra resources in te zetten voor snellere verwerking.
              <Button 
                size="sm" 
                className="ml-3" 
                onClick={() => router.push('/admin/approvals')}
              >
                Ga naar Goedkeuringen <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {stats && stats.emailsFailedToday > 10 && (
          <Alert className="border-red-200 bg-red-50">
            <Mail className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Email problemen:</strong> {stats.emailsFailedToday} emails zijn vandaag gefaald. 
              Controleer de email service configuratie.
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-3" 
                onClick={() => router.push('/admin/email-logs')}
              >
                Bekijk Logs
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
