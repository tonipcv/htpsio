'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from './button';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  documentId,
  documentName,
}: PDFPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setIframeKey(prev => prev + 1);
    }
  }, [isOpen, documentId]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Erro ao carregar o visualizador do documento');
    setIsLoading(false);
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 gap-0 overflow-hidden bg-[#1c1d20] border border-white/10">
        <DialogHeader className="px-6 py-3 border-b border-white/10 flex-row items-center justify-between bg-[#1c1d20]">
          <DialogTitle className="text-lg font-semibold text-white/90">{documentName}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 relative" style={{ height: 'calc(95vh - 56px)' }}>
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1c1d20] rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-400">Carregando visualizador...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1c1d20] rounded-lg">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-400 mb-2">Erro na visualização</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <Button onClick={retry} variant="outline" className="gap-2 border-white/10 text-white/70 hover:text-white hover:bg-white/5">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}

          {/* Iframe viewer */}
          <iframe
            key={iframeKey}
            src={`/viewer/${documentId}`}
            className="w-full h-full border-0 bg-[#1c1d20]"
            sandbox="allow-same-origin allow-scripts"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ display: error ? 'none' : 'block' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 