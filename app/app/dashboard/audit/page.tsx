
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  Shield, 
  Filter, 
  Download, 
  Search,
  Calendar,
  User,
  Database,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useCommonTranslation, formatDateTime, formatRelativeTime } from '../../../lib/hooks/use-translation';
import type { AuditEvent, AuditFilter } from '../../../lib/types/audit';

export default function AuditPage() {
  const { t } = useCommonTranslation();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<AuditFilter>({
    entity: undefined,
    action: undefined,
    verified: undefined,
  });

  useEffect(() => {
    fetchAuditEvents();
  }, [filter]);

  const fetchAuditEvents = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.set('limit', '100');
      
      if (filter.entity) params.set('entity', filter.entity);
      if (filter.action) params.set('action', filter.action);
      if (filter.verified !== undefined) params.set('verified', filter.verified.toString());
      if (searchTerm) params.set('search', searchTerm);

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

  const handleSearch = () => {
    fetchAuditEvents();
  };

  const handleExport = async () => {
    try {
      // This would export audit data
      console.log('Exporting audit data...');
    } catch (error) {
      console.error('Failed to export audit data:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>{t('navigation.audit')}</span>
          </h1>
          <p className="text-muted-foreground">
            View and analyze all audit trail events
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchAuditEvents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('actions.refresh')}
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t('actions.export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search audit events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Entity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Entity</label>
              <Select 
                value={filter.entity || ''} 
                onValueChange={(value) => setFilter(prev => ({ ...prev, entity: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All entities</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="UserProfile">User Profile</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Creditor">Creditor</SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select 
                value={filter.action || ''} 
                onValueChange={(value) => setFilter(prev => ({ ...prev, action: value as any || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="LOGOUT">Logout</SelectItem>
                  <SelectItem value="VALIDATE">Validate</SelectItem>
                  <SelectItem value="APPROVE">Approve</SelectItem>
                  <SelectItem value="REJECT">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verified Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification</label>
              <Select 
                value={filter.verified?.toString() || ''} 
                onValueChange={(value) => setFilter(prev => ({ ...prev, verified: value ? value === 'true' : undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Events ({auditEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : auditEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('messages.noData')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {auditEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(event.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={getActionColor(event.action)}
                        >
                          {event.action}
                        </Badge>
                        
                        <span className="font-medium text-foreground">
                          {event.entity}
                        </span>
                        
                        <span className="text-muted-foreground">
                          #{event.entityId.slice(0, 8)}
                        </span>
                        
                        {event.immudbVerified && (
                          <Badge variant="outline" className="text-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                        {event.userName && (
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {event.userName}
                          </span>
                        )}
                        
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDateTime(event.timestamp)}
                        </span>
                        
                        <span>({formatRelativeTime(event.timestamp)})</span>
                      </div>
                      
                      {(event.newValues || event.oldValues) && (
                        <div className="text-sm">
                          {event.action === 'CREATE' && event.newValues && (
                            <p className="text-green-600">
                              Created with {Object.keys(event.newValues).length} fields
                            </p>
                          )}
                          {event.action === 'UPDATE' && (
                            <p className="text-blue-600">
                              Updated {event.newValues ? Object.keys(event.newValues).length : 0} fields
                            </p>
                          )}
                          {event.action === 'DELETE' && event.oldValues && (
                            <p className="text-red-600">
                              Deleted entity with {Object.keys(event.oldValues).length} fields
                            </p>
                          )}
                        </div>
                      )}
                      
                      {event.ipAddress && (
                        <div className="text-xs text-muted-foreground mt-1">
                          IP: {event.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
