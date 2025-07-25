
'use client';

import { useAuth } from '@/contexts/auth-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard,
  Settings,
  LogOut,
  Building2,
  Receipt,
  Package,
  Shield,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    name: 'Overzicht',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Klanten',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    name: 'Facturen',
    href: '/dashboard/invoices',
    icon: CreditCard,
  },
  {
    name: 'Standaarddiensten',
    href: '/dashboard/services',
    icon: Package,
  },
  {
    name: 'Crediteuren',
    href: '/dashboard/creditors',
    icon: Building2,
    badge: () => {
      // TODO: Replace with actual API call
      return undefined;
    }
  },
  {
    name: 'BTW & Belasting',
    href: '/dashboard/tax',
    icon: Receipt,
    badge: () => {
      // TODO: Replace with actual API call  
      return undefined;
    }
  },
  {
    name: 'Documenten',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    name: 'Audit Trail',
    href: '/dashboard/audit',
    icon: Shield,
  },
  {
    name: 'Compliance',
    href: '/dashboard/compliance',
    icon: BarChart3,
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-colors">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-100 dark:border-gray-700 px-6">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold">
            T
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Trust.io</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const badgeText = item.badge ? item.badge() : undefined;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px]',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {badgeText && (
                <Badge 
                  variant={item.name === 'Crediteuren' ? 'destructive' : 'secondary'} 
                  className="ml-2 text-xs"
                >
                  {badgeText}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || 'Gebruiker'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <Separator className="dark:border-gray-700" />

        {/* Settings & Logout */}
        <div className="space-y-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px]',
              pathname === '/dashboard/settings'
                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <Settings className="mr-3 h-4 w-4" />
            Instellingen
          </Link>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[44px] touch-manipulation"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Uitloggen
          </Button>
        </div>
      </div>
    </div>
  );
}
