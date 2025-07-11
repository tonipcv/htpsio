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
import { Progress } from "@/components/ui/progress";

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

  // Mock data for overall security metrics
  const securityMetrics = {
    overallSecurityScore: 98.2,
    totalAssets: 2456,
    protectedAssets: 2453,
    activeThreats: 3,
    resolvedThreats: 147,
    complianceScore: 97.8
  };

  const securityDomains = [
    {
      name: "Cloud Protection",
      score: 98.5,
      metrics: {
        resources: "1845/1847",
        threats: 2,
        compliance: "97.8%"
      }
    },
    {
      name: "Email Security",
      score: 99.1,
      metrics: {
        scanned: "15.2K",
        blocked: 142,
        phishing: "0.8%"
      }
    },
    {
      name: "Mobile Security",
      score: 97.5,
      metrics: {
        devices: "328/332",
        risks: 4,
        compliance: "96.9%"
      }
    },
    {
      name: "Endpoint Protection",
      score: 97.8,
      metrics: {
        endpoints: "280/284",
        threats: 3,
        patched: "98.2%"
      }
    }
  ];

  const recentIncidents = [
    {
      type: "Unauthorized Access Attempt",
      domain: "Cloud Protection",
      asset: "prod-db-cluster",
      timestamp: "2024-03-20 15:45",
      severity: "high",
      status: "blocked"
    },
    {
      type: "Phishing Campaign",
      domain: "Email Security",
      asset: "marketing@company.com",
      timestamp: "2024-03-20 14:30",
      severity: "high",
      status: "blocked"
    },
    {
      type: "Malware Detected",
      domain: "Endpoint Protection",
      asset: "DESKTOP-7B2K9",
      timestamp: "2024-03-20 13:15",
      severity: "medium",
      status: "quarantined"
    },
    {
      type: "Policy Violation",
      domain: "Mobile Security",
      asset: "iPhone-12-AE35",
      timestamp: "2024-03-20 12:45",
      severity: "low",
      status: "resolved"
    }
  ];

  const complianceStatus = [
    {
      framework: "SOC 2",
      status: "Compliant",
      score: 97.6,
      lastAudit: "2024-03-15",
      nextAudit: "2024-06-15"
    },
    {
      framework: "ISO 27001",
      status: "Compliant",
      score: 98.1,
      lastAudit: "2024-02-28",
      nextAudit: "2024-05-28"
    },
    {
      framework: "HIPAA",
      status: "Compliant",
      score: 98.0,
      lastAudit: "2024-03-10",
      nextAudit: "2024-06-10"
    },
    {
      framework: "PCI DSS",
      status: "Compliant",
      score: 97.4,
      lastAudit: "2024-03-01",
      nextAudit: "2024-06-01"
    }
  ];

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
    <div className="min-h-screen bg-[#1c1d20]">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#f5f5f7] mb-1">Security Overview</h1>
          <p className="text-sm text-[#f5f5f7]/70">Enterprise Security Status</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{securityMetrics.overallSecurityScore}%</div>
              <Progress value={securityMetrics.overallSecurityScore} className="h-1.5 mt-2 bg-[#f5f5f7]/10" />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">Overall Security Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Protected Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{securityMetrics.protectedAssets}/{securityMetrics.totalAssets}</div>
              <Progress 
                value={(securityMetrics.protectedAssets / securityMetrics.totalAssets) * 100} 
                className="h-1.5 mt-2 bg-[#f5f5f7]/10" 
              />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">99.8% Protection Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Active Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{securityMetrics.activeThreats}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/70">{securityMetrics.resolvedThreats} Resolved (30d)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{securityMetrics.complianceScore}%</div>
              <Progress value={securityMetrics.complianceScore} className="h-1.5 mt-2 bg-[#f5f5f7]/10" />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">Overall Compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Domains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Security Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityDomains.map((domain, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{domain.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/10 text-[#f5f5f7]/70">
                        {domain.score}%
                      </span>
                    </div>
                    <Progress value={domain.score} className="h-1.5 bg-[#f5f5f7]/10" />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {Object.entries(domain.metrics).map(([key, value], j) => (
                        <div key={j} className="text-xs">
                          <span className="text-[#f5f5f7]/50">{key}: </span>
                          <span className="text-[#f5f5f7]/90">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#f5f5f7]">{incident.type}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            incident.severity === 'high' ? 'bg-red-400/10 text-red-400' :
                            incident.severity === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-[#f5f5f7]/10 text-[#f5f5f7]/70'
                          }`}>
                            {incident.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#f5f5f7]/70 mt-1">{incident.domain} | {incident.asset}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#f5f5f7]/50">{incident.status}</span>
                        </div>
                      </div>
                      <div className="text-xs text-[#f5f5f7]/50">{incident.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceStatus.map((framework, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{framework.framework}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">
                        {framework.status}
                      </span>
                    </div>
                    <Progress value={framework.score} className="h-1.5 bg-[#f5f5f7]/10" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-[#f5f5f7]/70">
                        Score: {framework.score}%
                      </div>
                      <div className="text-xs text-[#f5f5f7]/50">
                        Next Audit: {framework.nextAudit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
