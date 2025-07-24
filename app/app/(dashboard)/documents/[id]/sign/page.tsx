
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, PenTool, RotateCcw, CheckCircle, User } from 'lucide-react';
import { mockDocuments } from '@/lib/mock-data';
import { Document as DocumentType } from '@/lib/types';
import { formatDate, getDocumentStatusColor, translateStatus } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function DocumentSignPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  
  const [docData, setDocData] = useState<DocumentType | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const foundDocument = mockDocuments.find(doc => doc.id === id);
    if (foundDocument) {
      setDocData(foundDocument);
    }
  }, [id]);

  const clearSignature = () => {
    setHasSignature(false);
    setSignatureData('');
  };

  const handleSign = async () => {
    if (!hasSignature || !docData || !user) {
      return;
    }

    setIsSigning(true);

    // Generate a simple signature data URL for demo purposes
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = '24px Arial';
      ctx.fillText(`${user.name}`, 20, 50);
      setSignatureData(canvas.toDataURL());
    }

    // Simulate signing process
    setTimeout(() => {
      // Update document status (in a real app, this would be an API call)
      const updatedDocument = {
        ...docData,
        status: 'signed' as DocumentType['status'],
        signedAt: new Date(),
        signatureUrl: signatureData || canvas.toDataURL(),
      };
      
      setDocData(updatedDocument);
      setIsSigning(false);
      
      // Show success message and redirect after a delay
      setTimeout(() => {
        router.push('/dashboard/documents');
      }, 2000);
    }, 1500);
  };

  if (!docData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document niet gevonden</h2>
          <p className="text-muted-foreground mb-4">Het opgevraagde document bestaat niet of is verwijderd.</p>
          <Button asChild>
            <Link href="/dashboard/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Documenten
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAlreadySigned = docData.status === 'signed' || docData.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/documents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Documenten
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{docData.title}</h1>
              <p className="text-sm text-muted-foreground">
                {docData.clientName ? `Voor: ${docData.clientName}` : 'Intern document'}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={getDocumentStatusColor(docData.status)}
          >
            {translateStatus(docData.status, 'document')}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isAlreadySigned && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Dit document is al ondertekend op {docData.signedAt ? formatDate(docData.signedAt) : 'onbekende datum'}.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Content */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Document Inhoud</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {docData.content ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {docData.content}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Geen inhoud beschikbaar voor dit document.</p>
                    <p className="text-xs mt-2">Upload een bestand of voeg inhoud toe om het document te kunnen bekijken.</p>
                  </div>
                )}
              </div>
              
              {/* Document Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 capitalize">
                      {docData.type === 'contract' && 'Contract'}
                      {docData.type === 'invoice' && 'Factuur'}
                      {docData.type === 'agreement' && 'Overeenkomst'}
                      {docData.type === 'other' && 'Overig'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aangemaakt:</span>
                    <span className="ml-2">{formatDate(docData.createdAt)}</span>
                  </div>
                  {docData.description && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Beschrijving:</span>
                      <span className="ml-2">{docData.description}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PenTool className="h-5 w-5" />
                <span>
                  {isAlreadySigned ? 'Handtekening' : 'Document Ondertekenen'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAlreadySigned ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 text-green-800 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Document ondertekend</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Dit document is succesvol ondertekend door {user?.name} op {docData.signedAt ? formatDate(docData.signedAt) : 'onbekende datum'}.
                    </p>
                  </div>
                  
                  {docData.signatureUrl && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Handtekening:</label>
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <img 
                          src={docData.signatureUrl} 
                          alt="Handtekening" 
                          className="max-w-full h-auto max-h-32"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Klik hieronder om te ondertekenen:
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setHasSignature(true)}
                    >
                      {hasSignature ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                          <p className="text-sm font-medium text-green-600">Handtekening geplaatst</p>
                          <p className="text-xs text-muted-foreground">
                            Handtekening van {user?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <PenTool className="h-8 w-8 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">
                            Klik hier om je handtekening te plaatsen
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Klik in het bovenstaande vak om je digitale handtekening te plaatsen
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={clearSignature}
                      disabled={!hasSignature}
                      className="flex-1"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Wissen
                    </Button>
                    <Button
                      onClick={handleSign}
                      disabled={!hasSignature || isSigning}
                      className="flex-1"
                    >
                      {isSigning ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Ondertekenen...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Accepteren & Ondertekenen
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <User className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Ondertekening namens:</p>
                        <p>{user?.name}</p>
                        <p className="text-blue-600">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Door dit document te ondertekenen, bevestig je dat je de inhoud hebt gelezen 
                      en akkoord gaat met alle voorwaarden.
                    </p>
                    <p>
                      De handtekening wordt veilig opgeslagen en is juridisch geldig.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
