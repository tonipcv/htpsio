'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from './button';
import { Card } from './card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, AlertCircle, RefreshCw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure react-pdf worker
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
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('Error loading PDF:', error);
    setError(error);
    setIsLoading(false);
  }

  const nextPage = () => pageNumber < numPages && setPageNumber(pageNumber + 1);
  const previousPage = () => pageNumber > 1 && setPageNumber(pageNumber - 1);
  const zoomIn = () => setScale(Math.min(scale + 0.2, 3.0));
  const zoomOut = () => setScale(Math.max(scale - 0.2, 0.5));

  if (error) {
    return (
      <Card className="p-8 bg-[#1c1d20] border-white/10">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2 text-red-400">Error loading PDF</h3>
            <p className="text-sm text-white/70 mb-4">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="gap-2 border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full bg-[#1c1d20] border-white/10">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#1c1d20] border-b border-white/10">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            onClick={previousPage}
            disabled={pageNumber <= 1 || isLoading}
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm px-2 text-white/70 min-w-[100px] text-center">
            {isLoading ? 'Loading...' : `Page ${pageNumber} of ${numPages}`}
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
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            onClick={zoomOut}
            disabled={isLoading}
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm px-2 text-white/70 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            onClick={zoomIn}
            disabled={isLoading}
            size="sm"
            className="border-white/10 text-white/70 hover:text-white hover:bg-white/5"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto pdf-container" ref={containerRef}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-full min-h-[200px] bg-[#1c1d20]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-white/70">Loading PDF...</p>
              </div>
            </div>
          }
        >
          {!isLoading && numPages > 0 && (
            <div className="flex justify-center p-2">
              <Page
                key={`${pageNumber}-${scale}`}
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={containerWidth ? Math.min(containerWidth - 32, 800) : undefined}
                className="bg-[#1c1d20]"
                loading={
                  <div className="flex items-center justify-center min-h-[200px] bg-[#1c1d20]">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                }
                error={null}
              />
            </div>
          )}
        </Document>
      </div>
    </Card>
  );
} 