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
    networkProtection: boolean;
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

export default function BitdefenderPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
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
      isolation: true,
      networkProtection: true
    }
  });
  const [showAddEndpoint, setShowAddEndpoint] = useState(false);
  const [newEndpointName, setNewEndpointName] = useState('');
  const [newEndpointOS, setNewEndpointOS] = useState('windows');
  const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);

  // Fetch security data
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const [statsResponse, endpointsResponse] = await Promise.all([
          fetch('/api/security/bitdefender/stats'),
          fetch('/api/security/bitdefender/endpoints')
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

    if (session?.user) {
      fetchSecurityData();
    }
  }, [session]);

  const handleAddEndpoint = async () => {
    if (!newEndpointName) {
      toast.error("Nome do dispositivo é obrigatório");
      return;
    }

    setIsAddingEndpoint(true);
    try {
      const response = await fetch('/api/security/bitdefender/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEndpointName,
          os: newEndpointOS
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Dispositivo adicionado com sucesso");
        setShowAddEndpoint(false);
        setNewEndpointName('');
        setNewEndpointOS('windows');
        // Atualizar a lista de endpoints
        const endpointsResponse = await fetch('/api/security/bitdefender/endpoints');
        const endpointsData = await endpointsResponse.json();
        if (endpointsResponse.ok) {
          setEndpoints(endpointsData.endpoints);
          setPlanLimits(endpointsData.limits);
        }
      } else {
        throw new Error(data.error || 'Failed to add endpoint');
      }
    } catch (error) {
      console.error('Error adding endpoint:', error);
      toast.error("Não foi possível adicionar o dispositivo");
    } finally {
      setIsAddingEndpoint(false);
    }
  };

  const handleAction = async (action: string, deviceId?: string) => {
    try {
      toast.success(`Ação ${action} executada com sucesso`);
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error("Não foi possível executar a ação");
    }
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
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <span className="bg-red-900/30 text-red-500 text-xs px-2 py-0.5 rounded-full">Ativo</span>;
      case 'contained':
        return <span className="bg-yellow-900/30 text-yellow-500 text-xs px-2 py-0.5 rounded-full">Contido</span>;
      case 'resolved':
        return <span className="bg-green-900/30 text-green-500 text-xs px-2 py-0.5 rounded-full">Resolvido</span>;
      default:
        return <span className="bg-gray-900/30 text-gray-500 text-xs px-2 py-0.5 rounded-full">Desconhecido</span>;
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

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
      <div className="container mx-auto px-0 sm:pl-4 md:pl-8 lg:pl-16 max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Proteção Bitdefender</h1>
              <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">
                Monitore e proteja sua infraestrutura
              </p>
            </div>
          </div>

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
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 text-white"
                      onClick={() => handleAction('scan')}
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      Varredura Completa
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 text-white"
                      onClick={() => handleAction('isolate')}
                    >
                      <LockClosedIcon className="h-5 w-5 mr-2" />
                      Isolar Endpoint
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 text-white"
                      onClick={() => handleAction('update')}
                    >
                      <ServerIcon className="h-5 w-5 mr-2" />
                      Atualizar Definições
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
                              className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 text-white"
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
                                  "bg-red-900/30 border-red-800 hover:bg-red-800 text-white" :
                                  "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 text-white"
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
                          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white"
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

      {/* Add Endpoint Dialog */}
      <Dialog open={showAddEndpoint} onOpenChange={setShowAddEndpoint}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Dispositivo</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Adicione um novo dispositivo para proteção do Bitdefender
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-zinc-300">Nome do Dispositivo</Label>
              <Input
                id="name"
                value={newEndpointName}
                onChange={(e) => setNewEndpointName(e.target.value)}
                placeholder="Ex: Laptop do João"
                className="bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="os" className="text-sm text-zinc-300">Sistema Operacional</Label>
              <select
                id="os"
                value={newEndpointOS}
                onChange={(e) => setNewEndpointOS(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300"
              >
                <option value="windows">Windows</option>
                <option value="mac">macOS</option>
                <option value="linux">Linux</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEndpoint(false)} className="border-zinc-700">
              Cancelar
            </Button>
            <Button onClick={handleAddEndpoint} disabled={isAddingEndpoint} className="bg-blue-600 hover:bg-blue-500">
              {isAddingEndpoint && (
                <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 