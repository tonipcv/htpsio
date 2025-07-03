'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  ChevronUpIcon, 
  PhoneIcon, 
  LinkIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CurrencyDollarIcon,
  UsersIcon,
  RocketLaunchIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ComputerDesktopIcon,
  ServerIcon,
  BoltIcon,
  LockClosedIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from 'next/navigation';

// Função para verificar se uma data é válida
const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Cores para os gráficos - Atualizando para usar as cores pastel especificadas
const COLORS = ['#0070df', '#eaf212', '#0070df/80', '#eaf212/80', '#0070df/60'];

interface Lead {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  utmSource?: string;
  utmMedium?: string;
  indication?: {
    name?: string;
    slug: string;
  };
}

interface Indication {
  id: string;
  slug: string;
  name?: string;
  _count: {
    leads: number;
    events: number;
  };
}

interface UtmSource {
  source: string;
  count: number;
}

interface DashboardData {
  totalLeads: number;
  totalIndications: number;
  totalClicks: number;
  conversionRate: number;
  recentLeads: Lead[];
  topIndications: Indication[];
  topSources: UtmSource[];
  totalRevenue: number;
  potentialRevenue: number;
  clickToLeadRate: number;
  totalPatients: number;
  revenue: number;
}

interface SecurityData {
  endpoints: {
    total: number;
    protected: number;
    atRisk: number;
    lastUpdated: string;
  };
  threats: {
    blocked: number;
    active: number;
    resolved: number;
  };
  compliance: {
    score: number;
    criticalIssues: number;
    warnings: number;
  };
  backup: {
    protected: number;
    lastBackup: string;
    totalSize: string;
  };
}

