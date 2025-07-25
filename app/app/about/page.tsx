
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Target, Award, Heart, Zap } from 'lucide-react';
import Link from 'next/link';

const values = [
  {
    icon: Shield,
    title: 'Vertrouwen',
    description: 'We bouwen aan een platform waar Nederlandse ZZP\'ers volledig op kunnen vertrouwen voor hun financiële administratie.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Onze community van 12.000+ ZZP\'ers staat centraal. Samen bouwen we aan betere tools voor ondernemers.',
  },
  {
    icon: Target,
    title: 'Focus',
    description: 'Wij zorgen voor de administratie, zodat jij je kunt focussen op wat je het beste doet: ondernemen.',
  },
];

const team = [
  {
    name: 'Sarah van der Berg',
    role: 'CEO & Founder',
    description: 'Voormalig ZZP\'er met 10+ jaar ervaring in fintech en een passie voor ondernemerschap.',
  },
  {
    name: 'Mark Janssen',
    role: 'CTO & Co-founder',
    description: 'Expert in financiële compliance systemen en Nederlandse wetgeving automatisering.',
  },
  {
    name: 'Lisa de Vries',
    role: 'Head of Customer Success',
    description: 'Voormalig accountant gespecialiseerd in ZZP administratie en klantervaring.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold">
                T
              </div>
              <span className="text-xl font-bold text-gray-900">Trust.io</span>
            </Link>
            <Button asChild>
              <Link href="/">Terug naar home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-24 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Over Trust.io
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Wij geloven dat elke Nederlandse ZZP'er toegang moet hebben tot 
              professionele financiële tools. Trust.io is ontstaan uit frustratie 
              over ingewikkelde en dure administratiesoftware.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Onze missie
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Wij maken financiële administratie toegankelijk, betrouwbaar en 
                  simpel voor elke Nederlandse ZZP'er. Door slim gebruik van technologie 
                  automatiseren we complexe processen en zorgen we voor volledige compliance.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ons doel? Dat jij je kunt focussen op ondernemen, terwijl wij zorgen 
                  dat je administratie perfect op orde is.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <Card className="text-center p-6">
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold text-primary">12K+</div>
                    <p className="text-sm text-muted-foreground">Tevreden klanten</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold text-primary">89K+</div>
                    <p className="text-sm text-muted-foreground">Facturen verstuurd</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold text-primary">€45M+</div>
                    <p className="text-sm text-muted-foreground">Verwerkte omzet</p>
                  </CardContent>
                </Card>
                <Card className="text-center p-6">
                  <CardContent className="space-y-2">
                    <div className="text-3xl font-bold text-primary">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Onze waarden
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Deze principes sturen alles wat we doen bij Trust.io
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center border-0 shadow-sm">
                  <CardContent className="p-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                      <value.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Ons team
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ontmoet de mensen achter Trust.io - experts in fintech, compliance en ZZP ondersteuning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center border-0 shadow-sm">
                  <CardContent className="p-8 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium mb-3">
                        {member.role}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        {member.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-primary">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Sluit je aan bij de Trust.io community
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Word onderdeel van 12.000+ Nederlandse ZZP'ers die hun administratie hebben vereenvoudigd
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">
                  Start gratis
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                <Link href="/">
                  Meer informatie
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold">
                T
              </div>
              <span className="text-xl font-bold">Trust.io</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Trust.io. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
