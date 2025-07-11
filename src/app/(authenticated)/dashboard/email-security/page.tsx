'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function EmailSecurityPage() {
  const emailStats = {
    scannedEmails: 15234,
    blockedThreats: 142,
    phishingAttempts: 84,
    malwareDetected: 58,
    spamBlocked: 2847,
    securityScore: 99.1,
    dlpIncidents: 3
  };

  const protectionMetrics = [
    {
      name: "Anti-Phishing",
      protected: 84,
      total: 84,
      rate: 100,
      details: "All attempts blocked"
    },
    {
      name: "Anti-Malware",
      protected: 58,
      total: 58,
      rate: 100,
      details: "All threats contained"
    },
    {
      name: "Anti-Spam",
      protected: 2847,
      total: 2892,
      rate: 98.4,
      details: "Spam messages filtered"
    },
    {
      name: "DLP Protection",
      protected: 45,
      total: 48,
      rate: 93.8,
      details: "Data leaks prevented"
    }
  ];

  const recentThreats = [
    {
      type: "Phishing Campaign",
      target: "marketing@company.com",
      timestamp: "2024-03-20 15:45",
      severity: "high",
      status: "blocked",
      details: "Credential harvesting attempt detected"
    },
    {
      type: "Malware Attachment",
      target: "finance@company.com",
      timestamp: "2024-03-20 14:30",
      severity: "high",
      status: "quarantined",
      details: "Suspicious executable in attachment"
    },
    {
      type: "Data Exfiltration",
      target: "sales@company.com",
      timestamp: "2024-03-20 13:15",
      severity: "medium",
      status: "blocked",
      details: "Unauthorized sensitive data transfer"
    },
    {
      type: "Spam Campaign",
      target: "support@company.com",
      timestamp: "2024-03-20 12:45",
      severity: "low",
      status: "filtered",
      details: "Bulk marketing campaign blocked"
    }
  ];

  const domainProtection = [
    {
      domain: "company.com",
      spf: "valid",
      dkim: "valid",
      dmarc: "enforced",
      score: 100
    },
    {
      domain: "company.net",
      spf: "valid",
      dkim: "valid",
      dmarc: "enforced",
      score: 100
    },
    {
      domain: "company.org",
      spf: "valid",
      dkim: "pending",
      dmarc: "monitoring",
      score: 85
    }
  ];

  return (
    <div className="min-h-screen bg-[#1c1d20]">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#f5f5f7] mb-1">Email Security</h1>
          <p className="text-sm text-[#f5f5f7]/70">Advanced Email Protection & Analysis</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{emailStats.securityScore}%</div>
              <Progress value={emailStats.securityScore} className="h-1 mt-2 bg-[#f5f5f7]/5" />
              <p className="text-xs text-[#f5f5f7]/50 mt-2">Email Protection Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Scanned Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{emailStats.scannedEmails}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/50">Last 30 days</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Blocked Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{emailStats.blockedThreats}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/50">Threats neutralized</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">DLP Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{emailStats.dlpIncidents}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/50">Active investigations</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Protection Metrics & Recent Threats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Protection Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {protectionMetrics.map((metric, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{metric.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                        {metric.protected}/{metric.total}
                      </span>
                    </div>
                    <Progress value={metric.rate} className="h-1 bg-[#f5f5f7]/5" />
                    <p className="text-xs text-[#f5f5f7]/50 mt-2">{metric.details}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Recent Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentThreats.map((threat, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#f5f5f7]">{threat.type}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                            {threat.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#f5f5f7]/50 mt-1">Target: {threat.target}</p>
                        <p className="text-xs text-[#f5f5f7]/40 mt-1">{threat.details}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                            {threat.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-[#f5f5f7]/40">{threat.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Domain Protection */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Domain Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domainProtection.map((domain, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{domain.domain}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                        {domain.score}%
                      </span>
                    </div>
                    <Progress value={domain.score} className="h-1 bg-[#f5f5f7]/5" />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-xs">
                        <span className="text-[#f5f5f7]/50">SPF: </span>
                        <span className="text-[#f5f5f7]/70">{domain.spf}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-[#f5f5f7]/50">DKIM: </span>
                        <span className="text-[#f5f5f7]/70">{domain.dkim}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-[#f5f5f7]/50">DMARC: </span>
                        <span className="text-[#f5f5f7]/70">{domain.dmarc}</span>
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