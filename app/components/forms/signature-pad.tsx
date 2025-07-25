
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Pen, 
  RotateCcw, 
  Check, 
  X, 
  Clock,
  Shield,
  MapPin,
  User
} from 'lucide-react';
import { SignatureType } from '@/lib/types';

interface SignaturePadProps {
  onSignatureComplete: (signatureData: string, signatureType: SignatureType) => void;
  onCancel?: () => void;
  signerName: string;
  signerEmail: string;
  documentTitle: string;
  isRequired?: boolean;
  className?: string;
}

export function SignaturePad({
  onSignatureComplete,
  onCancel,
  signerName,
  signerEmail,
  documentTitle,
  isRequired = true,
  className = ''
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureType>('DRAWN');
  const [typedSignature, setTypedSignature] = useState('');
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    // Get user location for legal validity
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.warn('Could not get location:', error);
          setLocation('Location not available');
        }
      );
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setTypedSignature('');
  };

  const handleTypedSignatureChange = (value: string) => {
    setTypedSignature(value);
    setHasSignature(value.length > 0);
    
    // Draw typed signature on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (value) {
      ctx.font = '32px cursive';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText(value, canvas.width / 2, canvas.height / 2 + 10);
    }
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;

    const signatureData = canvas.toDataURL('image/png');
    onSignatureComplete(signatureData, signatureType);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Document and Signer Info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Digitale Handtekening
            </CardTitle>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleString('nl-NL')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Ondertekenaar:</span>
              </div>
              <div className="ml-6 space-y-1">
                <div>{signerName}</div>
                <div className="text-gray-600">{signerEmail}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Locatie:</span>
              </div>
              <div className="ml-6 text-gray-600">
                {location || 'Wordt geladen...'}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-sm">Document:</div>
            <div className="text-sm text-gray-600">{documentTitle}</div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Type Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Handtekening Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={signatureType === 'DRAWN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSignatureType('DRAWN');
                clearSignature();
              }}
              className="flex items-center gap-2"
            >
              <Pen className="h-4 w-4" />
              Tekenen
            </Button>
            <Button
              variant={signatureType === 'TYPED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSignatureType('TYPED');
                clearSignature();
              }}
              className="flex items-center gap-2"
            >
              Typen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signature Input */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {signatureType === 'DRAWN' ? 'Teken uw handtekening' : 'Type uw handtekening'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Wissen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {signatureType === 'TYPED' && (
            <div className="space-y-2">
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => handleTypedSignatureChange(e.target.value)}
                placeholder="Typ uw volledige naam"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontFamily: 'cursive' }}
              />
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-48 cursor-crosshair rounded-lg"
              onMouseDown={signatureType === 'DRAWN' ? startDrawing : undefined}
              onMouseMove={signatureType === 'DRAWN' ? draw : undefined}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-gray-400 text-center">
                  <Pen className="h-8 w-8 mx-auto mb-2" />
                  <div>
                    {signatureType === 'DRAWN' 
                      ? 'Klik en sleep om uw handtekening te tekenen'
                      : 'Typ uw naam hierboven om een handtekening te genereren'
                    }
                  </div>
                </div>
              </div>
            )}
          </div>

          {hasSignature && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Handtekening vastgelegd. Controleer uw handtekening voordat u bevestigt.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Juridische geldigheid:</strong> Door te ondertekenen bevestigt u dat u de inhoud van het document heeft gelezen en akkoord gaat met alle voorwaarden. Deze digitale handtekening heeft dezelfde juridische waarde als een handgeschreven handtekening conform de Nederlandse wetgeving.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Annuleren
          </Button>
        )}

        <Button
          onClick={confirmSignature}
          disabled={!hasSignature}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Check className="h-4 w-4" />
          Handtekening Bevestigen
        </Button>
      </div>
    </div>
  );
}

