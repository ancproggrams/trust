
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Mail, Phone, MessageSquare, BookOpen, Video } from 'lucide-react';
import Link from 'next/link';

const helpTopics = [
  {
    icon: BookOpen,
    title: 'Aan de slag',
    description: 'Leer hoe je snel kunt starten met Trust.io',
    articles: ['Je eerste factuur maken', 'Klanten toevoegen', 'Profiel instellen']
  },
  {
    icon: HelpCircle,
    title: 'Veel gestelde vragen',
    description: 'Antwoorden op de meest voorkomende vragen',
    articles: ['BTW berekening', 'Factuur templates', 'Betalingsstatus']
  },
  {
    icon: Video,
    title: 'Video tutorials',
    description: 'Stap-voor-stap video handleidingen',
    articles: ['Platform overzicht', 'Geavanceerde functies', 'Compliance tools']
  },
];

const contactOptions = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Stuur ons een email en ontvang binnen 24 uur een reactie',
    action: 'contact@trust.io',
    available: '24/7'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat direct met ons support team',
    action: 'Start chat',
    available: 'Ma-Vr 9:00-18:00'
  },
  {
    icon: Phone,
    title: 'Telefoon Support',
    description: 'Bel ons voor directe hulp (Professional & Enterprise)',
    action: '+31 20 123 4567',
    available: 'Ma-Vr 9:00-17:00'
  },
];

export default function SupportPage() {
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
              Hoe kunnen we helpen?
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
              Ons Nederlandse support team staat klaar om je te helpen met al je vragen over Trust.io
            </p>
            
            {/* Quick Search */}
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <Input 
                  placeholder="Zoek in onze kennisbank..." 
                  className="pl-10 pr-4 py-3 text-lg"
                />
                <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Help Topics */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Populaire onderwerpen
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Vind snel antwoorden op veel voorkomende vragen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {helpTopics.map((topic, index) => (
                <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                      <topic.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                    <p className="text-muted-foreground">{topic.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {topic.articles.map((article, articleIndex) => (
                        <li key={articleIndex}>
                          <Link 
                            href="#" 
                            className="text-sm text-primary hover:underline block py-1"
                          >
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-24 bg-gray-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6 mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Neem contact op
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nog steeds vragen? Ons Nederlandse support team helpt je graag verder
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {contactOptions.map((option, index) => (
                <Card key={index} className="text-center border-0 shadow-sm">
                  <CardContent className="p-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                      <option.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {option.description}
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full">
                        {option.action}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        {option.available}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Stuur ons een bericht</CardTitle>
                  <p className="text-muted-foreground">
                    We reageren binnen 24 uur op je vraag
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Naam *
                      </label>
                      <Input placeholder="Je volledige naam" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input type="email" placeholder="je@email.nl" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Onderwerp *
                    </label>
                    <Input placeholder="Waar gaat je vraag over?" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bericht *
                    </label>
                    <Textarea 
                      placeholder="Beschrijf je vraag zo gedetailleerd mogelijk..."
                      rows={6}
                    />
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Verstuur bericht
                  </Button>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Door dit formulier te versturen ga je akkoord met onze{' '}
                    <Link href="#" className="text-primary hover:underline">
                      privacyverklaring
                    </Link>
                  </p>
                </CardContent>
              </Card>
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
