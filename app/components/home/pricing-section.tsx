
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

const pricingPlans = [
  {
    name: 'Starter',
    price: '9,99',
    description: 'Perfect voor beginnende ZZP\'ers',
    popular: false,
    features: [
      'Facturenbeheer (max 10 per maand)',
      'Klantenbeheer (max 20 klanten)',
      'Documentbeheer (1GB opslag)',
      'Email support'
    ],
    buttonText: 'Kies Starter',
    buttonVariant: 'secondary' as const
  },
  {
    name: 'Professional',
    price: '19,99',
    description: 'Voor groeiende ondernemingen',
    popular: true,
    features: [
      'Onbeperkt facturen',
      'Onbeperkt klanten',
      'Documentbeheer (5GB opslag)',
      'Afsprakenbeheer',
      'Prioriteit support'
    ],
    buttonText: 'Kies Professional',
    buttonVariant: 'default' as const
  },
  {
    name: 'Enterprise',
    price: '39,99',
    description: 'Voor gevestigde ondernemingen',
    popular: false,
    features: [
      'Alles in Professional',
      'Documentbeheer (20GB opslag)',
      'API toegang',
      'Dedicated account manager',
      'Telefoon support'
    ],
    buttonText: 'Kies Enterprise',
    buttonVariant: 'secondary' as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16">
          <h2 className="section-title text-gray-900">
            Eenvoudige prijzen
          </h2>
          <p className="body-text text-xl max-w-2xl mx-auto">
            Kies het pakket dat bij u past. Geen verborgen kosten.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {pricingPlans.map((plan, index) => (
            <div key={plan.name} className="relative">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white px-4 py-1 text-sm font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    Aanbevolen
                  </Badge>
                </div>
              )}
              
              <Card className={`
                relative h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white
                ${plan.popular ? 'ring-2 ring-primary/20 shadow-lg' : ''}
              `}>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                      <h3 className="card-title text-gray-900 text-2xl">
                        {plan.name}
                      </h3>
                      <p className="body-text text-muted-foreground">
                        {plan.description}
                      </p>
                      
                      {/* Price */}
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                          <span className="text-xl text-muted-foreground ml-1">/maand</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                                <Check className="h-3 w-3" />
                              </div>
                            </div>
                            <span className="ml-3 body-text text-gray-700 text-sm leading-relaxed">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Button */}
                    <div className="pt-4">
                      <Button 
                        asChild 
                        variant={plan.buttonVariant}
                        className={`
                          w-full group
                          ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white' : ''}
                        `}
                        size="lg"
                      >
                        <Link href="/register">
                          {plan.buttonText}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="body-text text-muted-foreground">
            Alle pakketten bevatten een 14-dagen gratis proefperiode
          </p>
          <p className="text-sm text-muted-foreground">
            Geen setup kosten • Op elk moment opzegbaar • Nederlandse support
          </p>
        </div>
      </div>
    </section>
  );
}
