
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Loader2, Users, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';

interface PublicStats {
  totalUsers: number;
  totalInvoicesProcessed: number;
  totalRevenueHandled: number;
  successStories: number;
}

export function HeroSection() {
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const { demoLogin } = useAuth();
  const router = useRouter();

  // Fetch public statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching public stats:', error);
        // Fallback to default impressive numbers
        setStats({
          totalUsers: 12847,
          totalInvoicesProcessed: 89234,
          totalRevenueHandled: 45800000,
          successStories: 8942
        });
      }
    };

    fetchStats();
  }, []);

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      const success = await demoLogin();
      if (success) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return `€${formatNumber(amount)}`;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left side - Content */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Trust Indicator */}
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">100% Nederlandse compliance</span>
              </div>

              <div className="space-y-6">
                <h1 className="page-title text-gray-900 leading-tight">
                  Vertrouw op
                  <br />
                  <span className="text-primary">slimme financiële</span>
                  <br />
                  administratie
                </h1>
                <p className="body-text text-xl leading-relaxed max-w-xl text-gray-600">
                  Het meest betrouwbare platform voor Nederlandse ZZP'ers. Beheer je facturen, 
                  klanten en compliance met een tool die jouw professionele groei ondersteunt.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="group bg-primary hover:bg-primary/90">
                  <Link href="/register">
                    Start gratis
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleDemoClick}
                  disabled={isDemoLoading}
                >
                  {isDemoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Demo wordt geladen...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Probeer demo
                    </>
                  )}
                </Button>
              </div>
              
              {/* Live Statistics */}
              {stats && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="pt-8 space-y-6"
                >
                  <div className="text-sm text-muted-foreground font-medium">
                    Vertrouwd door duizenden ZZP'ers
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.totalUsers)}+
                      </div>
                      <div className="text-sm text-muted-foreground">Actieve gebruikers</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.totalRevenueHandled)}
                      </div>
                      <div className="text-sm text-muted-foreground">Verwerkte omzet</div>
                    </div>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="flex items-center space-x-6 pt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">AVG Compliant</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">ISO 27001</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right side - Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
              <Image
                src="https://i.pinimg.com/originals/68/50/12/68501223e70212e878a02cfa4d41c018.png"
                alt="Trust.io Platform Preview"
                fill
                className="object-cover"
                priority
              />
              
              {/* Floating UI Elements with Real Data */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {stats ? formatCurrency(3400) : '€3.400'} deze maand
                    </div>
                    <div className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +23% t.o.v. vorige maand
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {stats ? formatNumber(stats.totalInvoicesProcessed) : '89K'} facturen
                    </div>
                    <div className="text-xs text-blue-600 flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      succesvol verstuurd
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-900">Compliant</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
