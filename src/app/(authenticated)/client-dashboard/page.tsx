'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, ArrowUpCircle, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { PDFPreviewModal } from '@/components/ui/pdf-preview-modal';

interface Document {
  id: string;
  name: string;
  createdAt: string;
  size: number;
}

export default function ClientDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    // Fetch documents that have been shared with this client
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/documents/shared-with-me');
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data.documents || [])
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load your documents. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleUpgradeClick = () => {
    console.log('Navigating to pricing page');
    // Set a flag in sessionStorage to indicate we're coming from client dashboard
    sessionStorage.setItem('fromClientDashboardUpgrade', 'true');
    window.location.href = '/pricing';
  };
  
  // Handle document preview
  const handlePreview = (document: Document) => {
    console.log("🔍 Iniciando preview do documento:", document.name);
    setSelectedDocument(document);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
    setSelectedDocument(null);
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-zinc-900 pb-12">
      <div className="container max-w-5xl px-4 py-16">
        {/* Preview Modal */}
        {selectedDocument && (
          <PDFPreviewModal
            isOpen={isPreviewModalOpen}
            onClose={handleClosePreview}
            documentId={selectedDocument.id}
            documentName={selectedDocument.name}
          />
        )}
        {/* Logo */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-40 h-12">
            <Image
              src="/logo.png"
              alt="MED1 Logo"
              fill
              priority
              className="object-contain invert brightness-200"
            />
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-white tracking-tight">Your Documents</h1>
          <p className="mt-3 text-lg text-zinc-400 max-w-2xl mx-auto">
            Documents shared with you by your provider
          </p>
        </div>

        {/* Upgrade Banner */}
        <div className="mb-8">
          <Card className="bg-zinc-800 border border-zinc-700 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-zinc-300 text-sm">
                Upgrade your account for more features
              </p>
              <Button 
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs px-3 py-1 h-8"
                onClick={handleUpgradeClick}
              >
                <ArrowUpCircle className="mr-1 h-3 w-3" />
                Upgrade
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-medium text-white mb-4">Documents Received</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">No Documents Yet</h3>
                <p className="text-zinc-400 mt-2 max-w-md mx-auto">
                  You haven't received any documents yet. They will appear here when shared with you.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-700">
                {documents.map((doc) => (
                  <div key={doc.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-zinc-400 mr-3" />
                      <div>
                        <h4 className="text-zinc-200 font-medium">{doc.name}</h4>
                        <p className="text-xs text-zinc-400">
                          {new Date(doc.createdAt).toLocaleDateString()} • {formatFileSize(doc.size)}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      onClick={() => handlePreview(doc)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
