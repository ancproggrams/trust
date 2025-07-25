
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  ArrowRight, 
  AlertTriangle,
  RefreshCw,
  Home,
  User,
  Building,
  Phone,
  MapPin
} from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
  email: string;
  company?: string;
  onboardingStatus: string;
  emailConfirmed: boolean;
  approvalStatus: string;
}

export default function OnboardingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams?.get('clientId');
  
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!clientId) {
      setError('Geen client ID gevonden');
      setLoading(false);
      return;
    }

    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Client niet gevonden');
      }
      
      const data = await response.json();
      setClient(data.client);
      setEmailSent(data.client.onboardingStatus === 'EMAIL_SENT');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!client) return null;

    switch (client.onboardingStatus) {
      case 'EMAIL_SENT':
        return {
          icon: <Mail className="w-6 h-6 text-blue-500" />,
          title: 'Bevestigingsemail verstuurd',
          description: 'Controleer uw inbox en klik op de bevestigingslink',
          color: 'blue',
          nextStep: 'Email bevestigen'
        };
      case 'CLIENT_CONFIRMED':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          title: 'Email bevestigd',
          description: 'Uw aanvraag wordt nu beoordeeld door ons team',
          color: 'green',
          nextStep: 'Wachten op goedkeuring'
        };
      case 'ADMIN_REVIEW':
        return {
          icon: <Clock className="w-6 h-6 text-orange-500" />,
          title: 'In behandeling',
          description: 'Ons team beoordeelt uw aanvraag',
          color: 'orange',
          nextStep: 'Wachten op beslissing'
        };
      case 'APPROVED':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          title: 'Goedgekeurd!',
          description: 'Uw account is geactiveerd',
          color: 'green',
          nextStep: 'Naar dashboard'
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-gray-500" />,
          title: 'Registratie ontvangen',
          description: 'Uw registratie wordt verwerkt',
          color: 'gray',
          nextStep: 'Verwerking bezig'
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Laden...</span>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Er is een fout opgetreden'}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Terug naar home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bedankt voor uw registratie!
          </h1>
          <p className="text-gray-600">
            Uw aanvraag is succesvol ontvangen en wordt nu verwerkt.
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {statusInfo?.icon}
              <span>{statusInfo?.title}</span>
            </CardTitle>
            <CardDescription>
              {statusInfo?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['EMAIL_SENT', 'CLIENT_CONFIRMED', 'ADMIN_REVIEW', 'APPROVED'].includes(client.onboardingStatus)
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email Verstuurd</p>
                    <p className="text-xs text-gray-500">Bevestiging</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['CLIENT_CONFIRMED', 'ADMIN_REVIEW', 'APPROVED'].includes(client.onboardingStatus)
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bevestigd</p>
                    <p className="text-xs text-gray-500">Email geklikt</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['ADMIN_REVIEW', 'APPROVED'].includes(client.onboardingStatus)
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Beoordeling</p>
                    <p className="text-xs text-gray-500">Admin review</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    client.onboardingStatus === 'APPROVED'
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Goedgekeurd</p>
                    <p className="text-xs text-gray-500">Account actief</p>
                  </div>
                </div>
              </div>

              {/* Current Status Alert */}
              <Alert className={`border-${statusInfo?.color}-200 bg-${statusInfo?.color}-50`}>
                <AlertDescription className={`text-${statusInfo?.color}-700`}>
                  <strong>Volgende stap:</strong> {statusInfo?.nextStep}
                </AlertDescription>
              </Alert>

              {/* Client Info Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Uw Registratie Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{client.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{client.email}</span>
                  </div>
                  {client.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{client.company}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {client.onboardingStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wat gebeurt er nu?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.onboardingStatus === 'EMAIL_SENT' && (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    We hebben een bevestigingsemail gestuurd naar <strong>{client.email}</strong>.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📧 Controleer uw email</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Kijk in uw inbox (en spam folder)</li>
                      <li>• Klik op de bevestigingslink</li>
                      <li>• U wordt teruggeleid naar het platform</li>
                    </ul>
                  </div>
                </div>
              )}

              {client.onboardingStatus === 'CLIENT_CONFIRMED' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✅ Email bevestigd!</h4>
                  <p className="text-sm text-green-800">
                    Uw aanvraag wordt nu doorgestuurd naar ons administratie team voor finale beoordeling.
                    U ontvangt binnen 24-48 uur een update.
                  </p>
                </div>
              )}

              {client.onboardingStatus === 'ADMIN_REVIEW' && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">👨‍💼 In behandeling</h4>
                  <p className="text-sm text-orange-800">
                    Ons team beoordeelt momenteel uw KVK gegevens, BTW nummer en overige informatie.
                    U ontvangt een email zodra de beoordeling is afgerond.
                  </p>
                </div>
              )}

              {client.onboardingStatus === 'APPROVED' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🎉 Account goedgekeurd!</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Gefeliciteerd! Uw Trust.io account is volledig geactiveerd en u kunt nu gebruik maken 
                    van alle functies.
                  </p>
                  <Button onClick={() => router.push('/dashboard')} className="bg-green-600 hover:bg-green-700">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Naar Dashboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hulp nodig?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">📞 Telefoon Support</h4>
                <p className="text-sm text-gray-600">+31 20 123 4567</p>
                <p className="text-xs text-gray-500">Ma-Vr 9:00-17:00</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📧 Email Support</h4>
                <p className="text-sm text-gray-600">support@trust.io</p>
                <p className="text-xs text-gray-500">Reactie binnen 4 uur</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            Terug naar Home
          </Button>
        </div>
      </div>
    </div>
  );
}
