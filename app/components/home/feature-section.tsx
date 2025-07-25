
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Calendar, 
  CreditCard, 
  Shield, 
  BarChart3,
  CheckCircle,
  Clock,
  Zap,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: CreditCard,
    title: 'Slimme Facturatie',
    description: 'Maak, verstuur en volg je facturen automatisch. Ontvang betalingen 65% sneller met onze geoptimaliseerde workflows.',
  },
  {
    icon: Users,
    title: 'Klantenbeheer',
    description: 'Centraliseer al je klantinformatie in één overzichtelijk systeem. Van contactgegevens tot project historie.',
  },
  {
    icon: Shield,
    title: 'Compliance & Veiligheid',
    description: 'Automatische AVG, Wwft en BTW compliance. Digitale handtekeningen en bank-niveau beveiliging inbegrepen.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Inzichten',
    description: 'Krijg direct inzicht in je cashflow, belastingverplichtingen en bedrijfsprestaties met live dashboards.',
  },
  {
    icon: FileText,
    title: 'Digitale Contracten',
    description: 'Verstuur contracten en ontvang ze digitaal ondertekend. Volledig juridisch geldig volgens Nederlandse wet.',
  },
  {
    icon: Zap,
    title: 'Automatisering',
    description: 'Bespaar uren per week met slimme automatisering van repetitieve administratieve taken.',
  },
];

const trustIndicators = [
  {
    icon: CheckCircle,
    title: 'AVG & Wwft Compliant',
    description: 'Volledig conform Nederlandse en Europese wetgeving',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Bank-niveau Beveiliging',
    description: '256-bit SSL encryptie en regelmatige security audits',
    color: 'blue'
  },
  {
    icon: Heart,
    title: 'Nederlandse Support',
    description: 'Lokaal support team dat jouw business begrijpt',
    color: 'red'
  },
];

export function FeatureSection() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-16"
        >
          <h2 className="section-title text-gray-900">
            Alles wat je nodig hebt voor jouw ZZP succes
          </h2>
          <p className="body-text text-xl max-w-3xl mx-auto text-gray-600">
            Trust.io combineert krachtige financiële tools met gebruiksvriendelijkheid. 
            Focus op wat je het beste doet, wij zorgen voor de rest.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white h-full">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="card-title text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="body-text leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {trustIndicators.map((indicator, index) => (
            <div key={index} className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${indicator.color}-100 text-${indicator.color}-600`}>
                <indicator.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{indicator.title}</h4>
                <p className="text-sm text-muted-foreground">{indicator.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Additional Social Proof */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-sm font-medium text-primary">
                    {String.fromCharCode(65 + i - 1)}
                  </div>
                ))}
              </div>
              <span className="text-2xl">⭐⭐⭐⭐⭐</span>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              "Trust.io heeft mijn administratie volledig getransformeerd"
            </p>
            <p className="text-sm text-muted-foreground">
              Gemiddelde beoordeling van 4.9/5 sterren van meer dan 12.000+ Nederlandse ZZP'ers
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
