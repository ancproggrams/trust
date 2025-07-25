
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Database,
  ExternalLink,
  Filter
} from 'lucide-react';
import { useCommonTranslation, formatDateTime, formatRelativeTime } from '../../lib/hooks/use-translation';
import type { AuditEvent } from '../../lib/types/audit';

interface AuditTrailWidgetProps {
  limit?: number;
  showFilters?: boolean;
  entityFilter?: string;
  className?: string;
}

export function AuditTrailWidget({ 
  limit = 10, 
  showFilters = false,
  entityFilter,
  className = '' 
}: AuditTrailWidgetProps) {
  const { t } = useCommonTranslation();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    entity: entityFilter || '',
    action: '',
    verified: '',
  });

  useEffect(() => {
    fetchAuditEvents();
  }, [filter, limit]);

  const fetchAuditEvents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filter.entity && { entity: filter.entity }),
        ...(filter.action && { action: filter.action }),
        ...(filter.verified && { verified: filter.verified }),
      });

      const response = await fetch(`/api/audit/trail?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAuditEvents(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'UPDATE':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'DELETE':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'LOGIN':
      case 'LOGOUT':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'VALIDATE':
      case 'APPROVE':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'REJECT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'CREATE':
      case 'APPROVE':
      case 'VALIDATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'UPDATE':
      case 'LOGIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'DELETE':
      case 'REJECT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'LOGOUT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{t('navigation.audit')}</span>
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

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>{t('navigation.audit')}</span>
          </CardTitle>
          
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Open filter modal */}}
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('actions.filter')}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {auditEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('messages.noData')}</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {auditEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(event.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={getActionColor(event.action)}
                      >
                        {event.action}
                      </Badge>
                      
                      <span className="text-sm font-medium text-foreground">
                        {event.entity}
                      </span>
                      
                      {event.immudbVerified && (
                        <Badge variant="outline" className="text-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {event.userName && (
                        <span className="font-medium">{event.userName}</span>
                      )}
                      {event.userName && ' • '}
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    
                    {(event.newValues || event.oldValues) && (
                      <div className="text-xs text-muted-foreground">
                        {event.action === 'CREATE' && event.newValues && (
                          <span>Created with {Object.keys(event.newValues).length} fields</span>
                        )}
                        {event.action === 'UPDATE' && (
                          <span>
                            Updated {event.newValues ? Object.keys(event.newValues).length : 0} fields
                          </span>
                        )}
                        {event.action === 'DELETE' && event.oldValues && (
                          <span>Deleted entity with {Object.keys(event.oldValues).length} fields</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* View details */}}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {auditEvents.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => window.open('/dashboard/audit', '_blank')}
            >
              {t('actions.view')} {t('navigation.audit')}
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
