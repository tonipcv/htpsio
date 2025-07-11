"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { PDFPreviewModal } from "./ui/pdf-preview-modal";
import { Eye } from "lucide-react";

interface Document {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Carregar documentos ao montar o componente
  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Falha ao carregar documentos");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar documentos automaticamente ao montar o componente
  useEffect(() => {
    loadDocuments();
  }, []);

  // Upload de documento
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha no upload");

      const newDocument = await response.json();
      setDocuments((prev) => [...prev, newDocument]);
      
      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso",
      });

      // Recarregar a lista após o upload
      loadDocuments();
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o documento",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Download de documento
  const handleDownload = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error("Falha ao gerar link de download");
      
      const { url } = await response.json();
      
      // Abre o download em nova aba
      window.open(url, "_blank");
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento",
        variant: "destructive",
      });
    }
  };

  // Visualizar documento
  const handlePreview = (document: Document) => {
    console.log("🔍 Iniciando preview do documento:", document.name);
    setSelectedDocument(document);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <Button onClick={() => loadDocuments()} disabled={isLoading}>
          {isLoading ? "Carregando..." : "Atualizar Lista"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Carregando documentos...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          Nenhum documento encontrado
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-gray-500">
                    Tamanho: {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-gray-500">
                    Enviado em: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePreview(doc)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    onClick={() => handleDownload(doc.id)}
                    variant="secondary"
                    size="sm"
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedDocument && (
        <PDFPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleClosePreview}
          documentName={selectedDocument.name}
          documentId={selectedDocument.id}
        />
      )}
    </div>
  );
} 