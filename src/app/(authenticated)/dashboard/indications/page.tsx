'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  PlusIcon, 
  ClipboardIcon, 
  QrCodeIcon,
  ShareIcon,
  LinkIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
  GiftIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";
import { toast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Edit, Share2, Copy, Trash, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PatientReferral {
  id: string;
  slug: string;
  patient: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  page: {
    id: string;
    title: string;
    slug: string;
  };
  stats: {
    visits: number;
    leads: number;
    sales: number;
  };
  rewards?: Array<{
    id: string;
    title: string;
    type: string;
    unlockValue: number;
    unlockType: string;
    unlockedAt: Date | null;
    progress: number;
  }>;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
}

interface ReferralsByPatient {
  [key: string]: {
    patient: Patient;
    referrals: PatientReferral[];
  }
}

interface DashboardData {
  totalLeads: number;
  totalIndications: number;
  totalClicks: number;
  totalRewards?: number;
}

export default function ReferralsPage() {
  const { data: session } = useSession();
  const [referrals, setReferrals] = useState<PatientReferral[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined);
  const [selectedPage, setSelectedPage] = useState<Page | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [userSlug, setUserSlug] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<PatientReferral | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [referralToDelete, setReferralToDelete] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedQRUrl, setSelectedQRUrl] = useState('');
  const [selectedQRTitle, setSelectedQRTitle] = useState('');

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      console.log('[useEffect] Session available, fetching data...');
      fetchPatients();
      fetchPages();
      fetchReferrals();
      fetchUserProfile();
      
      // Use environment variable for base URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med1.app';
      setBaseUrl(appUrl);
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  useEffect(() => {
    if (pageSearchQuery) {
      const filtered = pages.filter(page =>
        page.title.toLowerCase().includes(pageSearchQuery.toLowerCase())
      );
      setFilteredPages(filtered);
    } else {
      setFilteredPages(pages);
    }
  }, [pageSearchQuery, pages]);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/profile?userId=${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.slug) {
          setUserSlug(data.slug);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    }
  };

  const fetchReferrals = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/doctor/referrals');
      if (response.ok) {
        const { referrals } = await response.json();
        setReferrals(referrals);
      }
    } catch (error) {
      console.error('Erro ao buscar referências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as referências",
        variant: "destructive"
      });
    }
  };

  const fetchPages = async () => {
    if (!session?.user?.id) {
      console.log('No user session, skipping fetch');
      return;
    }
    
    try {
      console.log('Fetching pages...');
      const response = await fetch('/api/pages');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received pages data:', data);
        if (Array.isArray(data)) {
          setPages(data);
          setFilteredPages(data);
        } else {
          console.log('No pages data received or empty array');
        }
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast({
          title: "Erro",
          description: "Erro ao carregar páginas: " + errorText,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar páginas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de páginas",
        variant: "destructive"
      });
    }
  };

  const fetchPatients = async () => {
    if (!session?.user?.id) {
      console.log('[fetchPatients] No user session, skipping fetch');
      return;
    }
    
    try {
      console.log('[fetchPatients] Starting fetch...');
      const response = await fetch('/api/patients');
      console.log('[fetchPatients] Response status:', response.status);
      
      if (response.ok) {
        const patients = await response.json();
        console.log('[fetchPatients] Received data:', patients);
        
        if (Array.isArray(patients)) {
          console.log('[fetchPatients] Setting patients array:', patients.length, 'items');
          setPatients(patients);
          setFilteredPatients(patients);
        } else {
          console.log('[fetchPatients] Received non-array data:', patients);
          setPatients([]);
          setFilteredPatients([]);
        }
      } else {
        const errorText = await response.text();
        console.error('[fetchPatients] Error response:', errorText);
        toast({
          title: "Erro",
          description: "Erro ao carregar pacientes: " + errorText,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[fetchPatients] Error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de pacientes",
        variant: "destructive"
      });
    }
  };

  const patientHasPageAccess = (patientId: string, pageId: string) => {
    return referrals.some(
      referral => referral.patient.id === patientId && referral.page.id === pageId
    );
  };

  const handleEdit = (referral: PatientReferral) => {
    setSelectedReferral(referral);
    setSelectedPatient(referral.patient);
    setSelectedPage(referral.page);
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleDelete = async (referralId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctor/referrals/${referralId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível excluir a referência");
      }

      // Atualizar o estado local removendo a referência excluída
      setReferrals(prevReferrals => 
        prevReferrals.filter(ref => ref.id !== referralId)
      );
      
      toast({
        title: "Sucesso",
        description: "Link de referência excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir referência:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a referência",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedPatient || !selectedPage) {
        throw new Error("Selecione um paciente e uma página");
      }

      const endpoint = isEditMode && selectedReferral
        ? `/api/doctor/referrals/${selectedReferral.id}`
        : '/api/doctor/referrals';

      const method = isEditMode ? 'PUT' : 'POST';

      const referralResponse = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          pageId: selectedPage.id,
        }),
      });
      
      if (referralResponse.ok) {
        toast({
          title: "Sucesso",
          description: isEditMode 
            ? "Link de referência atualizado com sucesso"
            : "Link de referência criado com sucesso",
        });
        setSelectedPatient(undefined);
        setSelectedPage(undefined);
        setSelectedReferral(undefined);
        setIsEditMode(false);
        setShowCreateModal(false);
        fetchReferrals();
      } else {
        const errorData = await referralResponse.json();
        throw new Error(errorData.error || "Não foi possível processar a operação");
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar a operação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (isClient && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Link copiado",
        description: "Link copiado para a área de transferência",
      });
    }
  };

  // Agrupar referrals por paciente
  const referralsByPatient: ReferralsByPatient = referrals.reduce((acc, referral) => {
    const patientId = referral.patient.id;
    if (!acc[patientId]) {
      acc[patientId] = {
        patient: referral.patient,
        referrals: []
      };
    }
    acc[patientId].referrals.push(referral);
    return acc;
  }, {} as ReferralsByPatient);

  const handleCreateModalChange = (open: boolean) => {
    setShowCreateModal(open);
    if (!open) {
      setSelectedPatient(undefined);
      setSelectedPage(undefined);
      setSelectedReferral(undefined);
      setIsEditMode(false);
    }
  };

  const handleShowQRCode = (url: string, title: string) => {
    setSelectedQRUrl(url);
    setSelectedQRTitle(title);
    setShowQRCode(true);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-${selectedQRTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  console.log('[ReferralsPage] Rendering...');
  console.log('[ReferralsPage] Patients Data:', patients);
  console.log('[ReferralsPage] Pages Data:', pages);
  console.log('[ReferralsPage] Selected Patient:', selectedPatient);
  console.log('[ReferralsPage] Selected Page:', selectedPage);

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
      <div className="container mx-auto px-0 sm:pl-4 md:pl-8 lg:pl-16 max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Links de Referência</h2>
              <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Gerencie os links de referência dos seus pacientes</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="w-full md:w-auto mt-2 md:mt-0 bg-zinc-900/50 border border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800 text-xs"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Link
            </Button>
          </div>

          <div className="space-y-4">
            {Object.values(referralsByPatient).map(({ patient, referrals }) => (
              <div key={patient.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white">{patient.name}</h3>
                      <p className="text-xs text-zinc-400">{patient.email}</p>
                    </div>
                  </div>
                </div>

                <Card className="bg-zinc-900/50 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableHead className="w-[300px] text-zinc-400">Nome do Link</TableHead>
                          <TableHead className="text-zinc-400">URL</TableHead>
                          <TableHead className="text-center text-zinc-400">Visitas</TableHead>
                          <TableHead className="text-center text-zinc-400">Leads</TableHead>
                          <TableHead className="text-center text-zinc-400">Vendas</TableHead>
                          <TableHead className="text-right text-zinc-400">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referrals.map((referral) => (
                          <TableRow key={referral.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-medium text-white">{referral.page.title}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400 truncate max-w-[200px]">
                                  {`${baseUrl}/${userSlug}/${referral.slug}`}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                                  onClick={() => copyToClipboard(`${baseUrl}/${userSlug}/${referral.slug}`)}
                                >
                                  <ClipboardIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-zinc-900/50 text-zinc-300 border-zinc-700">
                                {referral.stats.visits}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-blue-950/50 text-blue-400 border-blue-800">
                                {referral.stats.leads}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-emerald-950/50 text-emerald-400 border-emerald-800">
                                {referral.stats.sales}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                                  onClick={() => handleEdit(referral)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-red-400"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-zinc-900 border border-zinc-800">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                                      <AlertDialogDescription className="text-zinc-400">
                                        Tem certeza que deseja excluir este link de referência? Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700">Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(referral.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isLoading}
                                      >
                                        {isLoading ? (
                                          <>
                                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                                            Excluindo...
                                          </>
                                        ) : (
                                          'Excluir'
                                        )}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                                  onClick={() => handleShowQRCode(`${baseUrl}/${userSlug}/${referral.slug}`, referral.page.title)}
                                >
                                  <QrCodeIcon className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                                >
                                  <ShareIcon className="h-4 w-4" />
                                </Button>
                                {referral.rewards && referral.rewards.length > 0 && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300"
                                  >
                                    <GiftIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={showCreateModal} onOpenChange={handleCreateModalChange}>
        <SheetContent className="w-full sm:max-w-xl bg-zinc-900 border-l border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-white">
              {isEditMode ? 'Editar Link de Referência' : 'Novo Link de Referência'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Informações Básicas</h3>
                <div className="grid gap-4 bg-zinc-800/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="patient" className="text-sm text-zinc-300">Paciente</Label>
                    <div className="relative">
                      <select 
                        className="w-full rounded-md bg-zinc-900 border-zinc-700 text-zinc-300 py-2 pl-3 pr-10 text-sm"
                        value={selectedPatient?.id || ''}
                        onChange={(e) => {
                          console.log('Native select change:', e.target.value);
                          const patient = patients.find(p => p.id === e.target.value);
                          if (patient) {
                            console.log('Setting patient:', patient);
                            setSelectedPatient(patient);
                          }
                        }}
                      >
                        <option value="">Selecione um paciente</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} ({patient.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="page" className="text-sm text-zinc-300">Página</Label>
                    <div className="relative">
                      <select 
                        className="w-full rounded-md bg-zinc-900 border-zinc-700 text-zinc-300 py-2 pl-3 pr-10 text-sm"
                        value={selectedPage?.id || ''}
                        onChange={(e) => {
                          console.log('Native select change:', e.target.value);
                          const page = pages.find(p => p.id === e.target.value);
                          if (page) {
                            const isDisabled = selectedPatient && patientHasPageAccess(selectedPatient.id, page.id);
                            if (!isDisabled) {
                              console.log('Setting page:', page);
                              setSelectedPage(page);
                            }
                          }
                        }}
                      >
                        <option value="">Selecione uma página</option>
                        {pages.map((page) => {
                          const isDisabled = selectedPatient && patientHasPageAccess(selectedPatient.id, page.id);
                          return (
                            <option 
                              key={page.id} 
                              value={page.id}
                              disabled={isDisabled}
                            >
                              {page.title} {isDisabled ? "(Já tem acesso)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedPatient(undefined);
                    setSelectedPage(undefined);
                  }}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedPatient || !selectedPage || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="bg-zinc-900 border border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">QR Code - {selectedQRTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
            <QRCodeCanvas
              value={selectedQRUrl}
              size={200}
              level="H"
              includeMargin={true}
              id="qr-code"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => setShowQRCode(false)}
              variant="outline"
              className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
            >
              Fechar
            </Button>
            <Button
              onClick={downloadQRCode}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 