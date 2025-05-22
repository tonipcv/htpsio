'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PlusCircle, FormInput, ExternalLink, Loader2, Settings } from 'lucide-react';
import { Form } from '@/types/forms';
import { FormBlock } from '@/components/blocks/FormBlock';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FormsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    description: '',
    isPublic: true,
    fields: [],
    settings: {
      identificationRequired: 'whatsapp',
      submitButtonText: 'Enviar',
      successMessage: 'Formulário enviado com sucesso!'
    },
    style: {
      layout: 'stack',
      theme: 'light'
    }
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/forms');
      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }
      const data = await response.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Erro ao carregar os formulários');
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!newForm.name.trim()) {
      toast.error('Por favor, insira um nome para o formulário');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create form');
      }

      const createdForm = await response.json();
      setForms([createdForm, ...forms]);
      setIsCreateModalOpen(false);
      setNewForm({
        name: '',
        description: '',
        isPublic: true,
        fields: [],
        settings: {
          identificationRequired: 'whatsapp',
          submitButtonText: 'Enviar',
          successMessage: 'Formulário enviado com sucesso!'
        },
        style: {
          layout: 'stack',
          theme: 'light'
        }
      });
      toast.success('Formulário criado com sucesso!');
      router.push(`/forms/${createdForm.id}`);
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Erro ao criar formulário');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-4">
        <div className="container mx-auto pl-1 sm:pl-4 md:pl-8 lg:pl-16 max-w-[98%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse mt-4 md:mt-0" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-zinc-900/50 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader>
                  <div className="h-6 w-3/4 bg-zinc-800 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-zinc-800 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-1/4 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="h-9 w-20 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-9 w-20 bg-zinc-800 rounded animate-pulse" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] bg-black pt-20 pb-24 md:pt-12 md:pb-16 px-2 sm:px-4">
        <div className="container mx-auto pl-1 sm:pl-4 md:pl-8 lg:pl-16 max-w-[98%] sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Formulários</h1>
              <p className="text-zinc-400 mt-1">
                Gerencie seus formulários
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 md:mt-0 bg-zinc-900/50 border border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Formulário
            </Button>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12">
              <FormInput className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Nenhum formulário encontrado
              </h2>
              <p className="text-zinc-400 mb-4">
                Comece criando seu primeiro formulário
              </p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-zinc-900/50 border border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-2xl text-zinc-300 hover:bg-zinc-800"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Formulário
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forms.map((form) => (
                <Card key={form.id} className="bg-zinc-900/50 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white">{form.name}</CardTitle>
                    {form.description && (
                      <CardDescription className="text-zinc-400">{form.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-zinc-400">
                      {form.fields.length} campos
                      <br />
                      {form.stats?.submissions || 0} submissões
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      asChild
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
                    >
                      <Link href={`/forms/${form.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      asChild
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600"
                    >
                      <Link href={`/forms/${form.id}/submissions`}>
                        <FormInput className="h-4 w-4 mr-2" />
                        Submissões
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Sheet open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <SheetContent className="sm:max-w-[540px] bg-zinc-900 border-l border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-white">Novo Formulário</SheetTitle>
            <SheetDescription className="text-zinc-400">
              Crie um novo formulário para seus pacientes
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Nome do Formulário</Label>
              <Input
                id="name"
                value={newForm.name}
                onChange={(e) => setNewForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Anamnese Inicial"
                className="bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300">Descrição</Label>
              <Textarea
                id="description"
                value={newForm.description}
                onChange={(e) => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Formulário para primeira consulta"
                className="bg-zinc-800/50 border-zinc-700 text-zinc-300 placeholder:text-zinc-500"
              />
            </div>
            <Button 
              onClick={handleCreateForm} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Formulário
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 