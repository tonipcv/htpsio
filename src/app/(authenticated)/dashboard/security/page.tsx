'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { 
  ShieldCheckIcon, 
  ShieldExclamationIcon, 
  ComputerDesktopIcon, 
  ServerIcon,
  BoltIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface SecurityStats {
  totalEndpoints: number;
  protectedEndpoints: number;
  threatsBlocked: number;
  lastScan: string | null;
}

interface PlanLimits {
  max: number | null;
  current: number;
  canAddMore: boolean;
  features: {
    antivirus: boolean;
    firewall: boolean;
    isolation: boolean;
    backup: boolean;
  };
}

interface SecurityIncident {
  id: string;
  type: 'malware' | 'ransomware' | 'phishing' | 'other';
  severity: 'high' | 'medium' | 'low';
  device: string;
  timestamp: string;
  status: 'active' | 'contained' | 'resolved';
  description: string;
}

interface ActivationStatus {
  currentStep: string;
  installerDownloaded: boolean;
  deviceInstalled: boolean;
  emailVerified: boolean;
  wizardCompleted: boolean;
}

interface Installer {
  url: string;
  os: string;
  expiresAt: string;
}

interface Endpoint {
  id: string;
  name: string;
  os: string;
  status: string;
  lastSeen: string;
  version: string;
  isIsolated: boolean;
  protectionStatus: string;
  ipAddress: string;
  macAddress: string;
}

