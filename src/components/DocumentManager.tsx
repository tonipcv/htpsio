"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";
import { PDFPreviewModal } from "./ui/pdf-preview-modal";
import { Eye, Users, Share2, UserPlus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Document {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  documentAccess?: {
    client: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  slug: string;
  createdAt: string;
  _count: {
    documentAccess: number;
  };
}

export function DocumentManager() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", password: "" });

  const isAdmin = session?.user?.role === "admin";

  // Carregar documentos
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

  // Carregar clientes (apenas para admins)
  const loadClients = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Falha ao carregar clientes");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadDocuments();
    if (isAdmin) {
      loadClients();
    }
  }, [isAdmin]);

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

  // Criar novo cliente
  const handleCreateClient = async () => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao criar cliente");
      }

      toast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
      });

      setNewClient({ name: "", email: "", password: "" });
      setIsClientModalOpen(false);
      loadClients();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o cliente",
        variant: "destructive",
      });
    }
  };

  // Compartilhar documento
  const handleShareDocument = async (documentId: string, clientId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) throw new Error("Falha ao compartilhar documento");

      toast({
        title: "Sucesso",
        description: "Documento compartilhado com sucesso",
      });

      loadDocuments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o documento",
        variant: "destructive",
      });
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

  // Deletar documento
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Tem certeza que deseja excluir este documento?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Falha ao excluir documento");
      
      // Remove o documento da lista
      setDocuments(documents.filter(doc => doc.id !== documentId));
      
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o documento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    <div className="space-y-3">
      {/* Controls for upload and management - admin only */}
      {isAdmin && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={isUploading}
              className="h-8 text-xs bg-transparent border-0 text-[#f5f5f7] cursor-pointer file:cursor-pointer file:bg-[#f5f5f7]/10 file:text-[#f5f5f7] file:border-0 file:h-8 file:mr-2 file:px-3 file:text-xs hover:file:bg-[#f5f5f7]/20 file:rounded-md w-full p-0 rounded-none"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-[#1c1d20]/50 flex items-center justify-center pointer-events-none">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border border-[#f5f5f7] border-t-transparent"></div>
              </div>
            )}
          </div>
          
          <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs border-[#f5f5f7]/10 text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5">
                <UserPlus className="h-3 w-3 mr-1" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1d20] border-[#f5f5f7]/10">
              <DialogHeader>
                <DialogTitle className="text-[#f5f5f7] text-sm">New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-3">
                <div className="space-y-2">
                  <Input
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Client name"
                    className="h-8 text-xs bg-[#f5f5f7]/5 border-[#f5f5f7]/10 text-[#f5f5f7]"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="Client email"
                    className="h-8 text-xs bg-[#f5f5f7]/5 border-[#f5f5f7]/10 text-[#f5f5f7]"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={newClient.password}
                    onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                    placeholder="Set password"
                    className="h-8 text-xs bg-[#f5f5f7]/5 border-[#f5f5f7]/10 text-[#f5f5f7]"
                  />
                </div>
                <Button 
                  onClick={handleCreateClient}
                  className="w-full h-8 mt-2 bg-[#f5f5f7]/10 hover:bg-[#f5f5f7]/20 text-[#f5f5f7] text-xs"
                >
                  Create Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Documents list */}
      <div className="rounded-lg bg-[#1c1d20]/50 overflow-hidden">
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border border-[#f5f5f7] border-t-transparent"></div>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f7]/[0.03]">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 group hover:bg-[#f5f5f7]/[0.02]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-[#f5f5f7] truncate">{doc.name}</span>
                    <span className="text-xs text-[#f5f5f7]/50">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {doc.documentAccess && doc.documentAccess.length > 0 && (
                    <div className="flex -space-x-2 mr-2">
                      {doc.documentAccess.slice(0, 3).map((access) => (
                        <div
                          key={access.client.id}
                          className="h-5 w-5 rounded-full bg-[#f5f5f7]/10 border border-[#1c1d20] flex items-center justify-center"
                          title={access.client.name}
                        >
                          <span className="text-[10px] text-[#f5f5f7]/70">
                            {access.client.name.charAt(0)}
                          </span>
                        </div>
                      ))}
                      {doc.documentAccess.length > 3 && (
                        <div className="h-5 w-5 rounded-full bg-[#f5f5f7]/10 border border-[#1c1d20] flex items-center justify-center">
                          <span className="text-[10px] text-[#f5f5f7]/70">
                            +{doc.documentAccess.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(doc)}
                    className="h-7 px-2 text-xs text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  
                  {isAdmin && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-[#f5f5f7]/70 hover:text-[#f5f5f7] hover:bg-[#f5f5f7]/5"
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-[#1c1d20] border-[#f5f5f7]/10">
                          {clients.map((client) => (
                            <DropdownMenuItem
                              key={client.id}
                              onClick={() => handleShareDocument(doc.id, client.id)}
                              className="text-xs text-[#f5f5f7]/70 hover:text-[#f5f5f7] focus:text-[#f5f5f7] focus:bg-[#f5f5f7]/5"
                            >
                              {client.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="h-7 px-2 text-xs text-[#f5f5f7]/70 hover:text-red-500 hover:bg-[#f5f5f7]/5"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {documents.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-[#f5f5f7]/40">No documents found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedDocument && (
        <PDFPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleClosePreview}
          documentId={selectedDocument.id}
          documentName={selectedDocument.name}
        />
      )}
    </div>
  );
} 