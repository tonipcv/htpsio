'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  XMarkIcon, 
  PhoneIcon, 
  UserIcon, 
  CalendarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  TableCellsIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Select as UISelect,
  SelectContent as UISelectContent,
  SelectGroup as UISelectGroup,
  SelectItem as UISelectItem,
  SelectLabel as UISelectLabel,
  SelectTrigger as UISelectTrigger,
  SelectValue as UISelectValue,
  SelectSeparator as UISelectSeparator
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CSVImportModal } from "@/components/leads/csv-import-modal";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: string;
  potentialValue?: number;
  appointmentDate: string | null;
  medicalNotes: string | null;
  createdAt: string;
  indication?: {
    name?: string;
    slug: string;
  };
  pipelineId?: string;
}

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  columns?: any;
}

interface DashboardData {
  totalLeads: number;
  conversionRate: number;
}

const formatPhoneNumber = (phone: string) => {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Se não tiver números, retorna vazio
  if (!numbers) return '';
  
  // Se começar com +55, remove
  const cleanNumbers = numbers.startsWith('55') ? numbers.slice(2) : numbers;
  
  // Verifica se tem DDD (2 dígitos após o +55)
  if (cleanNumbers.length >= 2) {
    const ddd = cleanNumbers.slice(0, 2);
    const number = cleanNumbers.slice(2);
    
    // Formata o número final
    return `+55 (${ddd}) ${number}`;
  }
  
  return `+55 ${cleanNumbers}`;
};

