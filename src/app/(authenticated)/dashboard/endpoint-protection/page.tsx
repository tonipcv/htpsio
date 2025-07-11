'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export default function EndpointProtectionPage() {
  const [scanProgress, setScanProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Simulated endpoint data
  const endpointStats = {
    totalEndpoints: 284,
    protectedEndpoints: 280,
    activeThreats: 3,
    resolvedThreats: 156,
    securityScore: 97.8,
    patchCompliance: 98.2
  };

  const endpointTypes = [
    { type: "Workstations", total: 156, protected: 154, health: 98.7 },
    { type: "Servers", total: 48, protected: 48, health: 100 },
    { type: "Mobile Devices", total: 68, protected: 67, health: 98.5 },
    { type: "IoT Devices", total: 12, protected: 11, health: 91.7 }
  ];

  const securityControls = [
    {
      name: "Real-time Protection",
      status: "active",
      coverage: 100,
      activity: "Monitoring system calls"
    },
    {
      name: "Behavioral Analysis",
      status: "learning",
      coverage: 99.8,
      activity: "Processing endpoint patterns"
    },
    {
      name: "Threat Prevention",
      status: "active",
      coverage: 100,
      activity: "Analyzing network traffic"
    },
    {
      name: "Patch Management",
      status: "updating",
      coverage: 98.2,
      activity: "Deploying security updates"
    }
  ];

  const recentThreats = [
    {
      type: "Suspicious Process",
      endpoint: "DESKTOP-7B2K9",
      timestamp: "2024-03-20 15:45",
      severity: "high",
      status: "contained",
      details: "Unauthorized system modification attempt"
    },
    {
      type: "Malware Detected",
      endpoint: "SERVER-DB01",
      timestamp: "2024-03-20 14:30",
      severity: "medium",
      status: "quarantined",
      details: "Suspicious file behavior detected"
    },
    {
      type: "Policy Violation",
      endpoint: "LAPTOP-MK932",
      timestamp: "2024-03-20 13:15",
      severity: "low",
      status: "resolved",
      details: "Unauthorized software installation attempt"
    }
  ];

  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanProgress(prev => (prev + 1) % 100);
    }, 150);

    const analysisInterval = setInterval(() => {
      setAnalysisProgress(prev => (prev + 2) % 100);
    }, 200);

    return () => {
      clearInterval(scanInterval);
      clearInterval(analysisInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#1c1d20]">
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#f5f5f7] mb-1">Endpoint Protection</h1>
          <p className="text-sm text-[#f5f5f7]/70">AI-Powered Security Analysis</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Protected Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{endpointStats.protectedEndpoints}/{endpointStats.totalEndpoints}</div>
              <Progress 
                value={(endpointStats.protectedEndpoints / endpointStats.totalEndpoints) * 100} 
                className="h-1 mt-2 bg-[#f5f5f7]/5" 
              />
              <p className="text-xs text-[#f5f5f7]/50 mt-2">98.6% Protection Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Security Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{endpointStats.securityScore}%</div>
              <Progress value={endpointStats.securityScore} className="h-1 mt-2 bg-[#f5f5f7]/5" />
              <p className="text-xs text-[#f5f5f7]/50 mt-2">Enterprise Security Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Active Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{endpointStats.activeThreats}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#f5f5f7]/50">{endpointStats.resolvedThreats} Resolved (30d)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#f5f5f7]/90">Patch Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-[#f5f5f7]">{endpointStats.patchCompliance}%</div>
              <Progress value={endpointStats.patchCompliance} className="h-1 mt-2 bg-[#f5f5f7]/5" />
              <p className="text-xs text-[#f5f5f7]/50 mt-2">Systems Up to Date</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Security Controls & Endpoint Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">AI Security Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityControls.map((control, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10 relative overflow-hidden">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#f5f5f7]">{control.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                          {control.status}
                        </span>
                      </div>
                      <Progress value={control.coverage} className="h-1 bg-[#f5f5f7]/5" />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-[#f5f5f7]/50">{control.activity}</p>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/30 animate-pulse" />
                          <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/20 animate-pulse [animation-delay:200ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Endpoint Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpointTypes.map((type, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#f5f5f7]">{type.type}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                        {type.protected}/{type.total}
                      </span>
                    </div>
                    <Progress value={type.health} className="h-1 bg-[#f5f5f7]/5" />
                    <p className="text-xs text-[#f5f5f7]/50 mt-2">{type.health}% health score</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Threats & Active Scan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <p className="text-xs text-[#f5f5f7]/50 mt-1">Endpoint: {threat.endpoint}</p>
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

          <Card className="bg-[#1c1d20] border-[#f5f5f7]/10">
            <CardHeader>
              <CardTitle className="text-base font-medium text-[#f5f5f7]">Active Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#f5f5f7]">Real-time Scan</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                      active
                    </span>
                  </div>
                  <Progress value={scanProgress} className="h-1 bg-[#f5f5f7]/5" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-[#f5f5f7]/50">Scanning system processes</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/30 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/20 animate-pulse [animation-delay:200ms]" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#f5f5f7]">AI Analysis</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7]/5 text-[#f5f5f7]/70">
                      processing
                    </span>
                  </div>
                  <Progress value={analysisProgress} className="h-1 bg-[#f5f5f7]/5" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-[#f5f5f7]/50">Analyzing behavior patterns</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/30 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/20 animate-pulse [animation-delay:200ms]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <p className="text-sm font-medium text-[#f5f5f7] mb-2">ML Model</p>
                    <div className="text-xs text-[#f5f5f7]/50">Training on new data</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/30 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/20 animate-pulse [animation-delay:200ms]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1c1d20] border border-[#f5f5f7]/10">
                    <p className="text-sm font-medium text-[#f5f5f7] mb-2">Threat Intel</p>
                    <div className="text-xs text-[#f5f5f7]/50">Updating signatures</div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/30 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-[#f5f5f7]/20 animate-pulse [animation-delay:200ms]" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 