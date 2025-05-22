'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import { PhoneIcon, CalendarIcon, PencilIcon, LinkIcon, ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { PipelineManager } from "@/components/PipelineManager";

// Importação dinâmica para resolver problema de renderização no servidor
const DragDropContextLib = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);

const DroppableLib = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.Droppable),
  { ssr: false }
);

const DraggableLib = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.Draggable),
  { ssr: false }
);

// Tipos para o caso de importação dinâmica
type DroppableProvided = any;
type DraggableProvided = any;
type DropResult = any;

interface Lead {
  id: string;
  name: string;
  phone: string;
  interest?: string;
  status?: string;
  appointmentDate?: string;
  createdAt?: string;
  source?: string;
  notes?: string;
  indication?: {
    name?: string;
    slug: string;
  };
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  columns?: {
    id: string;
    title: string;
  }[];
}

const columns = [
  { id: 'novos', title: 'Novos' },
  { id: 'agendados', title: 'Agendados' },
  { id: 'compareceram', title: 'Compareceram' },
  { id: 'fechados', title: 'Fechados' },
  { id: 'naoVieram', title: 'Não vieram' }
];

const statusMap: { [key: string]: string } = {
  'novos': 'Novo',
  'agendados': 'Agendado',
  'compareceram': 'Compareceu',
  'fechados': 'Fechado',
  'naoVieram': 'Não veio'
};