const SelectField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options 
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm text-gray-700">{label}</Label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/50 border border-gray-200 text-gray-900 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default function LeadsPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    appointmentDate: "",
    appointmentTime: "",
    medicalNotes: "",
    interest: "",
    potentialValue: "",
    source: "",
    pipelineId: ""
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Novo",
    appointmentDate: "",
    appointmentTime: "",
    medicalNotes: "",
    interest: "",
    potentialValue: "",
    source: "website",
    pipelineId: ""
  });
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);
  const [displayedLeads, setDisplayedLeads] = useState<Lead[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  const statusOptions = [
    { value: "Novo", label: "Novo" },
    { value: "Agendado", label: "Agendado" },
    { value: "Compareceu", label: "Compareceu" },
    { value: "Não veio", label: "Não veio" },
    { value: "Cancelado", label: "Cancelado" },
    { value: "Fechado", label: "Paciente" }
  ];

  const sourceOptions = [
    { value: "", label: "Selecione a origem" },
    { value: "website", label: "Website" },
    { value: "social", label: "Redes Sociais" },
    { value: "referral", label: "Indicação" },
    { value: "other", label: "Outro" }
  ];

  useEffect(() => {
    if (session?.user?.id) {
      fetchLeads();
      fetchDashboardData();
      fetchPipelines();
    }
  }, [session]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');
      
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao buscar leads:', response.statusText);
        setLeads([]);
      }
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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
      case 'convertido':
        return (
          <Badge className="bg-green-100 text-green-800 border-none hover:bg-green-200 flex items-center gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            <span>Convertido</span>
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

  // Filtering logic is handled by getFilteredLeads function below

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setTotalLeads(data.totalLeads);
        setDisplayedLeads(data.totalLeads > 0 ? leads : []);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const fetchPipelines = async () => {
    try {
      const response = await fetch('/api/pipelines');
      if (response.ok) {
        const data = await response.json();
        setPipelines(data);
      }
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    }
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setEditFormData({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      status: lead.status || "",
      appointmentDate: lead.appointmentDate ? new Date(lead.appointmentDate).toISOString().split('T')[0] : "",
      appointmentTime: lead.appointmentDate ? new Date(lead.appointmentDate).toISOString().split('T')[1].substring(0, 5) : "",
      medicalNotes: lead.medicalNotes || "",
      interest: lead.interest || "",
      potentialValue: lead.potentialValue?.toString() || "",
      source: lead.source || "",
      pipelineId: lead.pipelineId || ""
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLead(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Se for o campo de telefone, formata o número
    if (name === 'phone') {
      setEditFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'status') {
      setEditFormData(prev => ({ ...prev, status: value }));
      
      // Se o status for alterado para "Fechado", significa que o lead foi convertido para paciente
      if (value === 'Fechado') {
        toast({
          title: "Lead convertido",
          description: "Lead foi convertido para paciente com sucesso",
        });
      }
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      // Combine appointment date and time if both are provided
      let appointmentDateTime: string | null = null;
      if (editFormData.appointmentDate && editFormData.appointmentTime) {
        appointmentDateTime = `${editFormData.appointmentDate}T${editFormData.appointmentTime}`;
      }

      // Prepare the data for the API - only include fields that exist in the Prisma model
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        status: editFormData.status,
        appointmentDate: appointmentDateTime,
        medicalNotes: editFormData.medicalNotes,
        potentialValue: editFormData.potentialValue ? parseFloat(editFormData.potentialValue) : null,
        source: editFormData.source,
        pipelineId: editFormData.pipelineId || null,
        updatedAt: new Date()
      };

      const response = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar lead');
      }

      const result = await response.json();

      toast({
        title: "Lead atualizado",
        description: "O lead foi atualizado com sucesso",
      });

      await fetchLeads();
      await fetchDashboardData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o lead",
        variant: "destructive"
      });
    }
  };

  const handleViewLead = (lead: Lead) => {
    setViewingLead(lead);
    setIsViewModalOpen(true);
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) {
      return;
    }

    try {
      const response = await fetch(`/api/leads?leadId=${lead.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove o lead da lista local
        setLeads(prev => prev.filter(l => l.id !== lead.id));
        setDisplayedLeads(prev => prev.filter(l => l.id !== lead.id));
        
        toast({
          title: "Sucesso",
          description: "Lead excluído com sucesso",
        });

        // Atualiza os dados do dashboard
        fetchDashboardData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir lead');
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir o lead",
        variant: "destructive"
      });
    }
  };

  // Calcula estatísticas de leads
  const leadStats = {
    total: dashboardData?.totalLeads || 0,
    novos: Array.isArray(leads) ? leads.filter(lead => lead.status === 'Novo' || !lead.status).length : 0,
    emContato: Array.isArray(leads) ? leads.filter(lead => lead.status === 'Em contato').length : 0,
    agendados: Array.isArray(leads) ? leads.filter(lead => lead.status === 'Agendado').length : 0,
    compareceram: Array.isArray(leads) ? leads.filter(lead => lead.status === 'Compareceu').length : 0,
    naoVieram: Array.isArray(leads) ? leads.filter(lead => lead.status === 'Não veio').length : 0,
    fechados: Array.isArray(leads) ? leads.filter(lead => lead.status === 'Fechado').length : 0,
  };

  // Add function to get lead type counts
  const getLeadTypeCounts = () => {
    if (!Array.isArray(leads)) return { leads: 0, patients: 0, vips: 0 };
    
    return leads.reduce((acc, lead) => {
      if (lead.status === 'Fechado') {
        acc.patients++;
      } else if (lead.indication?.name) {
        acc.vips++;
      } else {
        acc.leads++;
      }
      return acc;
    }, { leads: 0, patients: 0, vips: 0 });
  };

  // Modify getFilteredLeads to include type filtering
  const getFilteredLeads = () => {
    if (!Array.isArray(leads)) return [];
    
    let filtered = leads;
    
    // Filtrar por status
    if (activeTab !== 'all') {
      const statusMap: {[key: string]: string} = {
        'novos': 'Novo',
        'emContato': 'Em contato',
        'agendados': 'Agendado',
        'compareceram': 'Compareceu',
        'naoVieram': 'Não veio',
        'fechados': 'Fechado'
      };

      // Filtrar por tipo
      if (activeTab === 'leads') {
        filtered = leads.filter(lead => 
          !lead.indication?.name && lead.status !== 'Fechado'
        );
      } else if (activeTab === 'patients') {
        filtered = leads.filter(lead => 
          lead.status === 'Fechado'
        );
      } else if (activeTab === 'vips') {
        filtered = leads.filter(lead => 
          !!lead.indication?.name
        );
      } else if (statusMap[activeTab]) {
        filtered = leads.filter(lead => 
          lead.status === statusMap[activeTab] || 
          (!lead.status && activeTab === 'novos')
        );
      }
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        (lead.interest?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (lead.source?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (lead.indication?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get lead type counts
  const typeCounts = getLeadTypeCounts();

  const filteredLeads = Array.isArray(leads) ? getFilteredLeads() : [];

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    if (!createFormData.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!createFormData.phone.trim()) {
      toast({
        title: "Erro",
        description: "O telefone é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createFormData)
      });

      if (response.ok) {
        toast({
          title: "Lead criado",
          description: "O lead foi criado com sucesso",
        });
        await fetchLeads();
        await fetchDashboardData();
        setIsCreateModalOpen(false);
        setCreateFormData({
          name: "",
          email: "",
          phone: "",
          status: "Novo",
          appointmentDate: "",
          appointmentTime: "",
          medicalNotes: "",
          interest: "",
          potentialValue: "",
          source: "website",
          pipelineId: ""
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar lead');
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
      <div className="container mx-auto px-0 sm:pl-4 md:pl-8 lg:pl-16 max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Lista de Leads</h2>
            <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Gerencie seus leads e pacientes</p>
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
              <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)} className="cursor-pointer text-zinc-300 hover:bg-zinc-800 focus:bg-zinc-800">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                <span>Novo Lead</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsImportModalOpen(true)} className="cursor-pointer text-zinc-300 hover:bg-zinc-800 focus:bg-zinc-800">
                <TableCellsIcon className="h-4 w-4 mr-2" />
                <span>Import CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="bg-zinc-900/50 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
          <CardContent className="pt-6 pb-4 sm:pb-3 px-6 sm:px-4">
            {/* Desktop Search and Filter */}
            <div className="hidden md:flex items-center justify-end gap-4 mb-8">
              <UISelect
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <UISelectTrigger className="w-[180px] bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300 rounded-xl h-10">
                  <UISelectValue placeholder="Filtrar por status" />
                </UISelectTrigger>
                <UISelectContent className="bg-zinc-900 border border-zinc-800">
                  <UISelectGroup>
                    <UISelectLabel className="text-zinc-400">Status</UISelectLabel>
                    <UISelectItem value="all" className="text-zinc-300">Todos</UISelectItem>
                    <UISelectItem value="novos" className="text-zinc-300">Novos</UISelectItem>
                    <UISelectItem value="agendados" className="text-zinc-300">Agendados</UISelectItem>
                    <UISelectItem value="compareceram" className="text-zinc-300">Compareceram</UISelectItem>
                    <UISelectItem value="fechados" className="text-zinc-300">Fechados</UISelectItem>
                    <UISelectItem value="naoVieram" className="text-zinc-300">Não vieram</UISelectItem>
                  </UISelectGroup>
                  <UISelectSeparator className="bg-zinc-800" />
                  <UISelectGroup>
                    <UISelectLabel className="text-zinc-400">Tipo</UISelectLabel>
                    <UISelectItem value="leads" className="text-zinc-300">Leads</UISelectItem>
                    <UISelectItem value="patients" className="text-zinc-300">Pacientes</UISelectItem>
                    <UISelectItem value="vips" className="text-zinc-300">VIPs</UISelectItem>
                  </UISelectGroup>
                </UISelectContent>
              </UISelect>
              
              <div className="relative w-[200px]">
                <Input
                  type="text"
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-zinc-900/50 text-sm border-zinc-800 text-zinc-300 placeholder:text-zinc-500 rounded-xl"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            {/* Mobile Search and Filter */}
            <div className="md:hidden mb-3">
              <div className="flex gap-3 mb-3">
                <UISelect
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <UISelectTrigger className="flex-1 bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300 rounded-xl h-10">
                    <UISelectValue placeholder="Filtrar" />
                  </UISelectTrigger>
                  <UISelectContent className="bg-zinc-900 border border-zinc-800">
                    <UISelectGroup>
                      <UISelectLabel className="text-zinc-400">Status</UISelectLabel>
                      <UISelectItem value="all" className="text-zinc-300">Todos</UISelectItem>
                      <UISelectItem value="novos" className="text-zinc-300">Novos</UISelectItem>
                      <UISelectItem value="agendados" className="text-zinc-300">Agendados</UISelectItem>
                      <UISelectItem value="compareceram" className="text-zinc-300">Compareceram</UISelectItem>
                      <UISelectItem value="fechados" className="text-zinc-300">Fechados</UISelectItem>
                      <UISelectItem value="naoVieram" className="text-zinc-300">Não vieram</UISelectItem>
                    </UISelectGroup>
                    <UISelectSeparator className="bg-zinc-800" />
                    <UISelectGroup>
                      <UISelectLabel className="text-zinc-400">Tipo</UISelectLabel>
                      <UISelectItem value="leads" className="text-zinc-300">Leads</UISelectItem>
                      <UISelectItem value="patients" className="text-zinc-300">Pacientes</UISelectItem>
                      <UISelectItem value="vips" className="text-zinc-300">VIPs</UISelectItem>
                    </UISelectGroup>
                  </UISelectContent>
                </UISelect>

                <div className="relative w-[140px]">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-zinc-900/50 text-sm border-zinc-800 text-zinc-300 placeholder:text-zinc-500 rounded-xl"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto -mx-4 px-4">
              {/* Mobile view for small screens */}
              <div className="md:hidden space-y-3">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className="bg-zinc-900/50 p-3.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-zinc-800">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="font-semibold text-base text-zinc-300">{lead.name}</div>
                        <div>
                          {getStatusBadge(lead.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3 text-xs">
                        <div className="flex">
                          <div className="w-20 flex items-center gap-1 text-zinc-500">
                            <PhoneIcon className="h-3 w-3" />
                            <span>Telefone:</span>
                          </div>
                          <div className="text-zinc-300 font-medium">{lead.phone}</div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-20 flex items-center gap-1 text-zinc-500">
                            <UserIcon className="h-3 w-3" />
                            <span>Email:</span>
                          </div>
                          <div className="text-zinc-300 font-medium truncate">{lead.email || 'Não informado'}</div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-20 flex items-center gap-1 text-zinc-500">
                            <BriefcaseIcon className="h-3 w-3" />
                            <span>Origem:</span>
                          </div>
                          <div className="text-zinc-300 font-medium">
                            {lead.source ? (
                              <Badge variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 text-[10px] px-1.5 py-0 h-4">
                                {lead.source}
                              </Badge>
                            ) : (
                              'Não informado'
                            )}
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="w-20 flex items-center gap-1 text-zinc-500">
                            <CalendarIcon className="h-3 w-3" />
                            <span>Data:</span>
                          </div>
                          <div className="text-zinc-300 font-medium">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLead(lead)}
                          className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-xs h-7 w-7 p-0"
                        >
                          <EyeIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(lead)}
                          className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors text-xs h-7 w-7 p-0"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLead(lead)}
                          className="text-zinc-400 hover:text-red-400 hover:bg-red-950/50 transition-colors text-xs h-7 w-7 p-0"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : !loading ? (
                  <div className="bg-zinc-900/50 p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] text-center text-zinc-400 text-sm border border-zinc-800">
                    Nenhum lead encontrado
                  </div>
                ) : null}
                
                {loading && (
                  <div className="bg-zinc-900/50 p-4 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] text-center text-zinc-400 text-sm border border-zinc-800">
                    <ArrowPathIcon className="h-5 w-5 mx-auto animate-spin text-zinc-400 mb-2" />
                    Carregando leads...
                  </div>
                )}
              </div>
              
              {/* Desktop table view */}
              <table className="w-full hidden md:table">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Nome</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Email</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Telefone</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Origem</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Tipo</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Status</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-left text-sm sm:text-xs font-medium text-zinc-400">Data</th>
                    <th className="py-3 sm:py-2 px-4 sm:px-3 text-right text-sm sm:text-xs font-medium text-zinc-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        <div className="font-medium text-base sm:text-sm text-zinc-300">{lead.name}</div>
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        <div className="text-zinc-400 text-sm sm:text-xs">{lead.email || 'Não informado'}</div>
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        <div className="text-zinc-400 text-sm sm:text-xs">{lead.phone}</div>
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        <div className="text-zinc-400 text-sm sm:text-xs">{lead.source || 'Não informado'}</div>
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        {lead.status === 'Fechado' ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">Paciente</Badge>
                        ) : lead.indication?.name ? (
                          <Badge className="bg-purple-50 text-purple-600 border-purple-200 text-xs">VIP</Badge>
                        ) : (
                          <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">Lead</Badge>
                        )}
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        <div className="text-zinc-400 text-sm sm:text-xs">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 sm:py-2 px-4 sm:px-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-zinc-900/50 border-sky-300 text-sky-700 hover:bg-sky-800 hover:border-sky-700 hover:text-sky-300 transition-colors text-sm sm:text-xs h-9 sm:h-7 px-3 sm:px-2"
                            onClick={() => openEditModal(lead)}
                          >
                            <PencilIcon className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-zinc-900/50 border-sky-300 text-sky-700 hover:bg-sky-800 hover:border-sky-700 hover:text-sky-300 transition-colors text-sm sm:text-xs h-9 sm:h-7 px-3 sm:px-2"
                            onClick={() => handleViewLead(lead)}
                          >
                            <EyeIcon className="h-4 w-4 sm:h-3 sm:w-3 mr-2 sm:mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLead(lead)}
                            className="text-zinc-400 hover:text-red-400 hover:bg-red-950/50 transition-colors text-xs h-7 w-7 p-0"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredLeads.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-zinc-400 text-sm">
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de criação */}
      <Sheet open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold text-white">Novo Lead</SheetTitle>
            </SheetHeader>

            <form onSubmit={handleCreateLead} className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Informações Básicas</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-zinc-300">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      placeholder="Nome completo"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      placeholder="Email do lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-zinc-300">
                      Telefone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: formatPhoneNumber(e.target.value) })}
                      placeholder="Telefone do lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status e Origem */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Status e Origem</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <SelectField
                    id="status"
                    label="Status"
                    value={createFormData.status}
                    onChange={(value) => setCreateFormData({ ...createFormData, status: value })}
                    options={statusOptions}
                  />
                  <SelectField
                    id="source"
                    label="Origem"
                    value={createFormData.source}
                    onChange={(value) => setCreateFormData({ ...createFormData, source: value })}
                    options={sourceOptions}
                  />
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  Criar Lead
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de edição */}
      <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold text-white">Editar Lead</SheetTitle>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Informações Básicas</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-zinc-300">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      placeholder="Nome completo"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      placeholder="Email do lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-zinc-300">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                      placeholder="Telefone do lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* Status e Origem */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Status e Origem</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="editStatus" className="text-sm text-zinc-300">Status</Label>
                    <select
                      id="editStatus"
                      name="status"
                      value={editFormData.status}
                      onChange={(e) => handleSelectChange('status', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    >
                      <option value="Novo">Novo</option>
                      <option value="Agendado">Agendado</option>
                      <option value="Compareceu">Compareceu</option>
                      <option value="Não veio">Não veio</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Fechado">Paciente</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editSource" className="text-sm text-zinc-300">Origem</Label>
                    <select
                      id="editSource"
                      name="source"
                      value={editFormData.source}
                      onChange={(e) => handleSelectChange('source', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    >
                      <option value="">Selecione a origem</option>
                      <option value="website">Website</option>
                      <option value="social">Redes Sociais</option>
                      <option value="referral">Indicação</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Interesse e Valor */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Interesse e Valor</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="interest" className="text-sm text-zinc-300">Interesse</Label>
                    <Input
                      id="interest"
                      name="interest"
                      value={editFormData.interest}
                      onChange={handleInputChange}
                      placeholder="Interesse do lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="potentialValue" className="text-sm text-zinc-300">Valor Potencial</Label>
                    <Input
                      id="potentialValue"
                      name="potentialValue"
                      type="number"
                      value={editFormData.potentialValue}
                      onChange={handleInputChange}
                      placeholder="Valor potencial do lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* Agendamento */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Agendamento</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate" className="text-sm text-zinc-300">Data da Consulta</Label>
                    <Input
                      id="appointmentDate"
                      name="appointmentDate"
                      type="date"
                      value={editFormData.appointmentDate}
                      onChange={handleInputChange}
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime" className="text-sm text-zinc-300">Horário da Consulta</Label>
                    <Input
                      id="appointmentTime"
                      name="appointmentTime"
                      type="time"
                      value={editFormData.appointmentTime}
                      onChange={handleInputChange}
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Observações</h3>
                <div className="bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="medicalNotes" className="text-sm text-zinc-300">Observações</Label>
                    <Textarea
                      id="medicalNotes"
                      name="medicalNotes"
                      value={editFormData.medicalNotes}
                      onChange={handleInputChange}
                      placeholder="Observações sobre o lead"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-zinc-700 text-zinc-300 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* Pipeline */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Pipeline</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="pipelineId" className="text-sm text-zinc-300">Pipeline</Label>
                    <select
                      id="pipelineId"
                      name="pipelineId"
                      value={editFormData.pipelineId}
                      onChange={(e) => handleSelectChange('pipelineId', e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                    >
                      <option value="">Selecione uma pipeline</option>
                      {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-zinc-900 hover:bg-zinc-800 text-white"
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Visualização */}
      <Sheet open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold text-white">Detalhes do Lead</SheetTitle>
            </SheetHeader>

            {viewingLead && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Informações Básicas</h3>
                  <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">{viewingLead.name}</p>
                        <p className="text-xs text-zinc-500">Nome completo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">{viewingLead.email || 'Não informado'}</p>
                        <p className="text-xs text-zinc-500">Email</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">{viewingLead.phone}</p>
                        <p className="text-xs text-zinc-500">Telefone</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status e Origem */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Status e Origem</h3>
                  <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(viewingLead.status)}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Status atual</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">{viewingLead.source || 'Não informado'}</p>
                        <p className="text-xs text-zinc-500">Origem do lead</p>
                      </div>
                    </div>
                    {viewingLead.indication?.name && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-300">{viewingLead.indication.name}</p>
                          <p className="text-xs text-zinc-500">Indicação</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interesse e Valor */}
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Interesse e Valor</h3>
                  <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">{viewingLead.interest || 'Não informado'}</p>
                        <p className="text-xs text-zinc-500">Interesse</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-300">
                          {viewingLead.potentialValue 
                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(viewingLead.potentialValue)
                            : 'Não informado'
                          }
                        </p>
                        <p className="text-xs text-zinc-500">Valor potencial</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agendamento */}
                {viewingLead.appointmentDate && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Agendamento</h3>
                    <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-300">
                            {new Date(viewingLead.appointmentDate).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-zinc-500">Data da consulta</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {viewingLead.medicalNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Observações</h3>
                    <div className="bg-zinc-800/50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <ClipboardDocumentIcon className="h-4 w-4 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{viewingLead.medicalNotes}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openEditModal(viewingLead);
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
                      handleDeleteLead(viewingLead);
                    }}
                    className="bg-zinc-900/50 border-red-800 text-red-300 hover:bg-red-800 hover:border-red-700"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          setIsImportModalOpen(false);
          fetchLeads();
        }}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-300">
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
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
              onClick={async () => {
                if (leadToDelete) {
                  await handleDeleteLead(leadToDelete);
                  setIsDeleteModalOpen(false);
                }
              }}
              className="bg-red-900/50 border-red-800 text-red-300 hover:bg-red-800 hover:border-red-700"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 