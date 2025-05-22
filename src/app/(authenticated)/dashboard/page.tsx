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
  UserPlusIcon
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  useEffect(() => {
    // Verifica se o usuário está autenticado e não é premium
    if (status === 'authenticated' && session?.user && session.user.plan !== 'premium') {
      router.push('/bloqueado'); // Redireciona para a página de bloqueio
    }
  }, [session, status, router]);

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
  if (status === 'loading' || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#2b2a2c]">
        <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Se não for premium, não renderiza o conteúdo
  if (session.user.plan !== 'premium') {
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-4">
      <div className="container mx-auto pl-1 sm:pl-4 md:pl-8 lg:pl-16 max-w-[98%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Dashboard</h1>
            <p className="text-sm sm:text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Visualize o desempenho da sua clínica</p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-8 bg-zinc-800/50 border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800 text-sm sm:text-xs">
                <SelectValue placeholder="Escolha o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={fetchDashboardData}
              className="h-10 sm:h-8 bg-zinc-800/50 border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800 text-sm sm:text-xs"
            >
              <ArrowPathIcon className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-2 sm:mr-1.5" />
              Atualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-zinc-800/50 border-zinc-700 shadow-[0_4px_12px_rgba(0,0,0,0.2)] p-1 rounded-2xl max-w-[240px]">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-0 text-zinc-400 hover:text-white transition-colors rounded-xl text-xs"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:border-b-0 text-zinc-400 hover:text-white transition-colors rounded-xl text-xs"
            >
              Detalhamento
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            {/* Cards principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-2 sm:pb-1 pt-4 sm:pt-3 px-6 sm:px-4">
                  <CardTitle className="text-base sm:text-sm md:text-base font-bold flex items-center text-white tracking-[-0.03em] font-inter">
                    <CurrencyDollarIcon className="h-5 w-5 sm:h-4 sm:w-4 mr-2 text-emerald-500" />
                    Faturamento
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Receita no período selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-4 sm:pb-3 px-6 sm:px-4">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl sm:text-xl md:text-2xl font-semibold text-white">
                      {loading ? (
                        <Skeleton className="h-9 w-24 bg-zinc-800" />
                      ) : (
                        `R$ ${dashboardData?.revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`
                      )}
                    </p>
                    <Badge variant="outline" className="bg-emerald-950/50 text-emerald-400 border-emerald-800 text-sm sm:text-xs">
                      <ArrowTrendingUpIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-1" />
                      {loading ? <Skeleton className="h-4 w-12" /> : '15%'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-2 sm:pb-1 pt-4 sm:pt-3 px-6 sm:px-4">
                  <CardTitle className="text-base sm:text-sm md:text-base font-bold flex items-center text-white tracking-[-0.03em] font-inter">
                    <UsersIcon className="h-5 w-5 sm:h-4 sm:w-4 mr-2 text-blue-500" />
                    Leads
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Total de leads capturados
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-4 sm:pb-3 px-6 sm:px-4">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl sm:text-xl md:text-2xl font-semibold text-white">
                      {loading ? (
                        <Skeleton className="h-9 w-16 bg-zinc-800" />
                      ) : (
                        dashboardData?.totalLeads?.toLocaleString('pt-BR') || '0'
                      )}
                    </p>
                    <Badge variant="outline" className="bg-blue-950/50 text-blue-400 border-blue-800 text-sm sm:text-xs">
                      <ArrowTrendingUpIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-1" />
                      {loading ? <Skeleton className="h-4 w-12" /> : '12%'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-2 sm:pb-1 pt-4 sm:pt-3 px-6 sm:px-4">
                  <CardTitle className="text-base sm:text-sm md:text-base font-bold flex items-center text-white tracking-[-0.03em] font-inter">
                    <RocketLaunchIcon className="h-5 w-5 sm:h-4 sm:w-4 mr-2 text-purple-500" />
                    Conversão
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Taxa de conversão média
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-4 sm:pb-3 px-6 sm:px-4">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl sm:text-xl md:text-2xl font-semibold text-white">
                      {loading ? (
                        <Skeleton className="h-9 w-16 bg-zinc-800" />
                      ) : (
                        `${(dashboardData?.conversionRate || 0).toFixed(1)}%`
                      )}
                    </p>
                    <Badge variant="outline" className="bg-purple-950/50 text-purple-400 border-purple-800 text-sm sm:text-xs">
                      <ArrowTrendingUpIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-1" />
                      {loading ? <Skeleton className="h-4 w-12" /> : '5%'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-2 sm:pb-1 pt-4 sm:pt-3 px-6 sm:px-4">
                  <CardTitle className="text-base sm:text-sm md:text-base font-bold flex items-center text-white tracking-[-0.03em] font-inter">
                    <UserPlusIcon className="h-5 w-5 sm:h-4 sm:w-4 mr-2 text-amber-500" />
                    Indicações
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Total de indicações
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-4 sm:pb-3 px-6 sm:px-4">
                  <div className="flex items-end justify-between">
                    <p className="text-2xl sm:text-xl md:text-2xl font-semibold text-white">
                      {loading ? (
                        <Skeleton className="h-9 w-16 bg-zinc-800" />
                      ) : (
                        dashboardData?.totalIndications?.toLocaleString('pt-BR') || '0'
                      )}
                    </p>
                    <Badge variant="outline" className="bg-amber-950/50 text-amber-400 border-amber-800 text-sm sm:text-xs">
                      <ArrowTrendingUpIcon className="h-3.5 w-3.5 sm:h-3 sm:w-3 mr-1" />
                      {loading ? <Skeleton className="h-4 w-12" /> : '8%'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
                    Fontes de Tráfego
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Principais origens dos leads
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sourceChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                '#0070df',
                                '#00a3ff',
                                '#00c7ff',
                                '#00e1ff',
                              ][index % 4]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Legend 
                          formatter={(value) => <span className="text-zinc-300">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-1 pt-3 px-4">
                  <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
                    Top Indicações
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Indicações com mais leads
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={indicationChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0070df" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0070df" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#71717a"
                          tick={{ fill: '#71717a', fontSize: 12 }}
                          axisLine={{ stroke: '#27272a' }}
                        />
                        <YAxis 
                          stroke="#71717a"
                          tick={{ fill: '#71717a', fontSize: 12 }}
                          axisLine={{ stroke: '#27272a' }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="leads" fill="url(#colorBar)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl mb-6">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
                  Crescimento de Receita
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                  Evolução do faturamento ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-4">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: 'Jan', value: 4000 },
                        { name: 'Fev', value: 3000 },
                        { name: 'Mar', value: 2000 },
                        { name: 'Abr', value: 2780 },
                        { name: 'Mai', value: 1890 },
                        { name: 'Jun', value: 2390 },
                        { name: 'Jul', value: 3490 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0070df" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0070df" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a"
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        axisLine={{ stroke: '#27272a' }}
                      />
                      <YAxis 
                        stroke="#71717a"
                        tick={{ fill: '#71717a', fontSize: 12 }}
                        axisLine={{ stroke: '#27272a' }}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#18181b',
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0070df" 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl mt-8">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-bold text-white tracking-[-0.03em] font-inter">Estatísticas</CardTitle>
                <CardDescription className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">
                  Métricas e indicadores de desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Taxa de Conversão</p>
                    <div className="flex items-center">
                      <div className="w-full bg-zinc-800 h-2 rounded-full mr-3">
                        <div 
                          className="bg-gradient-to-r from-[#0070df] to-[#0070df]/80 h-2 rounded-full" 
                          style={{ width: `${Math.min(dashboardData?.conversionRate || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-medium">
                        {Math.min(dashboardData?.conversionRate || 0, 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="bg-zinc-800" />
                  
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Eficiência de Captura</p>
                    <div className="flex items-center">
                      <div className="w-full bg-zinc-800 h-2 rounded-full mr-3">
                        <div 
                          className="bg-gradient-to-r from-[#eaf212] to-[#eaf212]/80 h-2 rounded-full" 
                          style={{ width: `${Math.min(dashboardData?.clickToLeadRate || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-medium">
                        {Math.min(dashboardData?.clickToLeadRate || 0, 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-bold text-white tracking-[-0.03em] font-inter">Todos os Indicadores</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">
                    Detalhamento completo dos links de indicação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-zinc-400">Carregando...</p>
                  ) : dashboardData?.topIndications && dashboardData.topIndications.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 text-sm text-zinc-500 pb-2 border-b border-zinc-800">
                        <div className="col-span-5">INDICADOR</div>
                        <div className="col-span-4">LINK</div>
                        <div className="col-span-2 text-right">LEADS</div>
                        <div className="col-span-1 text-right">CLIQUES</div>
                      </div>
                      {dashboardData?.topIndications?.map((indication) => (
                        <div key={indication.id} className="grid grid-cols-12 items-center py-3 hover:bg-zinc-800/50 rounded-md transition-colors">
                          <div className="col-span-5 text-white font-medium">{indication.name || indication.slug}</div>
                          <div className="col-span-4 text-sm text-zinc-400 truncate">
                            med1.app/{session?.user?.name || '...'}/{indication.slug}
                          </div>
                          <div className="col-span-2 text-right">
                            <Badge className="bg-blue-950/50 text-blue-400 border-blue-800">
                              {indication._count.leads}
                            </Badge>
                          </div>
                          <div className="col-span-1 text-right">
                            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                              {indication._count.events}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-zinc-800/50 rounded-lg p-6 text-center">
                      <p className="text-zinc-400">Nenhum indicador registrado ainda.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-bold text-white tracking-[-0.03em] font-inter">Estatísticas</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">
                    Métricas e indicadores de desempenho
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Taxa de Conversão</p>
                      <div className="flex items-center">
                        <div className="w-full bg-zinc-800 h-2 rounded-full mr-3">
                          <div 
                            className="bg-gradient-to-r from-[#0070df] to-[#0070df]/80 h-2 rounded-full" 
                            style={{ width: `${Math.min(dashboardData?.conversionRate || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-white font-medium">
                          {Math.min(dashboardData?.conversionRate || 0, 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-800" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Total de Cliques</p>
                        <p className="text-xl font-medium text-white">{dashboardData?.totalClicks || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Eficiência</p>
                        <p className="text-xl font-medium text-white">
                          {dashboardData?.totalClicks 
                            ? (dashboardData.totalLeads / dashboardData.totalClicks).toFixed(2) 
                            : "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Leads por Link</p>
                        <p className="text-xl font-medium text-white">
                          {dashboardData?.totalIndications 
                            ? (dashboardData.totalLeads / dashboardData.totalIndications).toFixed(1) 
                            : "0.0"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-zinc-400 mb-1">Cliques por Link</p>
                        <p className="text-xl font-medium text-white">
                          {dashboardData?.totalIndications 
                            ? (dashboardData.totalClicks / dashboardData.totalIndications).toFixed(1) 
                            : "0.0"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
