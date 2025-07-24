
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload, Banknote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Registreer je account',
    description: 'Maak in 2 minuten een account aan en stel je profiel in. Geen creditcard nodig om te starten.',
  },
  {
    step: 2,
    icon: Upload,
    title: 'Upload je gegevens',
    description: 'Importeer je bestaande klanten en facturen of begin vanaf nul. Onze wizard helpt je stap voor stap.',
  },
  {
    step: 3,
    icon: Banknote,
    title: 'Word sneller betaald',
    description: 'Verstuur professionele facturen en ontvang betalingen tot 65% sneller dan voorheen.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16">
          <h2 className="section-title text-gray-900">
            Hoe werkt het?
          </h2>
          <p className="body-text text-xl max-w-2xl mx-auto">
            In drie eenvoudige stappen begin je met het professionaliseren van je ZZP administratie
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="space-y-6">
                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold">
                      {step.step}
                    </div>
                    
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-6 w-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="card-title text-gray-900">
                        {step.title}
                      </h3>
                      <p className="body-text leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-300">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Klaar om te beginnen?
            </h3>
            <p className="body-text">
              Sluit je aan bij duizenden tevreden ZZP'ers die hun administratie hebben vereenvoudigd
            </p>
            <Button asChild size="lg" className="group">
              <Link href="/register">
                Start je gratis proefperiode
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Geen creditcard nodig • 14 dagen gratis proberen • Op elk moment opzegbaar
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