export default function PipelinePage() {
  const { data: session, status } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardData, setDashboardData] = useState<{ 
    totalLeads: number;
    totalIndications: number;
  } | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [currentPipelineId, setCurrentPipelineId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário está autenticado e não é premium
    if (status === 'authenticated' && session?.user && session.user.plan !== 'premium') {
      router.push('/bloqueado');
      return;
    }

    if (session?.user?.id) {
      fetchPipelines();
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setLeads([]);
    }
  }, [session, status]);

  useEffect(() => {
    if (currentPipelineId) {
      fetchLeads();
    }
  }, [currentPipelineId]);

  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/pipelines');
      if (response.ok) {
        const data = await response.json();
        setPipelines(data);
        
        // Se não houver pipeline selecionado e houver pipelines disponíveis,
        // seleciona o primeiro
        if (data.length > 0 && !currentPipelineId) {
          setCurrentPipelineId(data[0].id);
        } else if (data.length === 0) {
          // Se não houver pipelines, remove o loading state
          setLoading(false);
        }
      } else {
        console.error('Erro ao buscar pipelines:', await response.text());
        toast({
          title: "Erro",
          description: "Não foi possível obter os pipelines",
          variant: "destructive"
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao buscar pipelines:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os pipelines",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleCreatePipeline = async (pipeline: Pick<Pipeline, 'name' | 'description'>) => {
    try {
      const response = await fetch('/api/pipelines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipeline),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pipeline');
      }

      const newPipeline = await response.json();
      setPipelines([...pipelines, newPipeline]);
      setCurrentPipelineId(newPipeline.id);
    } catch (error) {
      console.error('Erro ao criar pipeline:', error);
      throw error;
    }
  };

  const fetchLeads = async () => {
    if (!currentPipelineId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/leads?pipelineId=${currentPipelineId}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          setLeads(result.data);
        } else if (Array.isArray(result)) {
          setLeads(result);
        } else {
          console.warn("Dados recebidos não são um array");
          setLeads([]);
        }
      } else {
        console.error("Erro na resposta da API:", await response.text());
        toast({
          title: "Erro",
          description: "Não foi possível obter os dados dos leads",
          variant: "destructive"
        });
        setLeads([]);
      }
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os leads",
        variant: "destructive"
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = statusMap[destination.droppableId];
    const lead = leads.find(l => l.id === draggableId);
    if (!lead) return;

    // Atualiza o estado local imediatamente
      setLeads(leads.map(l => 
        l.id === draggableId ? { ...l, status: newStatus } : l
      ));

    // Envia atualização para o servidor
    try {
      await fetch(`/api/leads?leadId=${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      // Atualiza os dados do dashboard
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      // Em caso de erro, apenas exibe um toast - não reverte o estado
      // para evitar efeitos visuais disruptivos
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const getColumnLeads = (columnId: string) => {
    // Garante que leads é sempre um array
    if (!Array.isArray(leads)) return [];
    
    try {
    return leads.filter(lead => {
      if (columnId === 'novos') {
        return lead.status === 'Novo' || !lead.status;
      }
      return lead.status === statusMap[columnId];
    });
    } catch (error) {
      console.error('Erro ao filtrar leads para a coluna:', columnId, error);
      return [];
    }
  };

  const handleEditLead = async (updatedLead: Lead) => {
    try {
      if (!updatedLead || !updatedLead.id) {
        throw new Error('Lead inválido para atualização');
      }
      
      const response = await fetch(`/api/leads?leadId=${updatedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Erro ao atualizar lead: ${response.status}`);
      }

      // Atualiza o lead na lista local
      if (Array.isArray(leads)) {
        const updatedLeads = leads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
        );
        setLeads(updatedLeads);
      }

      toast({
        title: "Lead atualizado",
        description: "As informações foram atualizadas com sucesso",
      });

      // Fecha o modal de edição
      setIsEditModalOpen(false);
      setEditingLead(null);
      
      // Atualiza dados do dashboard
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o lead",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads?leadId=${leadId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir lead');
      }

      // Atualiza a lista local removendo o lead excluído
      setLeads(leads.filter(lead => lead.id !== leadId));
      
      // Fecha o modal
      setIsEditModalOpen(false);
      setEditingLead(null);

      // Notifica o usuário
      toast({
        title: "Lead excluído",
        description: "Lead foi excluído com sucesso",
      });

      // Atualiza dados do dashboard
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lead",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromPipeline = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads?leadId=${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Removido' })
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || 'Erro ao remover lead da pipeline',
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Lead removido da pipeline com sucesso"
      });
      
      // Atualiza a lista de leads removendo o lead da pipeline
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
      
      // Fecha o modal se estiver aberto
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao remover lead da pipeline:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover lead da pipeline",
        variant: "destructive"
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Erro ao buscar dados do dashboard:', await response.text());
        toast({
          title: "Erro",
          description: "Não foi possível obter os dados do dashboard",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border border-zinc-700 border-t-zinc-400"></div>
          <p className="text-xs text-zinc-500 tracking-[-0.03em] font-inter">Carregando pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContextLib onDragEnd={handleDragEnd}>
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16">
        <div className="w-full md:container md:mx-auto md:pl-8 lg:pl-16 md:max-w-[90%] lg:max-w-[85%]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 px-4 md:px-0">
            <div>
              <h1 className="text-xl font-bold text-white tracking-[-0.03em] font-inter">Pipeline</h1>
              <p className="text-xs text-zinc-400 tracking-[-0.01em] font-inter">Seus leads e vendas</p>
            </div>
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <Button
                onClick={() => {
                  const name = prompt('Nome do novo pipeline:');
                  if (name) {
                    handleCreatePipeline({ name, description: '' });
                  }
                }}
                className="h-9 w-9 p-0 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-full"
                title="Novo Pipeline"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="sr-only">Novo Pipeline</span>
              </Button>
              <Button
                onClick={() => fetchLeads()}
                className="h-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-xl text-xs"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                Atualizar
              </Button>
            </div>
          </div>

          <PipelineManager
            pipelines={pipelines}
            currentPipelineId={currentPipelineId}
            onPipelineChange={setCurrentPipelineId}
            onPipelineCreate={handleCreatePipeline}
          />

          <div className="w-full">
            <div className="flex overflow-x-auto pb-4 w-full md:grid md:grid-cols-5 gap-4 md:gap-3">
              {columns.map((column) => (
                <div key={column.id} className="min-w-[280px] md:min-w-0 flex-shrink-0 md:flex-shrink-1 min-h-[300px] flex flex-col first:ml-4 last:mr-4 md:first:ml-0 md:last:mr-0">
                  <div className="bg-zinc-900/50 rounded-lg p-2 shadow-[0_2px_8px_rgba(0,0,0,0.2)] mb-2 border border-zinc-800">
                    <h2 className="text-sm font-semibold text-zinc-300 flex items-center">
                      <span className="mr-auto">{column.title}</span>
                      <span className="ml-1.5 bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-xs font-medium">
                        {getColumnLeads(column.id).length}
                      </span>
                    </h2>
                  </div>

                  <div className="flex-1 bg-zinc-900/50 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden border border-zinc-800">
                    <DroppableLib droppableId={column.id} key={column.id}>
                      {(provided: DroppableProvided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="p-2 h-full min-h-[50vh] lg:min-h-[60vh] overflow-y-auto"
                        >
                          {getColumnLeads(column.id).map((lead, index) => (
                            <DraggableLib key={lead.id} draggableId={lead.id} index={index}>
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-zinc-800/50 rounded-lg mb-2 shadow-sm p-2.5 cursor-pointer hover:shadow-md transition-shadow duration-300 border border-zinc-700 hover:border-zinc-600"
                                  onDoubleClick={() => {
                                    setEditingLead(lead);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium text-zinc-300 text-sm leading-snug truncate" title={lead.name}>{lead.name}</h4>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                          <PhoneIcon className="flex-shrink-0 h-3 w-3" />
                                          <span className="truncate">{lead.phone}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {lead.interest && (
                                      <div className="flex items-center text-xs">
                                        <span className="text-zinc-500 mr-1">Interesse:</span>
                                        <span className="text-zinc-400 font-medium truncate">{lead.interest}</span>
                                      </div>
                                    )}

                                    {lead.appointmentDate && (
                                      <div className="flex items-center text-xs">
                                        <CalendarIcon className="h-3 w-3 text-zinc-500 mr-1" />
                                        <span className="text-zinc-400 truncate">
                                          {new Date(lead.appointmentDate).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DraggableLib>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </DroppableLib>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de Edição */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setIsEditMode(false);
        }}>
          <DialogPortal>
            <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] p-0 overflow-hidden bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-3xl">
              <DialogHeader className="p-4 sm:p-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm flex flex-row justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full ${
                    editingLead?.status === 'Agendado' ? 'bg-yellow-500' :
                    editingLead?.status === 'Compareceu' ? 'bg-green-500' :
                    editingLead?.status === 'Fechado' ? 'bg-zinc-400' :
                    editingLead?.status === 'Não veio' ? 'bg-red-500' :
                    'bg-zinc-600'
                  }`}></div>
                  <div>
                    <DialogTitle className="text-lg sm:text-base font-bold text-white tracking-[-0.03em] font-inter">{editingLead?.name}</DialogTitle>
                    <DialogDescription className="text-sm sm:text-xs text-zinc-400 tracking-[-0.03em] font-inter">Status: {editingLead?.status || 'Novo'}</DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 p-1 h-8 w-8 sm:h-7 sm:w-7"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este lead?')) {
                        if (editingLead?.id) {
                          handleDeleteLead(editingLead.id);
                        }
                      }
                    }}
                    title="Excluir lead"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-14 sm:h-14" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                      <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                    <span className="sr-only">Excluir lead</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700/50 transition-all duration-300 rounded-2xl text-sm sm:text-xs h-8 sm:h-7"
                  >
                    {isEditMode ? 'Visualizar' : 'Editar'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-300 h-8 w-8 sm:h-7 sm:w-7 p-0"
                  >
                    <X className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    <span className="sr-only">Fechar</span>
                  </Button>
                </div>
              </DialogHeader>

              {editingLead && (
                <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-4">
                  {isEditMode ? (
                    /* Modo de edição */
                    <div className="grid grid-cols-1 gap-5 sm:gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-4">
                        {/* Coluna de informações do paciente */}
                        <div className="bg-zinc-800/50 backdrop-blur-sm p-5 sm:p-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-zinc-700">
                          <h3 className="text-base sm:text-sm font-bold text-white tracking-[-0.03em] font-inter mb-4 sm:mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Informações do paciente
                          </h3>
                          
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!editingLead) return;
                            handleEditLead(editingLead);
                            setIsEditMode(false);
                          }} className="space-y-4 sm:space-y-3">
                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="name" className="text-zinc-300 text-sm sm:text-xs font-medium">Nome</Label>
                              <Input
                                id="name"
                                value={editingLead.name}
                                onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-600 text-zinc-300 placeholder:text-zinc-500 rounded-xl h-10 sm:h-8 text-sm sm:text-xs"
                              />
                            </div>
                            
                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="phone" className="text-zinc-300 text-sm sm:text-xs font-medium">Telefone</Label>
                              <Input
                                id="phone"
                                value={editingLead.phone}
                                onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-600 text-zinc-300 placeholder:text-zinc-500 rounded-xl h-10 sm:h-8 text-sm sm:text-xs"
                              />
                            </div>

                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="status" className="text-zinc-300 text-sm sm:text-xs font-medium">Status</Label>
                              <Select 
                                value={editingLead.status || 'Novo'}
                                onValueChange={(value) => setEditingLead({ ...editingLead, status: value })}
                              >
                                <SelectTrigger id="status" className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-600 text-zinc-300 rounded-xl h-10 sm:h-8 text-sm sm:text-xs">
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700">
                                  <SelectItem value="Novo" className="text-zinc-300">Novo</SelectItem>
                                  <SelectItem value="Agendado" className="text-zinc-300">Agendado</SelectItem>
                                  <SelectItem value="Compareceu" className="text-zinc-300">Compareceu</SelectItem>
                                  <SelectItem value="Fechado" className="text-zinc-300">Fechado</SelectItem>
                                  <SelectItem value="Não veio" className="text-zinc-300">Não veio</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="interest" className="text-zinc-300 text-sm sm:text-xs font-medium">Interesse</Label>
                              <Input
                                id="interest"
                                value={editingLead.interest || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, interest: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-600 text-zinc-300 placeholder:text-zinc-500 rounded-xl h-10 sm:h-8 text-sm sm:text-xs"
                              />
                            </div>
                            
                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="source" className="text-zinc-300 text-sm sm:text-xs font-medium">Origem</Label>
                              <Input
                                id="source"
                                value={editingLead.source || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-600 text-zinc-300 placeholder:text-zinc-500 rounded-xl h-10 sm:h-8 text-sm sm:text-xs"
                              />
                            </div>
                          </form>
                        </div>
                        
                        {/* Coluna de agendamento */}
                        <div className="bg-zinc-800/50 backdrop-blur-sm p-5 sm:p-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-zinc-700">
                          <h3 className="text-base sm:text-sm font-bold text-white tracking-[-0.03em] font-inter mb-4 sm:mb-3 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Agendamento e observações
                          </h3>
                          
                          <div className="space-y-4 sm:space-y-3">
                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="appointmentDate" className="text-zinc-300 text-sm sm:text-xs font-medium">Data e hora do agendamento</Label>
                              <Input
                                id="appointmentDate"
                                type="datetime-local"
                                value={editingLead.appointmentDate || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, appointmentDate: e.target.value })}
                                className="bg-zinc-900/50 border-zinc-700 focus:border-zinc-600 text-zinc-300 placeholder:text-zinc-500 rounded-xl h-10 sm:h-8 text-sm sm:text-xs"
                              />
                            </div>
                            
                            <div className="space-y-2 sm:space-y-1">
                              <Label htmlFor="notes" className="text-zinc-300 text-sm sm:text-xs font-medium">Observações</Label>
                              <textarea
                                id="notes"
                                value={editingLead.notes || ''}
                                onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                                className="w-full rounded-xl min-h-[150px] sm:min-h-[120px] p-3 sm:p-2 border border-zinc-700 focus:border-zinc-600 bg-zinc-900/50 text-zinc-300 placeholder:text-zinc-500 text-sm sm:text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 sm:pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditMode(false)}
                          className="bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700/50 rounded-xl h-10 sm:h-8 font-medium text-sm sm:text-xs"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja remover este lead da pipeline?')) {
                              handleRemoveFromPipeline(editingLead.id);
                              setIsEditModalOpen(false);
                            }
                          }}
                          className="bg-zinc-800/50 border-red-900/50 text-red-400 hover:bg-red-900/20 hover:border-red-800/50 rounded-xl h-10 sm:h-8 font-medium text-sm sm:text-xs"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remover da pipeline
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (!editingLead) return;
                            handleEditLead(editingLead);
                            setIsEditMode(false);
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-10 sm:h-8 font-medium text-sm sm:text-xs"
                        >
                          Salvar alterações
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Modo de visualização */
                    <div className="space-y-5 sm:space-y-4">
                      {/* Informações principais */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-3 bg-zinc-800/50 backdrop-blur-sm p-5 sm:p-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-zinc-700">
                        <div>
                          <h4 className="text-sm sm:text-xs font-medium text-zinc-400 mb-1">Telefone</h4>
                          <p className="flex items-center truncate text-zinc-300 text-base sm:text-sm">
                            <PhoneIcon className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1.5 flex-shrink-0 text-zinc-400" />
                            <a href={`tel:${editingLead.phone}`} className="hover:text-zinc-100 truncate">{editingLead.phone}</a>
                          </p>
                        </div>
                        
                        {editingLead.interest && (
                          <div>
                            <h4 className="text-sm sm:text-xs font-medium text-zinc-400 mb-1">Interesse</h4>
                            <p className="truncate text-zinc-300 text-base sm:text-sm">{editingLead.interest}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm sm:text-xs font-medium text-zinc-400 mb-1">Data de criação</h4>
                          <p className="truncate text-zinc-300 text-base sm:text-sm">
                            {editingLead.createdAt 
                              ? new Date(editingLead.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : 'Não disponível'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Agendamento */}
                      {editingLead.appointmentDate && (
                        <div className="bg-zinc-800/50 backdrop-blur-sm p-4 sm:p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-zinc-700">
                          <div className="flex items-start">
                            <CalendarIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-3 sm:mr-2 flex-shrink-0 text-zinc-400 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-xs font-medium text-zinc-300 mb-1">Próximo agendamento</h4>
                              <p className="text-zinc-400 break-words text-sm sm:text-xs">
                                {new Date(editingLead.appointmentDate).toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                                {' às '}
                                {new Date(editingLead.appointmentDate).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Observações */}
                      {editingLead.notes && (
                        <div className="bg-zinc-800/50 backdrop-blur-sm p-4 sm:p-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-zinc-700">
                          <h4 className="text-sm sm:text-xs font-medium text-zinc-400 mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Observações
                          </h4>
                          <div className="bg-zinc-900/50 p-4 sm:p-3 rounded-xl border border-zinc-700 overflow-hidden">
                            <p className="whitespace-pre-line break-words text-zinc-300 text-sm sm:text-xs">{editingLead.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Botões de ação */}
                      <div className="flex justify-end space-x-3 pt-4 sm:pt-3 mt-2 sm:mt-1 border-t border-zinc-700">
                        <Button 
                          variant="outline"
                          className="bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700/50 rounded-xl h-10 sm:h-8 text-sm sm:text-xs font-medium"
                          onClick={() => window.open(`https://wa.me/${editingLead.phone.replace(/\D/g, '')}`, '_blank')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="w-4 h-4 sm:w-3.5 sm:h-3.5 mr-2 sm:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                          </svg>
                          WhatsApp
                        </Button>
                        
                        <Button 
                          className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-10 sm:h-8 text-sm sm:text-xs font-medium"
                          onClick={() => setIsEditMode(true)}
                        >
                          <PencilIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5 flex-shrink-0" />
                          Editar lead
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </DragDropContextLib>
  );
} 