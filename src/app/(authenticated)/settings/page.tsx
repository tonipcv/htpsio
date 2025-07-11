'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  KeyIcon,
  UserIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Estados para as configurações
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    security: true,
    updates: false
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    biometric: false,
    passwordChange: false
  });

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    toast({
      title: "Configuração atualizada",
      description: "Suas preferências de notificação foram atualizadas."
    });
  };

  const handleSecurityChange = async (key: keyof typeof security) => {
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    toast({
      title: "Configuração atualizada",
      description: "Suas configurações de segurança foram atualizadas."
    });
  };

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-4">
      <div className="container mx-auto max-w-6xl lg:ml-52">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Configurações</h1>
            <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Gerencie suas preferências e configurações de segurança</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5 mr-1.5" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="bg-zinc-900/50 border-zinc-800 rounded-2xl">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-zinc-800 rounded-xl">
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-zinc-800 rounded-xl">
              Segurança
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-zinc-800 rounded-xl">
              Conta
            </TabsTrigger>
          </TabsList>

          {/* Aba de Notificações */}
          <TabsContent value="notifications">
            <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 rounded-2xl">
              <CardHeader className="px-4 py-3 sm:p-3">
                <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
                  Preferências de Notificação
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                  Escolha como deseja receber nossas notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-3 sm:p-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Notificações por Email</Label>
                    <p className="text-xs text-zinc-500">Receba atualizações importantes por email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={() => handleNotificationChange('email')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Notificações Push</Label>
                    <p className="text-xs text-zinc-500">Receba alertas em tempo real</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={() => handleNotificationChange('push')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Alertas de Segurança</Label>
                    <p className="text-xs text-zinc-500">Seja notificado sobre eventos de segurança</p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={() => handleNotificationChange('security')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Atualizações do Sistema</Label>
                    <p className="text-xs text-zinc-500">Receba informações sobre novas funcionalidades</p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={() => handleNotificationChange('updates')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Segurança */}
          <TabsContent value="security">
            <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 rounded-2xl">
              <CardHeader className="px-4 py-3 sm:p-3">
                <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
                  Configurações de Segurança
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                  Gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-3 sm:p-3 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Autenticação de Dois Fatores</Label>
                    <p className="text-xs text-zinc-500">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={() => handleSecurityChange('twoFactor')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Login Biométrico</Label>
                    <p className="text-xs text-zinc-500">Use biometria para acessar sua conta</p>
                  </div>
                  <Switch
                    checked={security.biometric}
                    onCheckedChange={() => handleSecurityChange('biometric')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm text-zinc-300">Alteração de Senha</Label>
                    <p className="text-xs text-zinc-500">Solicitar senha atual para alterações</p>
                  </div>
                  <Switch
                    checked={security.passwordChange}
                    onCheckedChange={() => handleSecurityChange('passwordChange')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Conta */}
          <TabsContent value="account">
            <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 rounded-2xl">
              <CardHeader className="px-4 py-3 sm:p-3">
                <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
                  Informações da Conta
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 py-3 sm:p-3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-300 rounded-xl h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-zinc-300">Nome</Label>
                  <Input
                    id="name"
                    value={session?.user?.name || ''}
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-300 rounded-xl h-8 text-xs"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
                    onClick={() => router.push('/profile')}
                  >
                    <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 