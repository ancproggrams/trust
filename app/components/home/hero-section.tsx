
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';

export function HeroSection() {
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { demoLogin } = useAuth();
  const router = useRouter();

  const handleDemoClick = async () => {
    setIsDemoLoading(true);
    try {
      const success = await demoLogin();
      if (success) {
        router.push('/dashboard');
      } else {
        // Fallback: redirect to login page
        router.push('/login');
      }
    } catch (error) {
      // Fallback: redirect to login page
      router.push('/login');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50/30">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left side - Content */}
          <div className="relative">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="page-title text-gray-900 leading-tight">
                  Het elegantste
                  <br />
                  <span className="text-primary">dashboard</span>
                  <br />
                  voor ZZP'ers
                </h1>
                <p className="body-text text-xl leading-relaxed max-w-xl">
                  Beheer je facturen, klanten, afspraken en documenten met de meest intuïtieve en 
                  elegante tool die speciaal is ontworpen voor Nederlandse ZZP'ers.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="group">
                  <Link href="/register">
                    Start nu
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="group"
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
                      Bekijk demo
                    </>
                  )}
                </Button>
              </div>
              
              <div className="pt-8 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Vertrouwd door meer dan 10.000+ ZZP'ers
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-xs font-medium text-primary">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-3">en nog veel meer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Hero Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
              <Image
                src="https://i.pinimg.com/originals/68/50/12/68501223e70212e878a02cfa4d41c018.png"
                alt="ZZP Trust Dashboard Preview"
                fill
                className="object-cover"
                priority
              />
              
              {/* Floating UI Elements */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">€25.750 omzet</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">3 afspraken</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
