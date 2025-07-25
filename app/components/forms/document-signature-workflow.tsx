
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Pen, 
  Check, 
  Clock, 
  Shield,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  User,
  Calendar
} from 'lucide-react';
import { SignaturePad } from './signature-pad';
import { 
  LegalDocument, 
  ESignature, 
  SignatureType,
  SignatureStatus 
} from '@/lib/types';

interface DocumentSignatureWorkflowProps {
  document: LegalDocument;
  signerName: string;
  signerEmail: string;
  signerRole?: string;
  onSignatureComplete?: (signature: ESignature) => void;
  onCancel?: () => void;
  className?: string;
}

type WorkflowStep = 'review' | 'sign' | 'complete';

export function DocumentSignatureWorkflow({
  document,
  signerName,
  signerEmail,
  signerRole,
  onSignatureComplete,
  onCancel,
  className = ''
}: DocumentSignatureWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('review');
  const [hasReadDocument, setHasReadDocument] = useState(false);
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signature, setSignature] = useState<ESignature | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const steps = [
    { id: 'review', label: 'Document Beoordelen', icon: Eye },
    { id: 'sign', label: 'Ondertekenen', icon: Pen },
    { id: 'complete', label: 'Voltooid', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Simulate reading progress
  useEffect(() => {
    if (currentStep === 'review') {
      const timer = setInterval(() => {
        setReadingProgress(prev => {
          if (prev >= 100) {
            setHasReadDocument(true);
            clearInterval(timer);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  const handleSignatureComplete = async (signatureData: string, signatureType: SignatureType) => {
    setIsSigningInProgress(true);
    setError(null);

    try {
      // In a real app, this would call the API
      const mockSignature: ESignature = {
        id: `sig_${Date.now()}`,
        documentId: document.id,
        signerEmail,
        signerName,
        signerRole,
        signatureData,
        signatureType,
        timestamp: new Date(),
        ipAddress: '127.0.0.1', // Would be actual IP
        userAgent: navigator.userAgent,
        location: undefined,
        certificateId: `CERT_${Date.now()}`,
        hashValue: `hash_${Date.now()}`,
        verificationCode: `VER_${Date.now()}`,
        status: 'SIGNED',
        signedAt: new Date(),
        complianceLevel: 'STANDARD',
        document,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSignature(mockSignature);
      setCurrentStep('complete');
      
      if (onSignatureComplete) {
        onSignatureComplete(mockSignature);
      }

    } catch (err) {
      setError('Er is een fout opgetreden bij het ondertekenen. Probeer het opnieuw.');
      console.error('Signature error:', err);
    } finally {
      setIsSigningInProgress(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'review':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {document.title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Versie {document.version}
                  </div>
                  <Badge variant="outline">
                    {document.language.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {document.jurisdiction}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.description && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      {document.description}
                    </div>
                  </div>
                )}

                <div className="prose prose-gray max-w-none">
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: document.content.replace(/\n/g, '<br />') 
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Leesvoortgang</span>
                    <span>{readingProgress}%</span>
                  </div>
                  <Progress value={readingProgress} className="h-2" />
                </div>

                {hasReadDocument && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      U heeft het document volledig doorgelezen. U kunt nu verder naar de ondertekening.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Annuleren
                </Button>
              )}
              <Button
                onClick={() => setCurrentStep('sign')}
                disabled={!hasReadDocument}
                className="flex items-center gap-2"
              >
                <Pen className="h-4 w-4" />
                Doorgaan naar Ondertekening
              </Button>
            </div>
          </div>
        );

      case 'sign':
        return (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <SignaturePad
              onSignatureComplete={handleSignatureComplete}
              onCancel={() => setCurrentStep('review')}
              signerName={signerName}
              signerEmail={signerEmail}
              documentTitle={document.title}
            />

            {isSigningInProgress && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Handtekening wordt verwerkt... Dit kan even duren.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-6 w-6" />
                  Document Succesvol Ondertekend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Uw digitale handtekening is juridisch geldig en beveiligd opgeslagen. 
                    U ontvangt een bevestiging per e-mail.
                  </AlertDescription>
                </Alert>

                {signature && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="font-medium">Handtekening Details:</div>
                      <div className="space-y-1 text-gray-600">
                        <div>Ondertekenaar: {signature.signerName}</div>
                        <div>E-mail: {signature.signerEmail}</div>
                        <div>Datum: {signature.signedAt?.toLocaleString('nl-NL')}</div>
                        <div>Type: {signature.signatureType}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Verificatie:</div>
                      <div className="space-y-1 text-gray-600">
                        <div>Verificatiecode: {signature.verificationCode}</div>
                        <div>Certificate ID: {signature.certificateId}</div>
                        <div>Status: 
                          <Badge variant="default" className="ml-2">
                            {signature.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      // In real app, this would download the signed document
                      console.log('Download signed document');
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Document Downloaden
                  </Button>
                  
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (onSignatureComplete && signature) {
                        onSignatureComplete(signature);
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Voltooien
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Document Ondertekening</CardTitle>
            <Badge variant="outline">
              Stap {currentStepIndex + 1} van {steps.length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-blue-600 text-white' : 
                        isCompleted ? 'bg-green-600 text-white' : 
                        'bg-gray-200 text-gray-500'}
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className={`
                      text-xs mt-2 text-center
                      ${isActive ? 'text-blue-600 font-medium' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-500'}
                    `}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}

