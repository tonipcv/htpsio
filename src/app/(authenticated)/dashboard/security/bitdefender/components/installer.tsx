'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function Installer() {
  const [loading, setLoading] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [os, setOs] = useState("windows");

  async function handleInstall(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceName) return;

    setLoading(true);

    try {
      const response = await fetch("/api/security/bitdefender/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deviceName,
          os: os,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Abrir link de download em nova aba
      if (data.endpoint?.installUrl) {
        window.open(data.endpoint.installUrl, "_blank");
      }

      toast({
        title: "Sucesso",
        description: "Instalador gerado com sucesso",
      });

      setDeviceName("");
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao gerar instalador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleInstall} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Dispositivo</Label>
        <Input
          id="name"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          placeholder="Ex: Laptop do João"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="os">Sistema Operacional</Label>
        <Select value={os} onValueChange={setOs}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o SO" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="windows">Windows</SelectItem>
            <SelectItem value="mac">macOS</SelectItem>
            <SelectItem value="linux">Linux</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !deviceName}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Gerar Instalador
      </Button>
    </form>
  );
} 