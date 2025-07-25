
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Zap, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Start in 2 minuten',
    description: 'Registreer je gratis account en voltooi je profiel. Geen creditcard nodig, direct toegang tot alle functies.',
    features: ['Gratis account', 'Volledige functionaliteit', 'Nederlandse support']
  },
  {
    step: 2,
    icon: Zap,
    title: 'Automatiseer alles',
    description: 'Importeer je bestaande gegevens of begin vanaf nul. Onze AI-wizard helpt je optimaal te starten.',
    features: ['Smart import', 'AI-ondersteuning', 'Persoonlijke setup']
  },
  {
    step: 3,
    icon: TrendingUp,
    title: 'Groei sneller',
    description: 'Ontvang betalingen tot 65% sneller, bespaar 8+ uren per week en focus op wat echt belangrijk is.',
    features: ['65% sneller betaald', '8+ uur besparing/week', 'Meer focus op kernactiviteiten']
  },
];

export function HowItWorksSection() {
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
            Van registratie tot succes in 3 stappen
          </h2>
          <p className="body-text text-xl max-w-2xl mx-auto text-gray-600">
            Duizenden ZZP'ers gingen je voor. Sluit je aan bij de Trust.io community 
            en transformeer jouw administratie vandaag nog.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div 
              key={step.step} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="border-0 shadow-sm bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Step Number & Icon */}
                    <div className="flex items-center space-x-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold">
                        {step.step}
                      </div>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                        <step.icon className="h-6 w-6" />
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="card-title text-gray-900">
                        {step.title}
                      </h3>
                      <p className="body-text leading-relaxed text-gray-600">
                        {step.description}
                      </p>
                      
                      {/* Features */}
                      <ul className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-primary/30">
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-primary/5 via-blue-50 to-primary/5 rounded-3xl p-12">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900">
                  Klaar om jouw administratie te transformeren?
                </h3>
                <p className="body-text text-lg max-w-2xl mx-auto text-gray-600">
                  Sluit je aan bij meer dan 12.000+ tevreden Nederlandse ZZP'ers die 
                  hun financiële administratie hebben vereenvoudigd met Trust.io
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="group bg-primary hover:bg-primary/90">
                  <Link href="/register">
                    Start gratis vandaag
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <Link href="#" onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('.hero-demo-button')?.dispatchEvent(new Event('click'));
                  }}>
                    Bekijk demo eerst
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Geen creditcard nodig</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>14 dagen gratis proberen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Op elk moment opzegbaar</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
