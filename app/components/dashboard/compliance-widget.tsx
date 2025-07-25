
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ExternalLink,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { useCommonTranslation, formatDate } from '../../lib/hooks/use-translation';
import type { ComplianceDashboard, ComplianceIssue } from '../../lib/types/audit';

interface ComplianceWidgetProps {
  showDetails?: boolean;
  className?: string;
}

export function ComplianceWidget({ 
  showDetails = true,
  className = '' 
}: ComplianceWidgetProps) {
  const { t } = useCommonTranslation();
  const [compliance, setCompliance] = useState<ComplianceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplianceData();
    setRefreshing(false);
  };

  const runComplianceCheck = async () => {
    try {
      // This would trigger a new compliance check
      console.log('Running compliance check...');
      await handleRefresh();
    } catch (error) {
      console.error('Failed to run compliance check:', error);
    }
  };

  const getComplianceStatusColor = (rate: number): string => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatusIcon = (rate: number) => {
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5" />
            <span>{t('navigation.compliance')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!compliance) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5" />
            <span>{t('navigation.compliance')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('messages.noData')}</p>
            <Button onClick={runComplianceCheck} className="mt-4">
              Run Initial Check
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, criticalIssues, upcomingChecks } = compliance;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5" />
            <span>{t('navigation.compliance')}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={runComplianceCheck}
            >
              Run Check
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Compliance Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getComplianceStatusIcon(overview.complianceRate)}
              <span className="text-sm font-medium">Overall Compliance</span>
            </div>
            <span className={`text-lg font-bold ${getComplianceStatusColor(overview.complianceRate)}`}>
              {Math.round(overview.complianceRate)}%
            </span>
          </div>
          
          <Progress 
            value={overview.complianceRate} 
            className="h-2"
          />
          
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-green-600 font-semibold">{overview.compliantEntities}</div>
              <div className="text-muted-foreground">{t('status.compliant')}</div>
            </div>
            <div>
              <div className="text-red-600 font-semibold">{overview.nonCompliantEntities}</div>
              <div className="text-muted-foreground">{t('status.nonCompliant')}</div>
            </div>
            <div>
              <div className="text-yellow-600 font-semibold">{overview.totalEntities}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
          </div>
        </div>

        {/* Critical Issues */}
        {criticalIssues && criticalIssues.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Critical Issues ({criticalIssues.length})</span>
            </h4>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {criticalIssues.slice(0, 3).map((issue, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border bg-muted/20"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={getSeverityColor(issue.severity)}
                      >
                        {issue.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {issue.entityName}
                      </span>
                    </div>
                    <p className="text-xs text-foreground truncate">
                      {issue.description}
                    </p>
                  </div>
                </div>
              ))}
              
              {criticalIssues.length > 3 && (
                <div className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('/dashboard/compliance', '_blank')}
                  >
                    View {criticalIssues.length - 3} more issues
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Checks */}
        {showDetails && upcomingChecks && upcomingChecks.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Upcoming Checks</span>
            </h4>
            
            <div className="space-y-2">
              {upcomingChecks.slice(0, 2).map((check, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border bg-muted/20"
                >
                  <div className="flex-1">
                    <div className="text-xs font-medium">{check.entity}</div>
                    <div className="text-xs text-muted-foreground">
                      {check.checkType.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(check.scheduledAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.open('/dashboard/compliance', '_blank')}
          >
            {t('actions.view')} {t('navigation.compliance')}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
