'use client';

import { useEffect, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface Endpoint {
  id: string;
  name: string;
  os: string;
  status: string;
  lastSeen: string | null;
  version: string;
  isIsolated: boolean;
  protectionStatus: string;
  ipAddress: string;
  macAddress: string;
}

export function Endpoints() {
  const [loading, setLoading] = useState(true);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  useEffect(() => {
    fetchEndpoints();
  }, []);

  async function fetchEndpoints() {
    try {
      const response = await fetch("/api/security/bitdefender/endpoints");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setEndpoints(data.endpoints);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao carregar endpoints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case "protected":
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case "at_risk":
        return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  }

  const columns: ColumnDef<Endpoint>[] = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "os",
      header: "Sistema",
    },
    {
      accessorKey: "protectionStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("protectionStatus") as string;
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "version",
      header: "Versão",
    },
    {
      accessorKey: "ipAddress",
      header: "IP",
    },
    {
      accessorKey: "lastSeen",
      header: "Última Conexão",
      cell: ({ row }) => {
        const date = row.getValue("lastSeen") as string;
        return date ? new Date(date).toLocaleString() : "N/A";
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={endpoints} />
    </div>
  );
} 