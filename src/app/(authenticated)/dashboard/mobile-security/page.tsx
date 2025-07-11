'use client';

import { Smartphone, Lock, Shield, Wifi, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function MobileSecurityPage() {
  // Mock data para ambiente empresarial de segurança mobile
  const mobileStats = {
    enrolledDevices: 1247,
    totalDevices: 1250,
    complianceRate: 99.2,
    securityScore: 94.5,
    criticalAlerts: 1,
    highAlerts: 4,
    mediumAlerts: 12,
  };

  const osDistribution = [
    { os: 'iOS', version: '17.x', count: 456, compliance: 100 },
    { os: 'iOS', version: '16.x', count: 234, compliance: 98.5 },
    { os: 'Android', version: '14', count: 278, compliance: 99.8 },
    { os: 'Android', version: '13', count: 189, compliance: 97.4 },
    { os: 'Android', version: '12', count: 90, compliance: 95.6 },
  ];

  const securityPolicies = [
    {
      name: "Biometric Authentication",
      enforced: 1247,
      total: 1250,
      status: "enforced",
    },
    {
      name: "Screen Lock",
      enforced: 1250,
      total: 1250,
      status: "enforced",
    },
    {
      name: "Device Encryption",
      enforced: 1245,
      total: 1250,
      status: "partial",
    },
    {
      name: "App Verification",
      enforced: 1250,
      total: 1250,
      status: "enforced",
    },
    {
      name: "VPN Connection",
      enforced: 1242,
      total: 1250,
      status: "partial",
    },
  ];

  const recentIncidents = [
    {
      timestamp: "2024-03-20 15:45",
      device: "iPhone 14 Pro",
      user: "marina.sales",
      type: "Root Detection",
      details: "Tentativa de jailbreak detectada",
      status: "blocked",
      action: "Acesso corporativo suspenso",
    },
    {
      timestamp: "2024-03-20 14:30",
      device: "Samsung S23",
      user: "pedro.tech",
      type: "Malicious App",
      details: "Aplicativo suspeito detectado: fake.wallet.apk",
      status: "removed",
      action: "Aplicativo removido remotamente",
    },
    {
      timestamp: "2024-03-20 13:15",
      device: "iPhone 13",
      user: "julia.marketing",
      type: "Policy Violation",
      details: "MDM profile removido",
      status: "investigating",
      action: "Notificação enviada ao usuário",
    },
    {
      timestamp: "2024-03-20 12:00",
      device: "Pixel 7",
      user: "rafael.dev",
      type: "Network Threat",
      details: "Conexão com rede não autorizada",
      status: "resolved",
      action: "Conexão forçada via VPN corporativa",
    },
  ];

  const complianceChecks = [
    {
      category: "Sistema Operacional",
      checks: [
        { name: "Versão do OS", status: "passed", devices: 1238 },
        { name: "Patches de Segurança", status: "warning", devices: 1242 },
        { name: "Root/Jailbreak", status: "passed", devices: 1250 },
      ]
    },
    {
      category: "Configurações",
      checks: [
        { name: "Criptografia", status: "passed", devices: 1245 },
        { name: "Senha Complexa", status: "passed", devices: 1250 },
        { name: "Bloqueio Automático", status: "passed", devices: 1250 },
      ]
    },
    {
      category: "Aplicativos",
      checks: [
        { name: "Apps Corporativos", status: "warning", devices: 1235 },
        { name: "Apps Não Autorizados", status: "alert", devices: 1240 },
        { name: "Versões dos Apps", status: "passed", devices: 1247 },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#1c1d20]">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#f5f5f7] mb-1">KRXMobile™ Security</h1>
          <p className="text-sm text-[#f5f5f7]/70">Mobile Device Management & Security</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Enrolled Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{mobileStats.enrolledDevices}/{mobileStats.totalDevices}</div>
              <Progress 
                value={(mobileStats.enrolledDevices / mobileStats.totalDevices) * 100} 
                className="h-1.5 mt-2 bg-[#f5f5f7]/10"
              />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">99.8% Enrollment Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{mobileStats.securityScore}%</div>
              <Progress value={mobileStats.securityScore} className="h-1.5 mt-2 bg-[#f5f5f7]/10" />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">Enterprise Security Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{mobileStats.complianceRate}%</div>
              <Progress value={mobileStats.complianceRate} className="h-1.5 mt-2 bg-[#f5f5f7]/10" />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">Policy Compliance</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-400">Critical</span>
                  <span className="text-xs text-[#f5f5f7]">{mobileStats.criticalAlerts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-orange-400">High</span>
                  <span className="text-xs text-[#f5f5f7]">{mobileStats.highAlerts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-yellow-400">Medium</span>
                  <span className="text-xs text-[#f5f5f7]">{mobileStats.mediumAlerts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OS Distribution & Security Policies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">OS Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {osDistribution.map((os, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium text-[#f5f5f7]">{os.os} {os.version}</span>
                        <span className="text-xs text-[#f5f5f7]/70 ml-2">({os.count} devices)</span>
                      </div>
                      <span className="text-xs text-[#f5f5f7]/70">{os.compliance}% compliant</span>
                    </div>
                    <Progress value={os.compliance} className="h-1 bg-[#f5f5f7]/10" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Security Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityPolicies.map((policy, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{policy.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        policy.status === 'enforced' ? 'bg-green-900/50 text-green-400' :
                        policy.status === 'partial' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {policy.enforced}/{policy.total}
                      </span>
                    </div>
                    <Progress 
                      value={(policy.enforced / policy.total) * 100} 
                      className="h-1 bg-[#f5f5f7]/10"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Status */}
        <Card className="bg-[#1c1d20] border-[#f5f5f7]/10 mb-6">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[#f5f5f7]">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceChecks.map((category, i) => (
                <div key={i}>
                  <h3 className="text-sm font-medium text-[#f5f5f7]/90 mb-2">{category.category}</h3>
                  <div className="space-y-2">
                    {category.checks.map((check, j) => (
                      <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                        <div>
                          <p className="text-sm text-[#f5f5f7] font-medium">{check.name}</p>
                          <p className="text-xs text-[#f5f5f7]/70">{check.devices} devices</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          check.status === 'passed' ? 'bg-green-900/50 text-green-400' :
                          check.status === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {check.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
          <CardHeader>
            <CardTitle className="text-base font-medium text-[#f5f5f7]">Recent Security Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentIncidents.map((incident, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#f5f5f7]">{incident.type}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        incident.status === 'blocked' ? 'bg-red-900/50 text-red-400' :
                        incident.status === 'removed' ? 'bg-green-900/50 text-green-400' :
                        incident.status === 'investigating' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-blue-900/50 text-blue-400'
                      }`}>
                        {incident.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[#f5f5f7]/70 mt-1">
                      <span className="text-[#f5f5f7]/50">Device:</span> {incident.device} | 
                      <span className="text-[#f5f5f7]/50"> User:</span> {incident.user}
                    </p>
                    <p className="text-xs text-[#f5f5f7]/60 mt-1">{incident.details}</p>
                    <p className="text-xs text-[#f5f5f7]/70 mt-1">{incident.action}</p>
                  </div>
                  <p className="text-sm text-[#f5f5f7]/70">{incident.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 