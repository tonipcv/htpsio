'use client';

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { CSVImportModal } from "@/components/clients/csv-import-modal";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface Client {
  id: string;
  name: string;
  email: string;
  slug: string;
  createdAt: string;
  _count: {
    documentAccess: number;
  };
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '' });

  const columns = [
    {
      accessorKey: "name",
      header: "Client",
      cell: ({ row }: { row: any }) => {
        const client = row.original;
        return (
          <div className="flex items-center gap-2 py-1.5">
            <div className="flex flex-col">
              <span className="text-sm text-[#f5f5f7]">{client.name}</span>
              <span className="text-xs text-[#f5f5f7]/50">{client.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "_count.documentAccess",
      header: "Docs",
      cell: ({ row }: { row: any }) => {
        const count = row.original._count.documentAccess;
        return (
          <div className="py-1.5">
            <span className="text-xs font-mono text-[#f5f5f7]/70">
              {count}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="py-1.5">
            <span className="text-xs text-[#f5f5f7]/50">
              {new Date(row.original.createdAt).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="py-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <EllipsisHorizontalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem 
                  onClick={() => window.location.href = `/documents?client=${row.original.id}`}
                  className="text-xs"
                >
                  View Documents
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = `/clients/${row.original.id}`}
                  className="text-xs"
                >
                  Edit Client
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(row.original.id)}
                  className="text-xs text-red-600 focus:text-red-600 focus:bg-red-100/50 dark:focus:bg-red-900/50"
                >
                  Delete Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchClients();
        toast({
          title: "Success",
          description: "Client deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Client created successfully",
        });
        setIsOpen(false);
        setNewClient({ name: '', email: '' });
        fetchClients();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create client');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create client",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 space-y-3 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#f5f5f7]">Clients</h2>
          <p className="text-xs text-[#f5f5f7]/50">
            {clients.length} total
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsImportOpen(true)}
            className="h-8 bg-[#f5f5f7]/10 hover:bg-[#f5f5f7]/20 text-[#f5f5f7] text-xs"
          >
            <ArrowUpTrayIcon className="h-3 w-3 mr-1" />
            Import CSV
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 bg-[#f5f5f7]/10 hover:bg-[#f5f5f7]/20 text-[#f5f5f7] text-xs">
                <PlusIcon className="h-3 w-3 mr-1" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1c1d20] border-[#f5f5f7]/10">
              <DialogHeader>
                <DialogTitle className="text-[#f5f5f7] text-sm">New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-3 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#f5f5f7] text-xs">Name</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Enter client name"
                    className="h-8 text-xs bg-[#f5f5f7]/5 border-[#f5f5f7]/10 text-[#f5f5f7]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#f5f5f7] text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="Enter client email"
                    className="h-8 text-xs bg-[#f5f5f7]/5 border-[#f5f5f7]/10 text-[#f5f5f7]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-8 bg-[#f5f5f7]/10 hover:bg-[#f5f5f7]/20 text-[#f5f5f7] text-xs">
                  Create Client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-lg bg-[#1c1d20]/50 overflow-hidden">
        {loading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border border-[#f5f5f7] border-t-transparent"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f7]/[0.02] to-transparent pointer-events-none h-12" />
            <DataTable
              columns={columns}
              data={clients}
            />
          </div>
        )}
      </div>
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchClients}
      />
    </div>
  );
} 