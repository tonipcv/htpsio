'use client';

import { useState, useEffect } from 'react';
import { PDFViewer } from '@/components/ui/pdf-viewer';

export default function ViewerPage({ params }: { params: { id: string } }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}/preview`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load preview');
        }

        const data = await response.json();
        setUrl(data.url);
      } catch (error) {
        console.error('Error loading preview:', error);
        setError('Failed to load document preview');
      }
    };

    loadPreview();
  }, [params.id]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1d20] text-white/70">
        <p>{error}</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1d20]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1d20] p-4">
      <PDFViewer url={url} />
    </div>
  );
} 