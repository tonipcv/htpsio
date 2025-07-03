'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  CloudArrowUpIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface ProtectionStatus {
  endpointOk: boolean;
  endpointMessage: string;
  emailOk: boolean;
  emailMessage: string;
  backupOk: boolean;
  backupMessage: string;
  lastUpdated: string;
}

export default function ProtectionDashboard() {
  const [status, setStatus] = useState<ProtectionStatus>({
    endpointOk: false,
    endpointMessage: "Verificando status do computador...",
    emailOk: false,
    emailMessage: "Verificando proteção de email...",
    backupOk: false,
    backupMessage: "Verificando status do backup...",
    lastUpdated: new Date().toISOString()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsRefreshing(true);
    try {
      // TODO: Fetch real status from API
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus({
        endpointOk: true,
        endpointMessage: "Seu computador está protegido",
        emailOk: true,
        emailMessage: "Email protegido contra ameaças",
        backupOk: false,
        backupMessage: "Backup não configurado",
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const StatusIndicator = ({ ok }: { ok: boolean }) => (
    <div className={`
      h-12 w-12 rounded-full flex items-center justify-center
      ${ok ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}
    `}>
      {ok ? (
        <ShieldCheckIcon className="h-6 w-6" />
      ) : (
        <ShieldExclamationIcon className="h-6 w-6" />
      )}
    </div>
  );

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Painel de Proteção
              </h1>
              <p className="text-zinc-400">
                Monitore o status de proteção do seu ambiente
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchStatus}
              disabled={isRefreshing}
              className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar Status
            </Button>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Endpoint Protection */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ComputerDesktopIcon className="h-5 w-5 text-zinc-400" />
                  Computador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <StatusIndicator ok={status.endpointOk} />
                  <p className="text-zinc-400">
                    {status.endpointMessage}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Email Protection */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <EnvelopeIcon className="h-5 w-5 text-zinc-400" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <StatusIndicator ok={status.emailOk} />
                  <p className="text-zinc-400">
                    {status.emailMessage}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Backup */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CloudArrowUpIcon className="h-5 w-5 text-zinc-400" />
                  Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <StatusIndicator ok={status.backupOk} />
                  <p className="text-zinc-400">
                    {status.backupMessage}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Update Info */}
          <div className="text-center text-sm text-zinc-500">
            Última atualização: {formatLastUpdated(status.lastUpdated)}
          </div>
        </div>
      </div>
    </div>
  );
} 