
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  ArrowRight,
  Home,
  Mail
} from 'lucide-react';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/dashboard');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geen geldig bevestigingstoken gevonden.');
      return;
    }

    confirmEmail();
  }, [token]);

  const confirmEmail = async () => {
    try {
      const response = await fetch(`/api/confirm-email?token=${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email succesvol bevestigd!');
        setRedirectUrl(data.redirectUrl || '/dashboard');
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push(data.redirectUrl || '/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Er is een fout opgetreden bij het bevestigen van uw email.');
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      setStatus('error');
      setMessage('Er is een fout opgetreden. Probeer het opnieuw.');
    }
  };

  const retryConfirmation = () => {
    setStatus('loading');
    confirmEmail();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {status === 'loading' && (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                  <span>Email Bevestigen</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Bevestigd!</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span>Fout</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Uw email wordt bevestigd...'}
              {status === 'success' && 'Uw email adres is succesvol bevestigd'}
              {status === 'error' && 'Er is een probleem opgetreden'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {status === 'loading' && (
                <div className="text-center">
                  <p className="text-gray-600">
                    Even geduld terwijl we uw email bevestigen...
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">
                      {message}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">🎉 Wat gebeurt er nu?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Uw aanvraag wordt doorgestuurd naar ons team</li>
                      <li>• We controleren uw KVK en BTW gegevens</li>
                      <li>• U ontvangt binnen 24-48 uur een update</li>
                      <li>• Bij goedkeuring krijgt u volledige toegang</li>
                    </ul>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={() => router.push(redirectUrl)} className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Doorgaan naar Dashboard
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      U wordt automatisch doorgestuurd in 3 seconden...
                    </p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      {message}
                    </AlertDescription>
                  </Alert>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-medium text-yellow-900 mb-2">💡 Mogelijke oplossingen:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Controleer of de link volledig is geopend</li>
                      <li>• De link is mogelijk verlopen (geldig voor 24 uur)</li>
                      <li>• U heeft de email mogelijk al eerder bevestigd</li>
                      <li>• Vraag een nieuwe bevestigingsemail aan</li>
                    </ul>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={retryConfirmation} className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Opnieuw Proberen
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/')}>
                      <Home className="w-4 h-4 mr-2" />
                      Terug naar Home
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Hulp nodig?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@trust.io</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>+31 20 123 4567</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
