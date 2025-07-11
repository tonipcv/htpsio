'use client';

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { CameraIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Estados para os dados do perfil
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [role, setRole] = useState('');
  
  // Estados de UI
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetched, setProfileFetched] = useState(false);
  
  // Estado para garantir renderização no cliente
  const [isClient, setIsClient] = useState(false);

  // Efeito para marcar que estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Efeito para carregar os dados do perfil quando a sessão estiver pronta
  useEffect(() => {
    if (status === 'loading' || !isClient) return;
    
    if (status === 'authenticated' && session?.user?.id && !profileFetched) {
      fetchUserProfile();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, session, isClient, profileFetched]);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/profile?userId=${session.user.id}`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setImage(data.image || '');
        setRole(data.role || '');
        setProfileFetched(true);
      } else {
        console.error('Erro ao buscar perfil:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Falha ao fazer upload da imagem');

      const data = await response.json();
      setImage(data.url);
      
      await handleSave(data.url);
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (newImage?: string) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          image: newImage || image,
          role
        }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar perfil');

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive"
      });
    }
  };

  // Mostrar um spinner enquanto carrega
  if (!isClient || status === 'loading' || (isLoading && !profileFetched)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-4">
      <div className="container mx-auto max-w-6xl lg:ml-52">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-[-0.03em] font-inter">Seu Perfil</h1>
            <p className="text-xs md:text-sm text-zinc-400 tracking-[-0.03em] font-inter">Gerencie seus dados e configurações</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </Button>
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
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 transition-all duration-300 rounded-2xl h-8 text-xs"
                  onClick={() => handleSave()}
                >
                  Salvar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Informações do Perfil */}
        <Card className="bg-zinc-900/50 border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 rounded-2xl">
          <CardHeader className="px-4 py-3 sm:p-3">
            <CardTitle className="text-sm md:text-base font-bold text-white tracking-[-0.03em] font-inter">
              Informações Pessoais
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 tracking-[-0.03em] font-inter">
              Dados da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-3 sm:p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative group">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                    {image ? (
                      <Image
                        src={image}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <CameraIcon className="h-10 w-10 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label
                      htmlFor="photo"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
                    >
                      <CameraIcon className="h-8 w-8 text-white" />
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
                {isUploading && (
                  <div className="text-xs text-zinc-400">Enviando...</div>
                )}
              </div>

              {/* Dados do usuário */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-zinc-300">Nome</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-300 rounded-xl h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-300 rounded-xl h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm text-zinc-300">Função</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!isEditing}
                    className="bg-zinc-800/50 border-zinc-700 text-zinc-300 rounded-xl h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 