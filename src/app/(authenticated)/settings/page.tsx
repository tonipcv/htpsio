'use client';

import { useState, useEffect } from "react";
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
  ArrowLeftIcon,
  CreditCardIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { SubscriptionManager } from "@/components/SubscriptionManager";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    clientCount: 0,
    currentPlan: null,
    subscriptionStatus: null,
    currentPeriodEnd: null
  });

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
  
  // Buscar dados do usuário e assinatura
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setUserData({
              clientCount: data.clients?.length || 0,
              currentPlan: data.subscription?.plan || null,
              subscriptionStatus: data.subscription?.status || null,
              currentPeriodEnd: data.subscription?.currentPeriodEnd || null
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };
    
    fetchUserData();
  }, [session]);

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
    <div className="min-h-[100dvh] bg-[#1c1d20] pt-20 pb-24 md:pt-12 md:pb-16 px-4">
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

        <Tabs defaultValue="plan" className="space-y-4">
          <TabsList className="bg-zinc-900/50 border-zinc-800 rounded-2xl">
            <TabsTrigger value="plan" className="data-[state=active]:bg-zinc-800 rounded-xl">
              Plano
            </TabsTrigger>
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

          {/* Aba de Plano */}
          <TabsContent value="plan">
            <div className="space-y-4">
              {/* Card de Informações do Cliente */}
              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 rounded-2xl">
                <CardHeader className="px-4 py-3 sm:p-3">
                  <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Informações do Cliente
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Resumo dos seus clientes e uso da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3 sm:p-3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-300">Total de Clientes</p>
                      <p className="text-sm text-zinc-100">{userData.clientCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-300">Limite do Plano</p>
                      <p className="text-sm text-zinc-100">
                        {userData.currentPlan === 'basic' ? '100' : 
                         userData.currentPlan === 'pro' ? '1000' : 
                         userData.currentPlan === 'enterprise' ? '10000' : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
                      onClick={() => router.push('/dashboard/clients')}
                    >
                      <UserGroupIcon className="h-3.5 w-3.5 mr-1.5" />
                      Gerenciar Clientes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Detalhes do Plano */}
              <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 rounded-2xl">
                <CardHeader className="px-4 py-3 sm:p-3">
                  <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter flex items-center">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Detalhes do Plano
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
                    Informações sobre sua assinatura atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-3 sm:p-3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-zinc-300">Plano Atual</p>
                      <p className="text-sm text-zinc-100 capitalize">
                        {userData.currentPlan || 'free'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-300">Status</p>
                      <p className="text-sm text-zinc-100 capitalize">
                        {userData.subscriptionStatus || 'ativo'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-300">Período Atual Termina</p>
                      <p className="text-sm text-zinc-100">
                        {userData.currentPeriodEnd ? 
                          new Date(userData.currentPeriodEnd).toLocaleDateString('pt-BR') : 'ilimitado'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
                      onClick={() => router.push('/dashboard/subscription')}
                    >
                      <CreditCardIcon className="h-3.5 w-3.5 mr-1.5" />
                      Gerenciar Assinatura
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Opções de Plano */}
              <div className="pt-2">
                <SubscriptionManager
                  currentPlan={userData.currentPlan}
                  subscriptionStatus={userData.subscriptionStatus}
                  currentPeriodEnd={userData.currentPeriodEnd ? new Date(userData.currentPeriodEnd) : null}
                  clientCount={userData.clientCount}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 