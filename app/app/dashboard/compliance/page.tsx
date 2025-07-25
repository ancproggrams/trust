
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Play,
  FileCheck,
  Download
} from 'lucide-react';
import { useCommonTranslation, formatDate, formatDateTime } from '../../../lib/hooks/use-translation';
import type { ComplianceDashboard, ComplianceReport, ComplianceIssue } from '../../../lib/types/audit';

export default function CompliancePage() {
  const { t } = useCommonTranslation();
  const [compliance, setCompliance] = useState<ComplianceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningCheck, setRunningCheck] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>('');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/audit/compliance');
      const data = await response.json();
      
      if (data.success) {
        setCompliance(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runComplianceCheck = async (entity?: string) => {
    try {
      setRunningCheck(true);
      
      const body = entity 
        ? { entity, entityId: 'all', checkType: 'MANDATORY_FIELDS' }
        : {};
      
      const response = await fetch('/api/audit/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        await fetchComplianceData();
      }
    } catch (error) {
      console.error('Failed to run compliance check:', error);
    } finally {
      setRunningCheck(false);
    }
  };

  const getComplianceColor = (rate: number): string => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (rate >= 70) return <Clock className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getSeverityColor = (severity: ComplianceIssue['severity']): string => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6" />
            <span>{t('navigation.compliance')}</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage compliance across all entities
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All entities</SelectItem>
              <SelectItem value="UserProfile">User Profiles</SelectItem>
              <SelectItem value="Creditor">Creditors</SelectItem>
              <SelectItem value="Client">Clients</SelectItem>
              <SelectItem value="Invoice">Invoices</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => runComplianceCheck(selectedEntity)}
            disabled={runningCheck}
          >
            <Play className={`h-4 w-4 mr-2 ${runningCheck ? 'animate-spin' : ''}`} />
            Run Check
          </Button>
          
          <Button variant="outline" onClick={fetchComplianceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('actions.refresh')}
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {compliance ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  {getComplianceIcon(compliance.overview.complianceRate)}
                  <span className="text-sm font-medium">Overall Rate</span>
                </div>
                <div className={`text-2xl font-bold mt-2 ${getComplianceColor(compliance.overview.complianceRate)}`}>
                  {Math.round(compliance.overview.complianceRate)}%
                </div>
                <Progress value={compliance.overview.complianceRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Compliant</span>
                </div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {compliance.overview.compliantEntities}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {compliance.overview.totalEntities} entities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Non-Compliant</span>
                </div>
                <div className="text-2xl font-bold text-red-600 mt-2">
                  {compliance.overview.nonCompliantEntities}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  require immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Trend</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  +5.2%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  vs last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Entity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance by Entity Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compliance.byEntity.map((entity, index) => {
                  const rate = entity.total > 0 ? (entity.compliant / entity.total) * 100 : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{entity.entity}</span>
                        <div className="flex items-center space-x-4">
                          <span className={`font-semibold ${getComplianceColor(rate)}`}>
                            {Math.round(rate)}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {entity.compliant}/{entity.total}
                          </span>
                        </div>
                      </div>
                      <Progress value={rate} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{entity.compliant} compliant</span>
                        <span>{entity.nonCompliant} non-compliant</span>
                        <span>{entity.pending} pending</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span>Critical Issues ({compliance.criticalIssues.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compliance.criticalIssues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No critical issues found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {compliance.criticalIssues.map((issue, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border bg-muted/20 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="secondary" 
                              className={getSeverityColor(issue.severity)}
                            >
                              {issue.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due: {formatDate(issue.dueDate)}
                            </span>
                          </div>
                          
                          <div>
                            <p className="font-medium text-sm">{issue.entityName}</p>
                            <p className="text-xs text-muted-foreground mb-2">
                              {issue.description}
                            </p>
                          </div>
                          
                          {issue.missingFields.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1">Missing fields:</p>
                              <div className="flex flex-wrap gap-1">
                                {issue.missingFields.map((field, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {field}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Checks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Upcoming Checks ({compliance.upcomingChecks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compliance.upcomingChecks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming checks scheduled</p>
                  </div>
                ) : (
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {compliance.upcomingChecks.map((check, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border bg-muted/20 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{check.entity}</p>
                            <p className="text-xs text-muted-foreground">
                              {check.checkType.replace('_', ' ').toLowerCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {check.entityId.slice(0, 8)}...
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatDate(check.scheduledAt)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Scheduled
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">{t('messages.noData')}</p>
            <Button onClick={() => runComplianceCheck()}>
              Run Initial Compliance Check
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
