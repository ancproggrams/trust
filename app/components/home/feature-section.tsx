
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
  Clock
} from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Factuur Beheer',
    description: 'Maak, verstuur en volg je facturen met eenvoud. Automatische herinneringen en betaalstatus tracking.',
  },
  {
    icon: Users,
    title: 'Klanten Database',
    description: 'Centraliseer al je klantinformatie. Van contactgegevens tot project geschiedenis op één plek.',
  },
  {
    icon: Calendar,
    title: 'Afspraken Planning',
    description: 'Plan en beheer al je afspraken. Automatische synchronisatie met je favoriete kalender app.',
  },
  {
    icon: FileText,
    title: 'Document Ondertekening',
    description: 'Verstuur contracten en krijg ze digitaal ondertekend. Volledig juridisch geldig en veilig.',
  },
  {
    icon: BarChart3,
    title: 'Inzichten & Rapportage',
    description: 'Krijg inzicht in je business met uitgebreide rapportages en real-time dashboard statistieken.',
  },
  {
    icon: Shield,
    title: 'Bank-niveau Beveiliging',
    description: 'Je data is volledig beveiligd met enterprise-grade encryptie en regelmatige security audits.',
  },
];

export function FeatureSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16">
          <h2 className="section-title text-gray-900">
            Alles wat je nodig hebt voor je ZZP business
          </h2>
          <p className="body-text text-xl max-w-3xl mx-auto">
            Een complete suite van tools die perfect samenwerken om je administratie 
            te vereenvoudigen en je business te laten groeien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white"
            >
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="card-title text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="body-text leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-gray-900">AVG Compliant</h4>
            <p className="text-sm text-muted-foreground">Volledig conform Europese privacy wetgeving</p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-gray-900">Bank-niveau Beveiliging</h4>
            <p className="text-sm text-muted-foreground">256-bit SSL encryptie en regelmatige audits</p>
          </div>
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <h4 className="font-semibold text-gray-900">24/7 Support</h4>
            <p className="text-sm text-muted-foreground">Nederlandse support team altijd beschikbaar</p>
          </div>
        </div>
      </div>
    </section>
  );
}
