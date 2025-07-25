
'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, setLanguage, getCurrentLanguage, saveLanguagePreference, type LanguageCode } from '../../lib/i18n/config';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  align?: 'start' | 'end' | 'center';
  showFlag?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'default',
  align = 'end',
  showFlag = true,
  className = ''
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  
  const currentLang = getCurrentLanguage();
  const currentLanguageInfo = LANGUAGES.find(lang => lang.code === currentLang);

  const handleLanguageChange = async (langCode: LanguageCode) => {
    if (langCode === currentLang || isChanging) return;
    
    setIsChanging(true);
    
    try {
      await setLanguage(langCode);
      saveLanguagePreference(langCode);
      
      // Force page reload for complete language change
      window.location.reload();
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const renderTriggerContent = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <div className="flex items-center justify-center">
            <Globe className="h-4 w-4" />
          </div>
        );
      
      case 'compact':
        return (
          <div className="flex items-center space-x-2">
            {showFlag && currentLanguageInfo && (
              <span className="text-sm">{currentLanguageInfo.flag}</span>
            )}
            <span className="text-sm font-medium">
              {currentLanguageInfo?.code.toUpperCase()}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </div>
        );
      
      default:
        return (
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            {showFlag && currentLanguageInfo && (
              <span>{currentLanguageInfo.flag}</span>
            )}
            <span className="font-medium">
              {currentLanguageInfo?.name || 'Language'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={variant === 'compact' || variant === 'icon-only' ? 'sm' : 'default'}
          className={`${className} ${isChanging ? 'opacity-50' : ''}`}
          disabled={isChanging}
        >
          {renderTriggerContent()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align={align} className="w-56">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              {showFlag && (
                <span className="text-base">{language.flag}</span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{language.name}</span>
                <span className="text-xs text-muted-foreground">
                  {language.code.toUpperCase()}
                </span>
              </div>
            </div>
            
            {currentLang === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile/header use
export function CompactLanguageSwitcher({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher
      variant="compact"
      align="end"
      showFlag={true}
      className={className}
    />
  );
}

// Icon-only version for minimal UI
export function IconLanguageSwitcher({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher
      variant="icon-only"
      align="end"
      showFlag={false}
      className={className}
    />
  );
}
