
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
  loading?: boolean;
  error?: string;
}

export function EnhancedStatsCard({
  title,
  value,
  description,
  icon,
  trend,
  status,
  action,
  loading,
  error
}: EnhancedStatsCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              Error loading {title.toLowerCase()}: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-center justify-between">
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>...</span>
                </div>
              ) : (
                value
              )}
            </div>
            
            {trend && (
              <div className={`flex items-center space-x-1 text-xs ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {/* Trend Label */}
          {trend && (
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          )}

          {/* Status Badge */}
          {status && (
            <div className="flex items-center justify-between">
              <Badge 
                variant={status === 'error' ? 'destructive' : 'outline'}
                className={`text-xs ${getStatusColor()}`}
              >
                {status === 'success' && 'Alles OK'}
                {status === 'warning' && 'Aandacht Vereist'}
                {status === 'error' && 'Actie Nodig'}
                {status === 'info' && 'Info'}
              </Badge>
            </div>
          )}

          {/* Action Button */}
          {action && !loading && (
            <Button 
              size="sm" 
              variant={status === 'error' ? 'destructive' : 'outline'}
              className="w-full text-xs"
              onClick={action.onClick}
            >
              {action.label}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