export default function SecurityPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [activationStatus, setActivationStatus] = useState<ActivationStatus | null>(null);
  const [installer, setInstaller] = useState<Installer | null>(null);
  const [stats, setStats] = useState<SecurityStats>({
    totalEndpoints: 0,
    protectedEndpoints: 0,
    threatsBlocked: 0,
    lastScan: null
  });
  const [recentIncidents, setRecentIncidents] = useState<SecurityIncident[]>([]);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [planLimits, setPlanLimits] = useState<PlanLimits>({
    max: null,
    current: 0,
    canAddMore: true,
    features: {
      antivirus: true,
      firewall: true,
      isolation: false,
      backup: false
    }
  });
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState('');
  const [newEndpointOS, setNewEndpointOS] = useState('windows');
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);

  // Check registration status
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const response = await fetch('/api/security/register');
        const data = await response.json();

        if (response.ok) {
          setIsRegistered(data.isRegistered);
          if (data.isRegistered) {
            fetchSecurityData();
            fetchActivationStatus();
          } else {
            setIsLoading(false);
          }
        } else {
          throw new Error(data.error || 'Failed to check registration');
        }
      } catch (error) {
        console.error('Error checking registration:', error);
        toast.error("Não foi possível verificar o registro");
        setIsLoading(false);
      }
    };

    if (session?.user) {
      checkRegistration();
    }
  }, [session]);

  // Fetch security data
  const fetchSecurityData = async () => {
    try {
      const [statsResponse, endpointsResponse] = await Promise.all([
        fetch('/api/security/stats'),
        fetch('/api/security/endpoints')
      ]);

      const statsData = await statsResponse.json();
      const endpointsData = await endpointsResponse.json();

      if (statsResponse.ok && endpointsResponse.ok) {
        setStats(statsData.stats);
        setRecentIncidents(statsData.recentIncidents);
        setEndpoints(endpointsData.endpoints);
        setPlanLimits(endpointsData.limits);
      } else {
        throw new Error(statsData.error || endpointsData.error || 'Failed to fetch security data');
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error("Não foi possível carregar os dados de segurança");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch activation status
  const fetchActivationStatus = async () => {
    try {
      const response = await fetch('/api/security/installer');
      const data = await response.json();

      if (response.ok) {
        setActivationStatus(data.activationStatus);
        setInstaller(data.installer);
      }
    } catch (error) {
      console.error('Error fetching activation status:', error);
    }
  };

  const handleRegister = async () => {
    if (!companyName) {
      toast.error("Nome da empresa é obrigatório");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch('/api/security/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Proteção configurada com sucesso!");
        setIsRegistered(true);
        fetchSecurityData();
      } else {
        throw new Error(data.error || 'Erro ao configurar proteção');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao configurar proteção");
    } finally {
      setIsRegistering(false);
    }
  };

  const generateInstaller = async (os: string = 'windows') => {
    try {
      const response = await fetch('/api/security/installer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ os })
      });

      const data = await response.json();

             if (response.ok) {
         setInstaller(data.installer);
         toast.success("Link do instalador gerado com sucesso!");
       } else {
         throw new Error(data.error || 'Erro ao gerar instalador');
       }
     } catch (error) {
       console.error('Error generating installer:', error);
       toast.error(error instanceof Error ? error.message : "Não foi possível gerar o instalador");
    }
  };

  const updateActivationStep = async (step: string, action: string) => {
    try {
      const response = await fetch('/api/security/activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, action })
      });

      const data = await response.json();

             if (response.ok) {
         setActivationStatus(data.activationStatus);
         toast.success("Status atualizado com sucesso!");
       } else {
         throw new Error(data.error || 'Erro ao atualizar status');
       }
     } catch (error) {
       console.error('Error updating activation step:', error);
       toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o status");
    }
  };

  const handleAction = async (action: string, deviceId?: string) => {
    try {
      const response = await fetch('/api/security/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, deviceId: deviceId || 'mock-device-id' })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        throw new Error(data.error || 'Erro ao executar ação');
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast.error(error instanceof Error ? error.message : "Não foi possível executar a ação. Tente novamente.");
    }
  };

  const getStepProgress = () => {
    if (!activationStatus) return 0;
    const steps = ['DOWNLOAD_INSTALLER', 'INSTALL_DEVICE', 'VERIFY_EMAIL', 'COMPLETED'];
    const currentIndex = steps.indexOf(activationStatus.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-zinc-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-red-900/30 text-red-500 text-xs px-2 py-1 rounded-full">Ativo</span>;
      case 'contained':
        return <span className="bg-yellow-900/30 text-yellow-500 text-xs px-2 py-1 rounded-full">Contido</span>;
      case 'resolved':
        return <span className="bg-green-900/30 text-green-500 text-xs px-2 py-1 rounded-full">Resolvido</span>;
      default:
        return null;
    }
  };

  const handleAddEndpoint = async () => {
    if (!newEndpointName) {
      toast.error("Nome do endpoint é obrigatório");
      return;
    }

    setIsAddingEndpoint(true);
    try {
      const response = await fetch('/api/security/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEndpointName,
          os: newEndpointOS
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Endpoint registrado com sucesso");
        setShowAddEndpoint(false);
        setNewEndpointName('');
        setNewEndpointOS('windows');
        fetchSecurityData(); // Recarregar dados
      } else {
        throw new Error(data.error || 'Erro ao registrar endpoint');
      }
    } catch (error) {
      console.error('Error registering endpoint:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao registrar endpoint");
    } finally {
      setIsAddingEndpoint(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border border-zinc-700 border-t-zinc-400"></div>
          <p className="text-xs text-zinc-500 tracking-[-0.03em] font-inter">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
        <div className="container mx-auto max-w-md">
          <Card className="bg-zinc-900/50 border border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Configurar Proteção Acronis</CardTitle>
              <CardDescription>
                Configure a proteção da Acronis para sua empresa e proteja seus dados contra ameaças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm text-zinc-300">
                    Nome da Empresa
                  </Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Digite o nome da sua empresa"
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500"
                  />
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-white">Recursos Incluídos:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                      Proteção contra malware e ransomware
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <ServerIcon className="h-5 w-5 text-blue-500" />
                      Backup e recuperação de dados
                    </li>
                    <li className="flex items-center gap-2 text-sm text-zinc-400">
                      <BoltIcon className="h-5 w-5 text-yellow-500" />
                      Resposta automática a incidentes
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border border-white/30 border-t-white mr-2"></div>
                      Configurando...
                    </>
                  ) : (
                    'Configurar Proteção'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Rest of the existing security dashboard UI
  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
      <div className="container mx-auto px-0 sm:pl-4 md:pl-8 lg:pl-16 max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Proteção Acronis</h1>
              <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">
                Monitore e proteja sua infraestrutura
              </p>
            </div>
            
            {/* Show setup wizard button if not completed */}
            {activationStatus && !activationStatus.wizardCompleted && (
              <Button
                onClick={() => setShowWizard(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                Configurar Instalação
              </Button>
            )}
          </div>

          {/* Installation Progress Card */}
          {activationStatus && !activationStatus.wizardCompleted && (
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  Configuração Pendente
                </CardTitle>
                <CardDescription>
                  Complete a instalação para ativar a proteção completa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">Progresso da Instalação</span>
                      <span className="text-zinc-400">{Math.round(getStepProgress())}%</span>
                    </div>
                    <Progress value={getStepProgress()} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`flex items-center gap-2 ${activationStatus.installerDownloaded ? 'text-green-500' : 'text-zinc-400'}`}>
                      {activationStatus.installerDownloaded ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm">Download</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${activationStatus.deviceInstalled ? 'text-green-500' : 'text-zinc-400'}`}>
                      {activationStatus.deviceInstalled ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ComputerDesktopIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm">Instalação</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 ${activationStatus.emailVerified ? 'text-green-500' : 'text-zinc-400'}`}>
                      {activationStatus.emailVerified ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <ShieldCheckIcon className="h-5 w-5" />
                      )}
                      <span className="text-sm">Verificação</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-zinc-900/50 border border-zinc-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="incidents" className="data-[state=active]:bg-zinc-800">
                Incidentes
              </TabsTrigger>
              <TabsTrigger value="endpoints" className="data-[state=active]:bg-zinc-800">
                Endpoints
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-zinc-900/50 border border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <ComputerDesktopIcon className="h-8 w-8 text-zinc-400" />
                      <div>
                        <p className="text-sm text-zinc-400">Total de Endpoints</p>
                        <p className="text-2xl font-bold text-white">{stats.totalEndpoints}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-zinc-400">Endpoints Protegidos</p>
                        <p className="text-2xl font-bold text-white">{stats.protectedEndpoints}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="text-sm text-zinc-400">Ameaças Bloqueadas</p>
                        <p className="text-2xl font-bold text-white">{stats.threatsBlocked}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <ClockIcon className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-zinc-400">Última Varredura</p>
                        <p className="text-2xl font-bold text-white">
                          {stats.lastScan ? new Date(stats.lastScan).toLocaleString() : 'Nunca'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 bg-zinc-900/50 border border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Ações Rápidas</CardTitle>
                  <CardDescription>Execute ações de segurança com um clique</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                      onClick={() => handleAction('scan')}
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      Varredura Completa
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                      onClick={() => handleAction('isolate')}
                    >
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Isolar Endpoint
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                      onClick={() => handleAction('restore')}
                    >
                      <ServerIcon className="h-5 w-5 mr-2" />
                      Restaurar Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents">
              <Card className="bg-zinc-900/50 border border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Incidentes Recentes</CardTitle>
                  <CardDescription>Últimos incidentes de segurança detectados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {recentIncidents.map((incident) => (
                        <div
                          key={incident.id}
                          className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-white font-medium">{incident.device}</h4>
                              <p className="text-sm text-zinc-400">{incident.description}</p>
                            </div>
                            {getStatusBadge(incident.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`text-xs ${getSeverityColor(incident.severity)}`}>
                              {incident.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {new Date(incident.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Endpoints Tab */}
            <TabsContent value="endpoints">
              <Card className="bg-zinc-900/50 border border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Endpoints</CardTitle>
                      <CardDescription>Gerencie seus endpoints protegidos</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-400 mb-1">
                        Endpoints: {planLimits.current} / {planLimits.max === null ? '∞' : planLimits.max}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowAddEndpoint(true)}
                        disabled={!planLimits.canAddMore}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        Adicionar Endpoint
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {endpoints.map((endpoint: Endpoint) => (
                      <div
                        key={endpoint.id}
                        className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-white font-medium">{endpoint.name}</h4>
                              {endpoint.isIsolated && (
                                <span className="bg-red-900/30 text-red-500 text-xs px-2 py-0.5 rounded-full">
                                  Isolado
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="text-zinc-500">Sistema:</span>
                                {endpoint.os}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="text-zinc-500">Versão:</span>
                                {endpoint.version}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="text-zinc-500">IP:</span>
                                {endpoint.ipAddress}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="text-zinc-500">MAC:</span>
                                {endpoint.macAddress}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                              onClick={() => handleAction('scan', endpoint.id)}
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                              Varredura
                            </Button>
                            {planLimits.features.isolation && (
                              <Button
                                variant="outline"
                                size="sm"
                                className={endpoint.isIsolated ? 
                                  "bg-red-900/30 border-red-800 hover:bg-red-800" :
                                  "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
                                }
                                onClick={() => handleAction(endpoint.isIsolated ? 'restore' : 'isolate', endpoint.id)}
                              >
                                <LockClosedIcon className="h-4 w-4 mr-1.5" />
                                {endpoint.isIsolated ? 'Restaurar' : 'Isolar'}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className={`text-xs ${
                            endpoint.protectionStatus === 'protected' ? 'text-green-500' : 'text-yellow-500'
                          }`}>
                            {endpoint.protectionStatus === 'protected' ? 'Protegido' : 'Em Risco'}
                          </span>
                          <span className="text-xs text-zinc-500">
                            Última atividade: {new Date(endpoint.lastSeen).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {endpoints.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-zinc-400">Nenhum endpoint registrado</p>
                        <Button
                          onClick={() => setShowAddEndpoint(true)}
                          disabled={!planLimits.canAddMore}
                          className="mt-4 bg-blue-600 hover:bg-blue-500"
                        >
                          Adicionar Primeiro Endpoint
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Installation Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assistente de Instalação</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Siga os passos para configurar a proteção no seu computador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Progresso</span>
                <span className="text-zinc-400">{Math.round(getStepProgress())}%</span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>

            {/* Current Step */}
            {activationStatus?.currentStep === 'DOWNLOAD_INSTALLER' && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ArrowDownTrayIcon className="h-5 w-5 text-blue-500" />
                    Baixar Instalador
                  </CardTitle>
                  <CardDescription>
                    Faça o download do instalador personalizado da Acronis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateInstaller('windows')}
                      className="bg-blue-600 hover:bg-blue-500"
                    >
                      <ComputerDesktopIcon className="h-4 w-4 mr-2" />
                      Windows
                    </Button>
                    <Button
                      onClick={() => generateInstaller('mac')}
                      variant="outline"
                      className="border-zinc-700"
                    >
                      <ComputerDesktopIcon className="h-4 w-4 mr-2" />
                      macOS
                    </Button>
                  </div>
                  
                  {installer && (
                    <div className="bg-zinc-900/50 p-4 rounded-lg">
                      <p className="text-sm text-zinc-400 mb-2">Link do instalador:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-zinc-800 p-2 rounded text-xs text-green-400 truncate">
                          {installer.url}
                        </code>
                        <Button
                          size="sm"
                          onClick={() => {
                            window.open(installer.url, '_blank');
                            updateActivationStep('DOWNLOAD_INSTALLER', 'complete');
                          }}
                          className="bg-green-600 hover:bg-green-500"
                        >
                          Baixar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activationStatus?.currentStep === 'INSTALL_DEVICE' && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ComputerDesktopIcon className="h-5 w-5 text-yellow-500" />
                    Instalar no Computador
                  </CardTitle>
                  <CardDescription>
                    Execute o instalador baixado e siga as instruções
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
                    <li>Execute o arquivo baixado como administrador</li>
                    <li>Siga as instruções do assistente de instalação</li>
                    <li>Aguarde a conclusão da instalação</li>
                    <li>Reinicie o computador se solicitado</li>
                  </ol>
                  
                  <Button
                    onClick={() => updateActivationStep('INSTALL_DEVICE', 'complete')}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Confirmar Instalação
                  </Button>
                </CardContent>
              </Card>
            )}

            {activationStatus?.currentStep === 'VERIFY_EMAIL' && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                    Verificar Configuração
                  </CardTitle>
                  <CardDescription>
                    Confirme que a proteção está ativa no seu computador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-900/50 p-4 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-2">
                      Verifique se o ícone da Acronis aparece na bandeja do sistema e se a proteção está ativa.
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => updateActivationStep('VERIFY_EMAIL', 'complete')}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Confirmar Proteção Ativa
                  </Button>
                </CardContent>
              </Card>
            )}

            {activationStatus?.currentStep === 'COMPLETED' && (
              <Card className="bg-green-900/20 border-green-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    Configuração Concluída
                  </CardTitle>
                  <CardDescription>
                    Parabéns! Seu computador está protegido pela Acronis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">
                    A proteção está ativa e monitorando seu sistema em tempo real.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWizard(false)}
              className="border-zinc-700"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Endpoint Dialog */}
      <Dialog open={showAddEndpoint} onOpenChange={setShowAddEndpoint}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Endpoint</DialogTitle>
            <DialogDescription>
              Registre um novo dispositivo para proteção
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Dispositivo</Label>
              <Input
                id="name"
                value={newEndpointName}
                onChange={(e) => setNewEndpointName(e.target.value)}
                placeholder="Ex: Laptop-Marketing-01"
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="os">Sistema Operacional</Label>
              <select
                id="os"
                value={newEndpointOS}
                onChange={(e) => setNewEndpointOS(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm"
              >
                <option value="windows">Windows</option>
                <option value="mac">macOS</option>
                <option value="linux">Linux</option>
              </select>
            </div>

            {planLimits.max !== null && (
              <div className="pt-2">
                <p className="text-sm text-zinc-400">
                  Endpoints: {planLimits.current} / {planLimits.max}
                </p>
                {!planLimits.canAddMore && (
                  <p className="text-sm text-red-400 mt-1">
                    Limite de endpoints atingido. Faça upgrade do plano para adicionar mais.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddEndpoint(false)}
              className="border-zinc-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddEndpoint}
              disabled={isAddingEndpoint || !newEndpointName || !planLimits.canAddMore}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {isAddingEndpoint ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border border-white/30 border-t-white mr-2"></div>
                  Registrando...
                </>
              ) : (
                'Registrar Endpoint'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 