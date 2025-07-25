
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ClientApproval, AdminDashboardStats } from '@/lib/types';

interface UseAdminApprovalsReturn {
  approvals: ClientApproval[];
  stats: AdminDashboardStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  approveClient: (clientId: string, notes?: string) => Promise<void>;
  rejectClient: (clientId: string, reason: string) => Promise<void>;
  bulkApprove: (clientIds: string[], notes?: string) => Promise<void>;
  bulkReject: (clientIds: string[], reason: string) => Promise<void>;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
}

export function useAdminApprovals(
  initialStatus: string = 'PENDING_APPROVAL',
  initialLimit: number = 10
): UseAdminApprovalsReturn {
  const [approvals, setApprovals] = useState<ClientApproval[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/admin/approvals', window.location.origin);
      url.searchParams.set('status', initialStatus);
      url.searchParams.set('page', pagination.page.toString());
      url.searchParams.set('limit', pagination.limit.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch approvals');
      }

      const data = await response.json();
      setApprovals(data.approvals || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));

    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  }, [initialStatus, pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data.stats);

    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
    fetchStats();
  }, [fetchApprovals, fetchStats]);

  const approveClient = useCallback(async (clientId: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          action: 'approve',
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve client');
      }

      // Refresh data
      await fetchApprovals();
      await fetchStats();

    } catch (err) {
      console.error('Error approving client:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve client');
      throw err;
    }
  }, [fetchApprovals, fetchStats]);

  const rejectClient = useCallback(async (clientId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          action: 'reject',
          rejectionReason: reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject client');
      }

      // Refresh data
      await fetchApprovals();
      await fetchStats();

    } catch (err) {
      console.error('Error rejecting client:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject client');
      throw err;
    }
  }, [fetchApprovals, fetchStats]);

  const bulkApprove = useCallback(async (clientIds: string[], notes?: string) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds,
          action: 'approve',
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk approve clients');
      }

      // Refresh data
      await fetchApprovals();
      await fetchStats();

    } catch (err) {
      console.error('Error bulk approving clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to bulk approve clients');
      throw err;
    }
  }, [fetchApprovals, fetchStats]);

  const bulkReject = useCallback(async (clientIds: string[], reason: string) => {
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIds,
          action: 'reject',
          rejectionReason: reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bulk reject clients');
      }

      // Refresh data
      await fetchApprovals();
      await fetchStats();

    } catch (err) {
      console.error('Error bulk rejecting clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to bulk reject clients');
      throw err;
    }
  }, [fetchApprovals, fetchStats]);

  const refetch = useCallback(async () => {
    await fetchApprovals();
    await fetchStats();
  }, [fetchApprovals, fetchStats]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  return {
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
  };
}
