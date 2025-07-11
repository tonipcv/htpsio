'use client';

import { Shield, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EndpointProtectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">KRXShield™ Endpoint Protection</h1>
        <p className="text-zinc-400">Comprehensive endpoint security powered by AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-6 w-6 text-blue-500" />
              Next-gen Antivirus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Real-time protection against malware, ransomware, and zero-day threats with AI-powered detection.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-6 w-6 text-green-500" />
              Behavioral Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Continuous monitoring of all processes to detect and block suspicious activities in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="h-6 w-6 text-purple-500" />
              Smart Firewall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Adaptive network protection with automatic policy enforcement and threat blocking.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">Why Choose KRXShield™?</h2>
        <ul className="space-y-3 text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Advanced AI-powered threat detection and prevention
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Real-time behavioral monitoring and analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Automated response to security incidents
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Comprehensive endpoint visibility and control
          </li>
        </ul>
      </div>
    </div>
  );
} 