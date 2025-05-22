'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  PlusIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ServiceForm from '@/components/services/ServiceForm';
import { Service } from '@/types/service';
import { cn } from "@/lib/utils";

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    if (status !== 'loading') {
      fetchServices();
    }
  }, [status]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.map((service: any) => ({
          ...service,
          description: service.description || undefined,
          category: service.category || undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(
        selectedService 
          ? `/api/services/${selectedService.id}`
          : '/api/services',
        {
          method: selectedService ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        await fetchServices();
        setIsModalOpen(false);
        setSelectedService(undefined);
      }
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
      <div className="container mx-auto px-0 sm:pl-4 md:pl-8 lg:pl-16 max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Serviços</h2>
              <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">
                Gerencie os serviços oferecidos em sua clínica
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedService(undefined);
                setIsModalOpen(true);
              }}
              className="w-full md:w-auto mt-2 md:mt-0 bg-zinc-900/50 border border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>

          <Card className="bg-zinc-900/50 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center text-zinc-400">Carregando serviços...</div>
            ) : services.length === 0 ? (
              <div className="text-center">
                <p className="mt-1 text-sm text-zinc-400">
                  Nenhum serviço cadastrado ainda. Comece adicionando seu primeiro serviço.
                </p>
              </div>
            ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableHead className="text-zinc-400">Nome</TableHead>
                      <TableHead className="text-zinc-400">Categoria</TableHead>
                      <TableHead className="text-zinc-400">Preço</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-right text-zinc-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell>
                          <div className="font-medium text-white">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-zinc-400">{service.description}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {service.category || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-950/50 text-blue-400 border-blue-800">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(service.price)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              service.is_active
                                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                                : "bg-red-950/50 text-red-400 border-red-800"
                            )}
                          >
                            {service.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                              onClick={() => handleToggleActive(service.id, service.is_active)}
                            >
                              {service.is_active ? (
                                <XCircleIcon className="h-4 w-4" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                              onClick={() => handleEdit(service)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-zinc-900 border-l border-zinc-800">
          <div className="space-y-4">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold text-white">
                {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-2">
              <ServiceForm
                service={selectedService}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setSelectedService(undefined);
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 