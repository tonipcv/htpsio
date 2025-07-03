'use client';

import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

interface Stats {
  total: number;
  protected: number;
  atRisk: number;
}

export function Overview() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    protected: 0,
    atRisk: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/security/bitdefender/endpoints");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        const protectedCount = data.endpoints.filter((e: any) => 
          e.protectionStatus?.toLowerCase() === "protected"
        ).length;

        const atRiskCount = data.endpoints.filter((e: any) => 
          e.protectionStatus?.toLowerCase() === "at_risk"
        ).length;

        setStats({
          total: data.endpoints.length,
          protected: protectedCount,
          atRisk: atRiskCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <div className="ml-4 space-y-1">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">
            {stats.protected} protegidos · {stats.atRisk} em risco
          </p>
        </div>
      </div>
    </div>
  );
} 