'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './button';
import { Card } from './card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, RefreshCw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configurar o worker do react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    console.log('✅ PDF carregado com sucesso. Páginas:', numPages);
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('❌ Erro ao carregar PDF:', error);
    setError(error);
    setIsLoading(false);
  }

  function onPageLoadSuccess(): void {
    console.log('✅ Página carregada com sucesso');
  }

  function onPageLoadError(error: Error): void {
    console.error('❌ Erro ao carregar página:', error);
  }

  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const previousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.2);
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setPageNumber(1);
    setNumPages(0);
  };

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Erro ao carregar PDF</h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <div className="text-xs text-gray-500 mb-4">
              <p>URL: {url}</p>
              <p>Erro: {error.name}</p>
            </div>
            <Button onClick={retry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full flex flex-col bg-[#1c1d20] border-white/10">
      <div className="flex flex-col h-full">
        {/* Controles de navegação */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-4 bg-[#1c1d20] p-2 rounded-lg border border-white/10">
          <Button
            variant="outline"
            onClick={previousPage}
            disabled={pageNumber <= 1 || isLoading}
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 text-white/70">
            {isLoading ? 'Carregando...' : `Página ${pageNumber} de ${numPages}`}
          </span>
          <Button
            variant="outline"
            onClick={nextPage}
            disabled={pageNumber >= numPages || isLoading}
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <Button 
            variant="outline" 
            onClick={zoomOut} 
            disabled={scale <= 0.5} 
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs px-2 min-w-[60px] text-center text-white/70">
            {Math.round(scale * 100)}%
          </span>
          <Button 
            variant="outline" 
            onClick={zoomIn} 
            disabled={scale >= 3.0} 
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={resetZoom} 
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            Reset
          </Button>
        </div>

        {/* Viewer do PDF */}
        <div className="flex-1 overflow-auto border rounded-lg bg-[#1c1d20]">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-full w-full min-h-[600px] bg-[#1c1d20]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-400">Carregando PDF...</p>
                </div>
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full w-full min-h-[600px] bg-[#1c1d20]">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-400">Erro ao carregar documento</p>
                </div>
              </div>
            }
          >
            {!isLoading && numPages > 0 && (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                onLoadSuccess={onPageLoadSuccess}
                onLoadError={onPageLoadError}
                className="bg-[#1c1d20]"
                loading={
                  <div className="flex items-center justify-center h-full w-full min-h-[600px] bg-[#1c1d20]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full w-full min-h-[600px] bg-[#1c1d20]">
                    <div className="text-center text-red-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Erro ao carregar página</p>
                    </div>
                  </div>
                }
              />
            )}
          </Document>
        </div>
      </div>
    </Card>
  );
} 