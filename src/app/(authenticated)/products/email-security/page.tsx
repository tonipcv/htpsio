'use client';

import { Mail, Brain, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmailSecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">KRXMail™ Email Security</h1>
        <p className="text-zinc-400">Advanced email protection powered by AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-6 w-6 text-blue-500" />
              AI Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Machine learning algorithms that identify and block advanced threats in real-time.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-6 w-6 text-green-500" />
              DLP Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Prevent sensitive data leaks with smart content analysis and policy controls.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Mail className="h-6 w-6 text-purple-500" />
              Smart Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Automated enforcement of security rules based on user behavior and content.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-zinc-800">
        <h2 className="text-xl font-semibold text-white mb-4">Why Choose KRXMail™?</h2>
        <ul className="space-y-3 text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            AI-powered threat detection and prevention
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Advanced data loss prevention
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Automated policy enforcement
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Real-time protection against phishing
          </li>
        </ul>
      </div>
    </div>
  );
} 