'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PDFViewer } from '@/components/ui/pdf-viewer';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SecureViewer({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>('');

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Carregar o documento apenas se estiver autenticado
    if (status === 'authenticated' && params.id) {
      fetchDocument();
    }
  }, [status, params.id, router]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Fetching document:', params.id);

      const response = await fetch(`/api/documents/${params.id}/preview`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Não foi possível carregar o documento');
      }

      const data = await response.json();
      console.log('📄 Document data received:', data);
      
      if (!data.url) {
        throw new Error('URL do documento não encontrada');
      }

      setDocumentUrl(data.url);
      setDocumentName(data.name || 'Documento');
    } catch (error) {
      console.error('❌ Error fetching document:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar documento');
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    fetchDocument();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar documento</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-xs text-gray-500 mb-4">
            <p>ID do documento: {params.id}</p>
          </div>
          <Button onClick={retry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1d20] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-semibold text-white/90">
            {documentName}
          </h1>
        </div>

        {/* PDF Viewer */}
        {documentUrl && <PDFViewer url={documentUrl} />}
      </div>
    </div>
  );
} 