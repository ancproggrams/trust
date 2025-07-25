
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Mail, 
  Phone,
  CreditCard,
  AlertTriangle,
  Eye,
  FileText,
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { useAdminApprovals } from '@/hooks/use-admin-approvals';
import { ClientApproval, AdminDashboardStats } from '@/lib/types';

interface ApprovalAction {
  type: 'approve' | 'reject' | 'view';
  clientId: string;
  clientName: string;
}

export function ApprovalDashboard() {
  const {
    approvals,
    stats,
    loading,
    error,
    pagination,
    approveClient,
    rejectClient,
    bulkApprove,
    bulkReject,
    refetch,
    setPage,
  } = useAdminApprovals();

  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<ApprovalAction | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectApproval = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedApprovals(prev => [...prev, clientId]);
    } else {
      setSelectedApprovals(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApprovals(approvals.map(approval => approval.clientId));
    } else {
      setSelectedApprovals([]);
    }
  };

  const handleAction = (action: ApprovalAction) => {
    setCurrentAction(action);
    setActionNotes('');
    setRejectionReason('');
  };

  const handleProcessAction = async () => {
    if (!currentAction) return;

    setIsProcessing(true);
    try {
      switch (currentAction.type) {
        case 'approve':
          await approveClient(currentAction.clientId, actionNotes);
          break;
        case 'reject':
          if (!rejectionReason.trim()) {
            alert('Geef een reden voor afwijzing op');
            return;
          }
          await rejectClient(currentAction.clientId, rejectionReason);
          break;
      }
      setCurrentAction(null);
      setSelectedApprovals([]);
    } catch (error) {
      console.error('Action processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedApprovals.length === 0) return;

    setIsProcessing(true);
    try {
      if (action === 'approve') {
        await bulkApprove(selectedApprovals, actionNotes);
      } else {
        if (!rejectionReason.trim()) {
          alert('Geef een reden voor afwijzing op');
          return;
        }
        await bulkReject(selectedApprovals, rejectionReason);
      }
      setSelectedApprovals([]);
      setActionNotes('');
      setRejectionReason('');
    } catch (error) {
      console.error('Bulk action error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="outline" className="text-orange-600"><Clock className="w-3 h-3 mr-1" />Wachtend</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="text-blue-600"><Eye className="w-3 h-3 mr-1" />In Review</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Goedgekeurd</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Afgewezen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getValidationStatus = (approval: ClientApproval) => {
    const checks = approval.validationChecks as any || {};
    const validations = [
      { key: 'kvkValidated', label: 'KVK', status: checks.kvkValidated },
      { key: 'btwValidated', label: 'BTW', status: checks.btwValidated },
      { key: 'ibanValidated', label: 'IBAN', status: checks.ibanValidated },
      { key: 'emailConfirmed', label: 'Email', status: checks.emailConfirmed },
    ];

    return (
      <div className="flex space-x-1">
        {validations.map(({ key, label, status }) => (
          <Badge 
            key={key} 
            variant={status ? "default" : "secondary"}
            className={`text-xs ${status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            {label} {status ? '✓' : '✗'}
          </Badge>
        ))}
      </div>
    );
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.client?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.client?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
          Error: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wachtende Goedkeuringen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nieuwe Klanten (Week)</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newClientsThisWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Verstuurd (Vandaag)</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.emailsSentToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gem. Goedkeuringstijd</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageApprovalTime.toFixed(1)}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Klant Goedkeuringen</CardTitle>
          <CardDescription>
            Beheer klant registraties en goedkeuringen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Zoeken</Label>
              <Input
                id="search"
                placeholder="Zoek op naam, bedrijf of email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-48">
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING_APPROVAL">Wachtend</SelectItem>
                  <SelectItem value="UNDER_REVIEW">In Review</SelectItem>
                  <SelectItem value="APPROVED">Goedgekeurd</SelectItem>
                  <SelectItem value="REJECTED">Afgewezen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" onClick={refetch}>
                <Filter className="w-4 h-4 mr-2" />
                Ververs
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedApprovals.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedApprovals.length} geselecteerd
              </span>
              <Button 
                size="sm" 
                onClick={() => handleBulkAction('approve')}
                disabled={isProcessing}
              >
                <Check className="w-4 h-4 mr-1" />
                Bulk Goedkeuren
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleBulkAction('reject')}
                disabled={isProcessing}
              >
                <X className="w-4 h-4 mr-1" />
                Bulk Afwijzen
              </Button>
            </div>
          )}

          {/* Approvals Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedApprovals.length === filteredApprovals.length && filteredApprovals.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Klant</TableHead>
                  <TableHead>Bedrijf</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Validaties</TableHead>
                  <TableHead>Aangevraagd</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span>Laden...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredApprovals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Geen goedkeuringen gevonden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedApprovals.includes(approval.clientId)}
                          onCheckedChange={(checked) => handleSelectApproval(approval.clientId, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{approval.client?.name}</div>
                          <div className="text-sm text-gray-500">{approval.client?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{approval.client?.company || '-'}</div>
                          <div className="text-sm text-gray-500">
                            KVK: {approval.client?.kvkNumber || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{approval.client?.adminContactName || '-'}</div>
                          <div className="text-gray-500">{approval.client?.adminContactEmail || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(approval.status)}
                      </TableCell>
                      <TableCell>
                        {getValidationStatus(approval)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(approval.requestedAt).toLocaleDateString('nl-NL')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction({
                              type: 'view',
                              clientId: approval.clientId,
                              clientName: approval.client?.name || ''
                            })}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {approval.status === 'PENDING_APPROVAL' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAction({
                                  type: 'approve',
                                  clientId: approval.clientId,
                                  clientName: approval.client?.name || ''
                                })}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleAction({
                                  type: 'reject',
                                  clientId: approval.clientId,
                                  clientName: approval.client?.name || ''
                                })}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Pagina {pagination.page} van {pagination.pages} ({pagination.total} totaal)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(pagination.page - 1)}
                >
                  Vorige
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPage(pagination.page + 1)}
                >
                  Volgende
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!currentAction} onOpenChange={(open) => !open && setCurrentAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction?.type === 'approve' && 'Klant Goedkeuren'}
              {currentAction?.type === 'reject' && 'Klant Afwijzen'}
              {currentAction?.type === 'view' && 'Klant Details'}
            </DialogTitle>
            <DialogDescription>
              {currentAction?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentAction?.type === 'approve' && (
              <div className="space-y-2">
                <Label htmlFor="approvalNotes">Goedkeuringsnotities (optioneel)</Label>
                <Textarea
                  id="approvalNotes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Voeg eventuele notities toe..."
                  rows={3}
                />
              </div>
            )}

            {currentAction?.type === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Reden voor afwijzing *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Geef een duidelijke reden voor de afwijzing..."
                  rows={3}
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrentAction(null)}>
              Annuleren
            </Button>
            {currentAction?.type !== 'view' && (
              <Button 
                onClick={handleProcessAction}
                disabled={isProcessing}
                variant={currentAction?.type === 'reject' ? 'destructive' : 'default'}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : currentAction?.type === 'approve' ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                {currentAction?.type === 'approve' ? 'Goedkeuren' : 'Afwijzen'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
