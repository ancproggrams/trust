
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  PenTool, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Database,
  Lock,
  Eye,
  Download,
  Settings
} from 'lucide-react';
import { ComplianceDashboardStats } from '@/lib/types';

interface ComplianceDashboardProps {
  className?: string;
}

export function ComplianceDashboard({ className = '' }: ComplianceDashboardProps) {
  const [stats, setStats] = useState<ComplianceDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchComplianceStats();
  }, []);

  const fetchComplianceStats = async () => {
    try {
      setLoading(true);
      
      // In production, this would be a single API call to get all compliance stats
      // For now, we'll simulate the data
      const mockStats: ComplianceDashboardStats = {
        totalDocuments: 12,
        activeDocuments: 8,
        pendingSignatures: 3,
        activeConsents: 156,
        withdrawnConsents: 12,
        complianceChecks: {
          total: 89,
          compliant: 76,
          nonCompliant: 5,
          pending: 8,
        },
        wwftChecks: {
          total: 45,
          completed: 38,
          pending: 4,
          highRisk: 3,
        },
        dataRetention: {
          totalPolicies: 6,
          scheduledDeletions: 12,
          completedDeletions: 234,
        },
        securityControls: {
          total: 47,
          implemented: 42,
          partiallyImplemented: 3,
          notImplemented: 2,
        },
      };

      setStats(mockStats);
    } catch (err) {
      setError('Failed to load compliance statistics');
      console.error('Error fetching compliance stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) return null;

  const complianceRate = stats.complianceChecks.total > 0 
    ? (stats.complianceChecks.compliant / stats.complianceChecks.total) * 100 
    : 0;

  const securityImplementationRate = stats.securityControls.total > 0
    ? (stats.securityControls.implemented / stats.securityControls.total) * 100
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600">Monitor compliance status en juridische overeenkomsten</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Rapport
          </Button>
          <Button className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Instellingen
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-3xl font-bold text-green-600">{complianceRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Progress value={complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actieve Toestemmingen</p>
                <p className="text-3xl font-bold text-blue-600">{stats.activeConsents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.withdrawnConsents} ingetrokken deze maand
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Handtekeningen</p>
                <p className="text-3xl font-bold text-purple-600">{stats.pendingSignatures}</p>
              </div>
              <PenTool className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Wachtend op ondertekening
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wwft Checks</p>
                <p className="text-3xl font-bold text-orange-600">{stats.wwftChecks.pending}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {stats.wwftChecks.highRisk} high-risk gevallen
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="documents">Documenten</TabsTrigger>
          <TabsTrigger value="signatures">Handtekeningen</TabsTrigger>
          <TabsTrigger value="consent">Toestemmingen</TabsTrigger>
          <TabsTrigger value="wwft">Wwft</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Compliant</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{stats.complianceChecks.compliant}</Badge>
                    <span className="text-sm text-gray-500">
                      {((stats.complianceChecks.compliant / stats.complianceChecks.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Non-Compliant</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{stats.complianceChecks.nonCompliant}</Badge>
                    <span className="text-sm text-gray-500">
                      {((stats.complianceChecks.nonCompliant / stats.complianceChecks.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{stats.complianceChecks.pending}</Badge>
                    <span className="text-sm text-gray-500">
                      {((stats.complianceChecks.pending / stats.complianceChecks.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Controls (ISO 27001)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Implementation Progress</span>
                    <span>{securityImplementationRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={securityImplementationRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.securityControls.implemented}
                    </div>
                    <div className="text-xs text-gray-500">Implemented</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.securityControls.partiallyImplemented}
                    </div>
                    <div className="text-xs text-gray-500">Partial</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {stats.securityControls.notImplemented}
                    </div>
                    <div className="text-xs text-gray-500">Missing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recente Activiteit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Privacy Policy v2.1 gepubliceerd</p>
                    <p className="text-xs text-gray-500">2 uur geleden</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <PenTool className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Machtigingsovereenkomst ondertekend door Client ABC</p>
                    <p className="text-xs text-gray-500">4 uur geleden</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Wwft review vervalt voor Client XYZ</p>
                    <p className="text-xs text-gray-500">1 dag geleden</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Juridische Documenten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Algemene Voorwaarden</h3>
                    <Badge variant="default">Actief</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">v3.2 - Nederlands</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijken
                    </Button>
                    <Button size="sm" variant="outline">
                      Bewerken
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Privacy Policy</h3>
                    <Badge variant="default">Actief</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">v2.1 - Nederlands</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijken
                    </Button>
                    <Button size="sm" variant="outline">
                      Bewerken
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Machtigingsovereenkomst</h3>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">v1.3 - Nederlands</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Bekijken
                    </Button>
                    <Button size="sm" variant="outline">
                      Publiceren
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Digitale Handtekeningen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Machtigingsovereenkomst - Client ABC</h3>
                    <p className="text-sm text-gray-500">Verzonden 2 dagen geleden</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Privacy Policy - Client XYZ</h3>
                    <p className="text-sm text-gray-500">Ondertekend 3 dagen geleden</p>
                  </div>
                  <Badge variant="default">Ondertekend</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Algemene Voorwaarden - Client DEF</h3>
                    <p className="text-sm text-gray-500">Verzonden 1 week geleden</p>
                  </div>
                  <Badge variant="destructive">Verlopen</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                GDPR Toestemmingen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Toestemming per Type</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Data Processing</span>
                      <span className="text-sm font-medium">142</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Marketing</span>
                      <span className="text-sm font-medium">67</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cookies</span>
                      <span className="text-sm font-medium">89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Third Party Sharing</span>
                      <span className="text-sm font-medium">23</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Recente Intrekkingen</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium">Marketing consent - Client ABC</p>
                      <p className="text-xs text-gray-500">Ingetrokken 2 dagen geleden</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium">Cookie consent - Client XYZ</p>
                      <p className="text-xs text-gray-500">Ingetrokken 5 dagen geleden</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wwft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Wwft Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.wwftChecks.completed}</div>
                  <div className="text-sm text-gray-500">Completed Checks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{stats.wwftChecks.pending}</div>
                  <div className="text-sm text-gray-500">Pending Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.wwftChecks.highRisk}</div>
                  <div className="text-sm text-gray-500">High Risk Cases</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">Openstaande Reviews</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Client ABC - Enhanced CDD</p>
                      <p className="text-sm text-gray-500">Scheduled: 15 Dec 2024</p>
                    </div>
                    <Badge variant="destructive">Overdue</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Client XYZ - Standard CDD</p>
                      <p className="text-sm text-gray-500">Scheduled: 20 Dec 2024</p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                GDPR Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Data Retention</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Active Policies</span>
                      <span className="text-sm font-medium">{stats.dataRetention.totalPolicies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Scheduled Deletions</span>
                      <span className="text-sm font-medium">{stats.dataRetention.scheduledDeletions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completed Deletions</span>
                      <span className="text-sm font-medium">{stats.dataRetention.completedDeletions}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Data Subject Requests</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Access Request - Client ABC</p>
                      <p className="text-xs text-gray-500">Submitted 1 day ago</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-medium">Erasure Request - Client XYZ</p>
                      <p className="text-xs text-gray-500">Under review</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