// Componente para formatar o Tooltip do gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-md border border-gray-200 shadow-md text-xs">
        <p className="text-gray-800 font-medium">{`${label}`}</p>
        <p className="text-blue-700">{`Leads: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [securityData, setSecurityData] = useState<SecurityData>({
    endpoints: {
      total: 0,
      protected: 0,
      atRisk: 0,
      lastUpdated: new Date().toISOString()
    },
    threats: {
      blocked: 0,
      active: 0,
      resolved: 0
    },
    compliance: {
      score: 0,
      criticalIssues: 0,
      warnings: 0
    },
    backup: {
      protected: 0,
      lastBackup: new Date().toISOString(),
      totalSize: '0 GB'
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
      fetchSecurityData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Erro ao buscar dados do dashboard:', 
          `Status: ${response.status} - ${response.statusText}`);
        // Definir valores padrão para não quebrar a interface
        setDashboardData({
          totalLeads: 0,
          totalIndications: 0,
          totalClicks: 0,
          conversionRate: 0,
          recentLeads: [],
          topIndications: [],
          topSources: [],
          totalRevenue: 0,
          potentialRevenue: 0,
          clickToLeadRate: 0,
          totalPatients: 0,
          revenue: 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', 
        error instanceof Error ? error.message : String(error));
      // Definir valores padrão para não quebrar a interface
      setDashboardData({
        totalLeads: 0,
        totalIndications: 0,
        totalClicks: 0,
        conversionRate: 0,
        recentLeads: [],
        topIndications: [],
        topSources: [],
        totalRevenue: 0,
        potentialRevenue: 0,
        clickToLeadRate: 0,
        totalPatients: 0,
        revenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        setSecurityData(data);
      } else {
        console.error('Error fetching security data:', 
          `Status: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching security data:', 
        error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráficos
  const sourceChartData = dashboardData?.topSources?.map(source => ({
    name: source.source || "Direto",
    value: source.count
  })) || [];

  const indicationChartData = dashboardData?.topIndications?.map(indication => ({
    name: indication.name || indication.slug,
    leads: indication._count.leads
  })) || [];

  // Mostra loading enquanto verifica
  if (authStatus === 'loading' || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2b2a2c]">
        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  const getProtectionStatus = () => {
    if (!securityData?.endpoints) return { statusColor: 'text-gray-500', statusText: 'Loading' };
    
    const { protected: protectedEndpoints, total } = securityData.endpoints;
    if (total === 0) return { statusColor: 'text-gray-500', statusText: 'No Data' };
    
    const protectedPercentage = (protectedEndpoints / total) * 100;
    if (protectedPercentage === 100) return { statusColor: 'text-green-500', statusText: 'Protected' };
    if (protectedPercentage >= 80) return { statusColor: 'text-yellow-500', statusText: 'At Risk' };
    return { statusColor: 'text-red-500', statusText: 'Critical' };
  };

  const protectionStatus = getProtectionStatus();

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-4">
        <div className="container mx-auto pl-1 sm:pl-4 md:pl-8 lg:pl-16 max-w-[98%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-4">
      <div className="container mx-auto pl-1 sm:pl-4 md:pl-8 lg:pl-16 max-w-[98%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Security Dashboard</h1>
            <p className="text-sm sm:text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Monitor your security status</p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-8 bg-zinc-800/50 border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800 text-sm sm:text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchSecurityData}
              className="h-10 sm:h-8 bg-zinc-800/50 border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800 text-sm sm:text-xs"
            >
              <ArrowPathIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Protection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldCheckIcon className={`h-8 w-8 ${protectionStatus.statusColor}`} />
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">{protectionStatus.statusText}</p>
                    <p className="text-sm text-zinc-400">
                      {securityData?.endpoints ? (
                        `${securityData.endpoints.protected} of ${securityData.endpoints.total} protected`
                      ) : (
                        'Loading...'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">{securityData?.threats?.active || 0}</p>
                    <p className="text-sm text-zinc-400">{securityData?.threats?.blocked || 0} blocked</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LockClosedIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">{securityData?.compliance?.score || 0}%</p>
                    <p className="text-sm text-zinc-400">{securityData?.compliance?.criticalIssues || 0} critical issues</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Backup Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ServerIcon className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-2xl font-bold text-white">{securityData?.backup?.protected || 0}</p>
                    <p className="text-sm text-zinc-400">
                      Last backup: {securityData?.backup?.lastBackup ? 
                        new Date(securityData.backup.lastBackup).toLocaleDateString() : 
                        'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-zinc-800/50 border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)] p-1 rounded-2xl max-w-[240px]">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-0 text-zinc-400 hover:text-white transition-colors rounded-xl text-xs"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-0 text-zinc-400 hover:text-white transition-colors rounded-xl text-xs"
            >
              Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Endpoint Protection</CardTitle>
                  <CardDescription className="text-zinc-400">Status of your protected devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Protected</span>
                      <Badge className="bg-green-900/50 text-green-400 border-green-800">
                        {securityData?.endpoints?.protected || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">At Risk</span>
                      <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-800">
                        {securityData?.endpoints?.atRisk || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Total</span>
                      <Badge className="bg-blue-900/50 text-blue-400 border-blue-800">
                        {securityData?.endpoints?.total || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Threat Analysis</CardTitle>
                  <CardDescription className="text-zinc-400">Recent security incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Active Threats</span>
                      <Badge className="bg-red-900/50 text-red-400 border-red-800">
                        {securityData?.threats?.active || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Blocked</span>
                      <Badge className="bg-green-900/50 text-green-400 border-green-800">
                        {securityData?.threats?.blocked || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Resolved</span>
                      <Badge className="bg-blue-900/50 text-blue-400 border-blue-800">
                        {securityData?.threats?.resolved || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-white">Compliance Details</CardTitle>
                <CardDescription className="text-zinc-400">Security compliance status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Compliance Score</span>
                    <Badge className="bg-blue-900/50 text-blue-400 border-blue-800">
                      {securityData?.compliance?.score || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Critical Issues</span>
                    <Badge className="bg-red-900/50 text-red-400 border-red-800">
                      {securityData?.compliance?.criticalIssues || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Warnings</span>
                    <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-800">
                      {securityData?.compliance?.warnings || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-white">Backup Information</CardTitle>
                <CardDescription className="text-zinc-400">Data protection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Protected Devices</span>
                    <Badge className="bg-purple-900/50 text-purple-400 border-purple-800">
                      {securityData?.backup?.protected || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Size</span>
                    <Badge className="bg-blue-900/50 text-blue-400 border-blue-800">
                      {securityData?.backup?.totalSize || '0 GB'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Last Backup</span>
                    <Badge className="bg-green-900/50 text-green-400 border-green-800">
                      {securityData?.backup?.lastBackup ? 
                        new Date(securityData.backup.lastBackup).toLocaleDateString() : 
                        'Never'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
