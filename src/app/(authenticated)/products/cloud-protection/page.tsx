'use client';

import { Cloud, Server, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CloudProtectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">KRXCloud™ Cloud Protection</h1>
        <p className="text-zinc-400">Cloud-native security for modern infrastructure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Server className="h-6 w-6 text-blue-500" />
              Workload Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Automated protection for cloud servers, containers, and serverless functions.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cloud className="h-6 w-6 text-green-500" />
              Container Defense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Security scanning and runtime protection for containerized applications.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="h-6 w-6 text-purple-500" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Encryption and access controls for cloud storage and databases.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">Why Choose KRXCloud™?</h2>
        <ul className="space-y-3 text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Comprehensive cloud workload protection
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Container security and compliance
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Advanced data protection
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Multi-cloud security management
          </li>
        </ul>
      </div>
    </div>
  );
} 