'use client';

import { Smartphone, Lock, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MobileSecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">KRXMobile™ Mobile Security</h1>
        <p className="text-zinc-400">Enterprise-grade mobile security for your workforce</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-6 w-6 text-blue-500" />
              Enterprise VPN
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Secure, encrypted connections for remote work with automatic tunneling and access control.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Smartphone className="h-6 w-6 text-green-500" />
              Device Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Centralized control for app deployment, updates, and security policies across all devices.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Box className="h-6 w-6 text-purple-500" />
              Container Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Isolated workspace for corporate data with zero-trust access control and data protection.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">Why Choose KRXMobile™?</h2>
        <ul className="space-y-3 text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Secure access to corporate resources from any device
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Complete visibility and control over mobile assets
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Zero-trust security model for data protection
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Seamless user experience with enterprise-grade security
          </li>
        </ul>
      </div>
    </div>
  );
} 