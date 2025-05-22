'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  XMarkIcon, 
  PhoneIcon, 
  UserIcon, 
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CSVImportModal } from "@/components/patients/csv-import-modal";
import { DateTimePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  lead: {
    status: string;
    appointmentDate: string | null;
    medicalNotes: string | null;
  };
}

export default function PacientesPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    appointmentDate: "",
    medicalNotes: ""
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "novo",
    appointmentDate: "",
    medicalNotes: "",
    hasPortalAccess: false
  });
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [sendingPortalConfig, setSendingPortalConfig] = useState<{ [key: string]: boolean }>({});
  const [portalConfigSent, setPortalConfigSent] = useState<{ [key: string]: boolean }>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const router = useRouter();

  const fetchPatients = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/patients');
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data || []);
      } else {
        console.error('Erro ao buscar pacientes:', response.statusText);
        setPatients([]);
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients data when session changes
  useEffect(() => {
    fetchPatients();
  }, [session]);

  // Cleanup effect for dropdowns
  useEffect(() => {
    if (!isViewModalOpen && !isEditModalOpen && !isCreateModalOpen) {
      setIsStatusOpen(false);
      setIsCreateStatusOpen(false);
    }
  }, [isViewModalOpen, isEditModalOpen, isCreateModalOpen]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isStatusOpen || isCreateStatusOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[role="combobox"]')) {
          setIsStatusOpen(false);
          setIsCreateStatusOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusOpen, isCreateStatusOpen]);

  // useEffect to clean up state when create modal is closed
  useEffect(() => {
    if (!isCreateModalOpen) {
      setCreateFormData({
        name: "",
        email: "",
        phone: "",
        status: "novo",
        appointmentDate: "",
        medicalNotes: "",
        hasPortalAccess: false
      });
    }
  }, [isCreateModalOpen]);

  // useEffect to clean up state when edit/view modals are closed
  useEffect(() => {
    if (!isViewModalOpen && !isEditModalOpen) {
      setViewingPatient(null);
      setEditingPatient(null);
      setEditFormData({
        name: "",
        email: "",
        phone: "",
        status: "novo",
        appointmentDate: "",
        medicalNotes: ""
      });
    }
  }, [isViewModalOpen, isEditModalOpen]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'novo':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-none hover:bg-blue-200 flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            <span>Novo</span>
          </Badge>
        );
      case 'contato':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-none hover:bg-amber-200 flex items-center gap-1">
            <PhoneIcon className="h-3 w-3" />
            <span>Contato</span>
          </Badge>
        );
      case 'agendado':
        return (
          <Badge className="bg-purple-100 text-purple-800 border-none hover:bg-purple-200 flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Agendado</span>
          </Badge>
        );
      case 'concluído':
        return (
          <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            <span>Atendido</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-none hover:bg-gray-200 flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>{status || 'Desconhecido'}</span>
          </Badge>
        );
    }
  };

  const filteredPatients = patients.filter(patient => {
    // Filter by status if not "all"
    if (activeTab !== "all" && patient.lead.status !== activeTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        patient.name.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        patient.phone.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const handleViewPatient = (patient: Patient) => {
    setViewingPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setEditFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      status: patient.lead.status,
      appointmentDate: patient.lead.appointmentDate 
        ? new Date(patient.lead.appointmentDate).toISOString().slice(0, 16)
        : "",
      medicalNotes: patient.lead.medicalNotes || ""
    });
    setIsEditModalOpen(true);
  };

  const handleCreatePatient = () => {
    setCreateFormData({
      name: "",
      email: "",
      phone: "",
      status: "novo",
      appointmentDate: "",
      medicalNotes: "",
      hasPortalAccess: false
    });
    setIsCreateModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, status: value }));
  };

  const handleCreateStatusChange = (status: string) => {
    setCreateFormData(prev => ({
      ...prev,
      status
    }));
  };

  const handleAppointmentDateChange = (date: Date | null) => {
    setEditFormData(prev => ({ 
      ...prev, 
      appointmentDate: date ? date.toISOString() : "" 
    }));
  };

  const handleCreateAppointmentDateChange = (date: Date | null) => {
    setCreateFormData(prev => ({ 
      ...prev, 
      appointmentDate: date ? date.toISOString() : "" 
    }));
  };

  const handleUpdatePatient = async () => {
    if (!editingPatient) return;

    // Validar dados obrigatórios
    if (!editFormData.name || !editFormData.email || !editFormData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name.trim(),
          email: editFormData.email.trim(),
          phone: editFormData.phone.trim(),
          lead: {
            status: editFormData.status,
            appointmentDate: editFormData.appointmentDate || null,
            medicalNotes: editFormData.medicalNotes || null
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualiza o paciente na lista local
        setPatients(prevPatients => 
          prevPatients.map(p => 
            p.id === editingPatient.id ? data : p
          )
        );
        
        toast({
          title: "Sucesso",
          description: "As informações do paciente foram atualizadas com sucesso.",
        });
        
        // Fechando o modal depois de atualizar os dados
        setIsEditModalOpen(false);
      } else {
        throw new Error(data.error || 'Erro ao atualizar paciente');
      }
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o paciente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewPatient = async () => {
    // Validar campos obrigatórios - only validate required fields (name, email, phone)
    if (!createFormData.name || !createFormData.email || !createFormData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createFormData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createFormData.name,
          email: createFormData.email,
          phone: createFormData.phone,
          hasPortalAccess: createFormData.hasPortalAccess,
          lead: {
            status: createFormData.status,
            appointmentDate: createFormData.appointmentDate || null,
            medicalNotes: createFormData.medicalNotes || null
          }
        }),
      });

      const data = await response.json();
      
      console.log('API response:', { status: response.status, data });

      if (response.ok) {
        // Adiciona o novo paciente à lista local
        setPatients(prevPatients => [data.data, ...prevPatients]);
        
        toast({
          title: "Paciente criado",
          description: "O novo paciente foi criado com sucesso.",
        });
        
        // Fechar modal
        setIsCreateModalOpen(false);
      } else {
        // Tratar diferentes tipos de erro da API baseado no status code
        if (response.status === 409) {
          // Conflito - email duplicado
          toast({
            title: "Email já cadastrado",
            description: "Já existe um paciente cadastrado com este email.",
            variant: "destructive",
          });
        } else {
          // Outros erros da API
        throw new Error(data.error || 'Erro ao criar paciente');
        }
      }
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      
      // Exibir a mensagem de erro (se já não foi exibida pelo bloco acima)
      const errorMessage = error instanceof Error ? error.message : "";
      
      // Só exibe o toast se não for um erro 409 (que já foi tratado)
      if (!errorMessage.includes("Email já cadastrado")) {
      toast({
        title: "Erro",
          description: errorMessage || "Não foi possível criar o paciente. Tente novamente.",
        variant: "destructive",
      });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendPortalConfig = async (patient: Patient) => {
    if (sendingPortalConfig[patient.id]) return;

    try {
      setSendingPortalConfig(prev => ({ ...prev, [patient.id]: true }));
      setPortalConfigSent(prev => ({ ...prev, [patient.id]: false }));

      const response = await fetch(`/api/patients/${patient.id}/send-portal-config`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "E-mail enviado",
          description: "O e-mail de configuração do portal foi enviado com sucesso.",
        });
        setPortalConfigSent(prev => ({ ...prev, [patient.id]: true }));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar e-mail');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail de configuração. Tente novamente.",
        variant: "destructive",
      });
      setPortalConfigSent(prev => ({ ...prev, [patient.id]: false }));
    } finally {
      setSendingPortalConfig(prev => ({ ...prev, [patient.id]: false }));

      // Reset o status de enviado após 3 segundos
      setTimeout(() => {
        setPortalConfigSent(prev => ({ ...prev, [patient.id]: false }));
      }, 3000);
    }
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      const response = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove o paciente da lista local
        setPatients(prevPatients => prevPatients.filter(p => p.id !== patientToDelete.id));
        
        toast({
          title: "Sucesso",
          description: "Paciente excluído com sucesso.",
        });
        
        setIsDeleteModalOpen(false);
        setPatientToDelete(null);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir paciente');
      }
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir o paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportComplete = () => {
    setIsImportModalOpen(false);
    fetchPatients();
  };

  // Update the import modal open handler to close dropdowns
  const handleOpenImportModal = () => {
    setIsStatusOpen(false);
    setIsCreateStatusOpen(false);
    setIsImportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border border-zinc-700 border-t-zinc-400"></div>
          <p className="text-xs text-zinc-500 tracking-[-0.03em] font-inter">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
      <div className="container mx-auto px-0 sm:pl-4 md:pl-8 lg:pl-16 max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Pacientes</h1>
                <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Gerencie seus pacientes</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 bg-zinc-900/50 text-zinc-300 border-zinc-800 hover:bg-zinc-800">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    <span>Adicionar</span>
                    <ChevronDownIcon className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border border-zinc-800">
                  <DropdownMenuItem onClick={handleCreatePatient} className="cursor-pointer text-zinc-300 hover:bg-zinc-800 focus:bg-zinc-800">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    <span>Novo Paciente</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenImportModal} className="cursor-pointer text-zinc-300 hover:bg-zinc-800 focus:bg-zinc-800">
                    <TableCellsIcon className="h-4 w-4 mr-2" />
                    <span>Import CSV</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search and Filters */}
            <div className="bg-zinc-900/50 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-zinc-800">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      placeholder="Buscar pacientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tabs value={activeTab} className="w-full md:w-auto">
                    <TabsList className="h-11 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                      <TabsTrigger 
                        value="all"
                        onClick={() => setActiveTab("all")}
                        className="rounded-md text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                      >
                        Todos
                      </TabsTrigger>
                      <TabsTrigger 
                        value="novo"
                        onClick={() => setActiveTab("novo")}
                        className="rounded-md text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                      >
                        Novos
                      </TabsTrigger>
                      <TabsTrigger 
                        value="agendado"
                        onClick={() => setActiveTab("agendado")}
                        className="rounded-md text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                      >
                        Agendados
                      </TabsTrigger>
                      <TabsTrigger 
                        value="concluído"
                        onClick={() => setActiveTab("concluído")}
                        className="rounded-md text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-200 data-[state=active]:shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                      >
                        Concluídos
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Patient List */}
            <Card className="bg-zinc-900/50 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
              <CardContent className="p-0">
                {/* Mobile view */}
                <div className="md:hidden divide-y divide-zinc-800">
                  {filteredPatients.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="mx-auto w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="h-12 w-12 text-zinc-500" />
                      </div>
                      <h3 className="text-sm font-medium text-zinc-300 mb-1">Nenhum paciente encontrado</h3>
                      <p className="text-sm text-zinc-500">Tente ajustar seus filtros ou adicione um novo paciente.</p>
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <div key={patient.id} className="p-4 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-zinc-300">{patient.name}</h3>
                            <p className="text-sm text-zinc-500">{patient.email}</p>
                          </div>
                          {getStatusBadge(patient.lead?.status || 'novo')}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1.5" />
                            Ver detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 px-2.5"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 bg-zinc-900/50 border-red-800 text-red-300 hover:bg-red-800 hover:border-red-700 px-2.5"
                            onClick={() => {
                              setPatientToDelete(patient);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                  
                  {/* Desktop table view */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-900/50 border-b border-zinc-800">
                        <th className="py-4 px-6 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Nome</th>
                        <th className="py-4 px-6 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                        <th className="py-4 px-6 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Telefone</th>
                        <th className="py-4 px-6 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                        <th className="py-4 px-6 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Data de Cadastro</th>
                        <th className="py-4 px-6 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-zinc-800">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="mx-auto w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                              <UserIcon className="h-12 w-12 text-zinc-500" />
                            </div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-1">Nenhum paciente encontrado</h3>
                            <p className="text-sm text-zinc-500">Tente ajustar seus filtros ou adicione um novo paciente.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-medium text-zinc-300">{patient.name}</div>
                          </td>
                            <td className="py-4 px-6 text-zinc-400">{patient.email}</td>
                            <td className="py-4 px-6 text-zinc-400">{patient.phone}</td>
                            <td className="py-4 px-6">{getStatusBadge(patient.lead?.status || 'novo')}</td>
                            <td className="py-4 px-6 text-zinc-400">
                              {format(new Date(patient.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </td>
                            <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                                onClick={() => handleViewPatient(patient)}
                              >
                                  <EyeIcon className="h-4 w-4 mr-1.5" />
                                  Ver detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 px-2.5"
                                onClick={() => handleEditPatient(patient)}
                              >
                                  <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 bg-zinc-900/50 border-red-800 text-red-300 hover:bg-red-800 hover:border-red-700 px-2.5"
                                onClick={() => {
                                  setPatientToDelete(patient);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                  <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>

      {/* View Modal */}
      <Sheet
        open={isViewModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Close dropdowns
            setIsStatusOpen(false);
            setIsCreateStatusOpen(false);
            
            // Close modals
            if (isEditModalOpen) {
              setIsEditModalOpen(false);
            }
            setIsViewModalOpen(false);
          }
        }}
      >
        <SheetContent className="bg-zinc-900 border-l border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-white">
              {isEditModalOpen ? 'Editar Paciente' : 'Detalhes do Paciente'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Informações Básicas</h3>
              <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-zinc-300">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleFormChange}
                    placeholder="Nome completo"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    disabled={!isEditModalOpen}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleFormChange}
                    placeholder="Email do paciente"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    disabled={!isEditModalOpen}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm text-zinc-300">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleFormChange}
                    placeholder="Telefone do paciente"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    disabled={!isEditModalOpen}
                  />
                </div>
              </div>
            </div>

            {/* Status and Appointment */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Status e Agendamento</h3>
              <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm text-zinc-300">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={editFormData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    disabled={!isEditModalOpen}
                  >
                    <option value="novo">Novo</option>
                    <option value="agendado">Agendado</option>
                    <option value="concluído">Concluído</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-sm text-zinc-300">Data da Consulta</Label>
                  <Input
                    id="appointmentDate"
                    name="appointmentDate"
                    type="datetime-local"
                    value={editFormData.appointmentDate}
                    onChange={handleFormChange}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    disabled={!isEditModalOpen}
                  />
                </div>
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Observações Médicas</h3>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="medicalNotes" className="text-sm text-zinc-300">Observações</Label>
                  <Textarea
                    id="medicalNotes"
                    name="medicalNotes"
                    value={editFormData.medicalNotes}
                    onChange={handleFormChange}
                    placeholder="Observações sobre o paciente"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700 min-h-[100px]"
                    disabled={!isEditModalOpen}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4">
              {isEditModalOpen ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdatePatient}
                    disabled={isSaving}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEditPatient(viewingPatient!);
                    }}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setPatientToDelete(viewingPatient);
                      setIsDeleteModalOpen(true);
                    }}
                    className="bg-zinc-900/50 border-red-800 text-red-300 hover:bg-red-800 hover:border-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Modal */}
      <Sheet open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <SheetContent className="bg-zinc-900 border-l border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-white">Novo Paciente</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Informações Básicas</h3>
              <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="createName" className="text-sm text-zinc-300">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="createName"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateFormChange}
                    placeholder="Nome completo"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createEmail" className="text-sm text-zinc-300">Email</Label>
                  <Input
                    id="createEmail"
                    name="email"
                    type="email"
                    value={createFormData.email}
                    onChange={handleCreateFormChange}
                    placeholder="Email do paciente"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createPhone" className="text-sm text-zinc-300">
                    Telefone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="createPhone"
                    name="phone"
                    value={createFormData.phone}
                    onChange={handleCreateFormChange}
                    placeholder="Telefone do paciente"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status and Appointment */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Status e Agendamento</h3>
              <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="createStatus" className="text-sm text-zinc-300">Status</Label>
                  <select
                    id="createStatus"
                    name="status"
                    value={createFormData.status}
                    onChange={(e) => handleCreateStatusChange(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                  >
                    <option value="novo">Novo</option>
                    <option value="agendado">Agendado</option>
                    <option value="concluído">Concluído</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createAppointmentDate" className="text-sm text-zinc-300">Data da Consulta</Label>
                  <Input
                    id="createAppointmentDate"
                    name="appointmentDate"
                    type="datetime-local"
                    value={createFormData.appointmentDate}
                    onChange={handleCreateFormChange}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700"
                  />
                </div>
              </div>
            </div>

            {/* Medical Notes */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Observações Médicas</h3>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="createMedicalNotes" className="text-sm text-zinc-300">Observações</Label>
                  <Textarea
                    id="createMedicalNotes"
                    name="medicalNotes"
                    value={createFormData.medicalNotes}
                    onChange={handleCreateFormChange}
                    placeholder="Observações sobre o paciente"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700 min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {/* Portal Access */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Acesso ao Portal</h3>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPortalAccess"
                    checked={createFormData.hasPortalAccess}
                    onCheckedChange={(checked) => 
                      setCreateFormData(prev => ({ ...prev, hasPortalAccess: checked as boolean }))
                    }
                    className="border-zinc-800 data-[state=checked]:bg-zinc-700 data-[state=checked]:border-zinc-700"
                  />
                  <Label
                    htmlFor="hasPortalAccess"
                    className="text-sm text-zinc-300 leading-none"
                  >
                    Criar acesso ao portal do paciente
                  </Label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateNewPatient}
                disabled={isCreating}
                className="bg-zinc-900 hover:bg-zinc-800 text-white"
              >
                {isCreating ? 'Criando...' : 'Criar Paciente'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Paciente</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatient}
              className="bg-red-900/50 border-red-800 text-red-300 hover:bg-red-800 hover:border-red-700"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        onImportComplete={handleImportComplete}
      />
    </>
  );
} 