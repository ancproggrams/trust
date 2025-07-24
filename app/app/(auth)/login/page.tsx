
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { isValidEmail } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, demoLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Vul alle velden in');
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError('Voer een geldig emailadres in');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Ongeldige inloggegevens');
      }
    } catch (error) {
      setError('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const success = await demoLogin();
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Demo login mislukt. Probeer het opnieuw.');
      }
    } catch (error) {
      setError('Er is een fout opgetreden bij demo login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white text-lg font-bold">
                  ZT
                </div>
                <span className="text-2xl font-bold text-gray-900">ZZP Trust</span>
              </div>
            </div>
            
            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Log in op je account
              </h1>
              <p className="body-text">
                Welkom terug! Voer je gegevens in om door te gaan.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  E-mailadres
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Wachtwoord
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inloggen...
                  </>
                ) : (
                  'Inloggen'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-muted-foreground">
                Nog geen account?{' '}
                <Link 
                  href="/register" 
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Registreer hier
                </Link>
              </p>
            </div>

            {/* Demo Login */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-muted-foreground mb-3">
                Wil je ZZP Trust eerst uitproberen?
              </p>
              <Button 
                type="button"
                variant="outline" 
                className="w-full h-12 text-base font-medium"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Demo wordt geladen...
                  </>
                ) : (
                  'Start Demo'
                )}
              </Button>
            </div>

            {/* Demo Info */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Demo: volledige functionaliteit met voorbeelddata
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
