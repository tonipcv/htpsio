'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function CloudProtectionPage() {
  // Mock data for enterprise cloud security environment
  const cloudStats = {
    totalResources: 1847,
    protectedResources: 1845,
    securityScore: 98.5,
    activeThreats: 2,
    criticalVulnerabilities: 1,
    highVulnerabilities: 4,
    mediumVulnerabilities: 12,
    complianceScore: 97.8,
  };

  const resourceDistribution = [
    { type: 'Compute Instances', total: 245, protected: 245, compliance: 100 },
    { type: 'Storage Buckets', total: 567, protected: 567, compliance: 100 },
    { type: 'Databases', total: 89, protected: 88, compliance: 98.9 },
    { type: 'Containers', total: 946, protected: 945, compliance: 99.9 },
  ];

  const securityControls = [
    {
      name: "Identity & Access",
      status: "enforced",
      coverage: 100,
      findings: 0,
    },
    {
      name: "Data Protection",
      status: "enforced",
      coverage: 99.8,
      findings: 2,
    },
    {
      name: "Network Security",
      status: "enforced",
      coverage: 100,
      findings: 0,
    },
    {
      name: "Workload Protection",
      status: "enforced",
      coverage: 99.9,
      findings: 1,
    },
  ];

  const recentIncidents = [
    {
      type: "Unauthorized Access Attempt",
      resource: "prod-db-cluster",
      timestamp: "2024-03-20 15:45",
      severity: "high",
      status: "blocked",
      details: "Multiple failed authentication attempts from unknown IP",
    },
    {
      type: "Suspicious API Activity",
      resource: "storage-bucket-prod",
      timestamp: "2024-03-20 14:30",
      severity: "medium",
      status: "investigating",
      details: "Unusual data access pattern detected",
    },
    {
      type: "Configuration Change",
      resource: "web-cluster-prod",
      timestamp: "2024-03-20 13:15",
      severity: "low",
      status: "resolved",
      details: "Security group modification detected and logged",
    },
  ];

  const complianceFrameworks = [
    {
      name: "SOC 2",
      controls: 124,
      compliant: 121,
      score: 97.6,
      status: "compliant"
    },
    {
      name: "ISO 27001",
      controls: 156,
      compliant: 153,
      score: 98.1,
      status: "compliant"
    },
    {
      name: "HIPAA",
      controls: 98,
      compliant: 96,
      score: 98.0,
      status: "compliant"
    },
    {
      name: "PCI DSS",
      controls: 78,
      compliant: 76,
      score: 97.4,
      status: "compliant"
    }
  ];

  return (
    <div className="min-h-screen bg-[#1c1d20]">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#f5f5f7] mb-1">KRXCloud™ Protection</h1>
          <p className="text-sm text-[#f5f5f7]/70">Cloud Infrastructure Security & Compliance</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Protected Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{cloudStats.protectedResources}/{cloudStats.totalResources}</div>
              <Progress 
                value={(cloudStats.protectedResources / cloudStats.totalResources) * 100} 
                className="h-1.5 mt-2 bg-[#f5f5f7]/10" 
              />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">99.9% Protection Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{cloudStats.securityScore}%</div>
              <Progress value={cloudStats.securityScore} className="h-1.5 mt-2 bg-[#f5f5f7]/10" />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">Enterprise Security Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Active Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{cloudStats.activeThreats}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/70">Under Investigation</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{cloudStats.complianceScore}%</div>
              <Progress value={cloudStats.complianceScore} className="h-1.5 mt-2 bg-[#f5f5f7]/10" />
              <p className="text-xs text-[#f5f5f7]/70 mt-2">Overall Compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Distribution & Security Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Resource Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceDistribution.map((resource, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{resource.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/10 text-[#f5f5f7]/70">
                        {resource.protected}/{resource.total}
                      </span>
                    </div>
                    <Progress value={resource.compliance} className="h-1.5 bg-[#f5f5f7]/10" />
                    <p className="text-xs text-[#f5f5f7]/70 mt-2">{resource.compliance}% protected</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Security Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityControls.map((control, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{control.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/10 text-[#f5f5f7]/70">
                        {control.findings} findings
                      </span>
                    </div>
                    <Progress value={control.coverage} className="h-1.5 bg-[#f5f5f7]/10" />
                    <p className="text-xs text-[#f5f5f7]/70 mt-2">{control.coverage}% coverage</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Recent Incidents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceFrameworks.map((framework, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{framework.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/10 text-[#f5f5f7]/70">
                        {framework.compliant}/{framework.controls}
                      </span>
                    </div>
                    <Progress value={framework.score} className="h-1.5 bg-[#f5f5f7]/10" />
                    <p className="text-xs text-[#f5f5f7]/70 mt-2">{framework.score}% compliant</p>
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
                        <p className="text-xs text-[#f5f5f7]/70 mt-1">Resource: {incident.resource}</p>
                        <p className="text-xs text-[#f5f5f7]/50 mt-1">{incident.details}</p>
                      </div>
                      <div className="text-xs text-[#f5f5f7]/50">{incident.timestamp}</div>
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