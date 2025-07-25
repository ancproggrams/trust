
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const pricingPlans = [
  {
    name: 'Starter',
    price: '9,99',
    description: 'Perfect voor beginnende ZZP\'ers',
    popular: false,
    icon: Zap,
    features: [
      'Tot 25 facturen per maand',
      'Klantenbeheer (tot 50 klanten)',
      'Documentbeheer (2GB opslag)',
      'Basis compliance tools',
      'Email support'
    ],
    buttonText: 'Start met Starter',
    buttonVariant: 'outline' as const,
    highlight: 'Ideaal om te beginnen'
  },
  {
    name: 'Professional',
    price: '19,99',
    description: 'Voor groeiende ondernemingen',
    popular: true,
    icon: TrendingUp,
    features: [
      'Onbeperkt facturen en klanten',
      'Documentbeheer (10GB opslag)',
      'Volledige compliance suite',
      'Digitale handtekeningen',
      'Prioriteit support',
      'Real-time dashboards'
    ],
    buttonText: 'Kies Professional',
    buttonVariant: 'default' as const,
    highlight: 'Meest gekozen plan'
  },
  {
    name: 'Enterprise',
    price: '39,99',
    description: 'Voor gevestigde ondernemingen',
    popular: false,
    icon: Shield,
    features: [
      'Alles in Professional',
      'Documentbeheer (50GB opslag)',
      'API toegang voor integraties',
      'Dedicated account manager',
      'Telefoon support',
      'Custom rapportages'
    ],
    buttonText: 'Kies Enterprise',
    buttonVariant: 'outline' as const,
    highlight: 'Maximale controle'
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="section-title text-gray-900">
            Transparante prijzen voor elke fase van je bedrijf
          </h2>
          <p className="body-text text-xl max-w-2xl mx-auto text-gray-600">
            Kies het pakket dat bij jouw ambities past. Schakel eenvoudig over wanneer je groeit.
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">14 dagen gratis proberen • Geen setup kosten</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={plan.name} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-white px-4 py-1 text-sm font-medium shadow-lg">
                    <Star className="w-3 h-3 mr-1" />
                    Aanbevolen
                  </Badge>
                </div>
              )}
              
              <Card className={`
                relative h-full border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white
                ${plan.popular ? 'ring-2 ring-primary/20 shadow-lg scale-105' : ''}
              `}>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
                          plan.popular ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                        }`}>
                          <plan.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="card-title text-gray-900 text-xl">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-primary font-medium">
                            {plan.highlight}
                          </p>
                        </div>
                      </div>
                      
                      <p className="body-text text-muted-foreground">
                        {plan.description}
                      </p>
                      
                      {/* Price */}
                      <div className="space-y-2">
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                          <span className="text-lg text-muted-foreground ml-1">/maand</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Excl. BTW • Op elk moment opzegbaar
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                                <Check className="h-3 w-3" />
                              </div>
                            </div>
                            <span className="body-text text-gray-700 text-sm leading-relaxed">
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
                          ${plan.popular ? 'bg-primary hover:bg-primary/90 text-white shadow-lg' : 'border-primary text-primary hover:bg-primary hover:text-white'}
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
            </motion.div>
          ))}
        </div>

        {/* Additional Info & Trust Signals */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 space-y-8"
        >
          {/* Trust guarantees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-medium text-gray-900">Geen verborgen kosten</p>
              <p className="text-sm text-muted-foreground">Wat je ziet, is wat je betaalt</p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                <Shield className="h-5 w-5" />
              </div>
              <p className="font-medium text-gray-900">30 dagen geld terug</p>
              <p className="text-sm text-muted-foreground">Niet tevreden? Geld terug</p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="font-medium text-gray-900">Upgrade wanneer je wilt</p>
              <p className="text-sm text-muted-foreground">Schaal mee met je groei</p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="body-text text-lg text-gray-600">
              <strong>12.000+ Nederlandse ZZP'ers</strong> vertrouwen al op Trust.io. 
              Sluit je vandaag nog aan en transformeer jouw administratie.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/register">
                  Start je gratis proefperiode
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="mailto:contact@trust.io">
                  Vragen? Neem contact op
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
