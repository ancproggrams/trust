
'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '@/contexts/auth-context';

interface HeaderProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showNotifications?: boolean;
}

export function Header({ 
  title, 
  description, 
  searchPlaceholder = "Zoeken...",
  onSearch,
  showNotifications = true 
}: HeaderProps) {
  const { isDemo } = useAuth();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {isDemo && (
                <div className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                  Demo
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search - Hidden on mobile */}
            {onSearch && (
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={searchPlaceholder}
                  className="w-64 pl-10"
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            {showNotifications && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 px-0 touch-manipulation relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            )}

            {/* Mobile search trigger */}
            {onSearch && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden h-9 w-9 px-0 touch-manipulation"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
