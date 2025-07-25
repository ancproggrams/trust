
'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { getCurrentLanguage, setLanguage, type LanguageCode } from '../i18n/config';

// Enhanced useTranslation hook with additional utilities
export function useTranslation(namespace?: string) {
  const { t, i18n, ready } = useI18nTranslation(namespace);
  
  return {
    t,
    i18n,
    ready,
    currentLanguage: getCurrentLanguage(),
    changeLanguage: (lng: LanguageCode) => setLanguage(lng),
    isLoading: !ready,
  };
}

// Specialized hooks for specific namespaces
export const useCommonTranslation = () => useTranslation('common');
export const useDashboardTranslation = () => useTranslation('dashboard');
export const useAuthTranslation = () => useTranslation('auth');
export const useFormsTranslation = () => useTranslation('forms');
export const useInvoiceTranslation = () => useTranslation('invoice');
export const useAuditTranslation = () => useTranslation('audit');
export const useComplianceTranslation = () => useTranslation('compliance');

// Utility functions for common translation patterns
export function translateStatus(status: string, t: any): string {
  return t(`status.${status}`, status);
}

export function translateField(field: string, t: any): string {
  return t(`fields.${field}`, field);
}

export function translateAction(action: string, t: any): string {
  return t(`actions.${action}`, action);
}

export function translateBusinessType(type: string, t: any): string {
  return t(`businessTypes.${type}`, type);
}

// Error message translator
export function translateError(error: string, t: any): string {
  return t(`messages.${error}`, error);
}

// Date/time formatters with localization
export function formatDate(date: Date, locale?: string): string {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.DateTimeFormat(currentLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date, locale?: string): string {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.DateTimeFormat(currentLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(amount: number, currency = 'EUR', locale?: string): string {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(number: number, locale?: string): string {
  const currentLocale = locale || getCurrentLanguage();
  
  return new Intl.NumberFormat(currentLocale).format(number);
}

// Relative time formatter
export function formatRelativeTime(date: Date, locale?: string): string {
  const currentLocale = locale || getCurrentLanguage();
  const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' });
  
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffInDays) < 1) {
    const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
    if (Math.abs(diffInHours) < 1) {
      const diffInMinutes = Math.round(diffInMs / (1000 * 60));
      return rtf.format(diffInMinutes, 'minute');
    }
    return rtf.format(diffInHours, 'hour');
  }
  
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, 'day');
  }
  
  const diffInMonths = Math.round(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return rtf.format(diffInMonths, 'month');
  }
  
  const diffInYears = Math.round(diffInDays / 365);
  return rtf.format(diffInYears, 'year');
}
