
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, ArrowRight, TrendingUp, Users, CreditCard } from 'lucide-react';
import { LiveStatsChart } from '@/components/dashboard/live-stats-chart';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export function DemoPreviewSection() {
  const [publicStats, setPublicStats] = useState(null);
  const { demoLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await fetch('/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setPublicStats(data);
        }
      } catch (error) {
        console.error('Error fetching public stats:', error);
      }
    };

    fetchPublicStats();
  }, []);

  const handleDemoClick = async () => {
    try {
      const success = await demoLogin();
      if (success) {
        router.push('/dashboard');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="section-title text-gray-900">
            Zie Trust.io in actie
          </h2>
          <p className="body-text text-xl max-w-2xl mx-auto text-gray-600">
            Ontdek hoe Trust.io jouw financiële administratie transformeert. 
            Bekijk live data van onze groeiende community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Live Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <LiveStatsChart showTitle={false} />
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-900">12K+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Tevreden ZZP'ers</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">89K+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Facturen verstuurd</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Right side - Demo CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Probeer Trust.io <span className="text-primary">gratis</span>
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Geen creditcard nodig. Krijg direct toegang tot alle functies en 
                ontdek waarom duizenden ZZP'ers vertrouwen op Trust.io.
              </p>
              
              <div className="space-y-4">
                {[
                  'Volledige functionaliteit beschikbaar',
                  'Real-time inzichten en rapportages',
                  'Nederlandse compliance gegarandeerd',
                  'Persoonlijke onboarding begeleiding'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 group"
                onClick={handleDemoClick}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Start gratis demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Demo duurt 2 minuten • Geen verplichtingen • Direct toegang
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
