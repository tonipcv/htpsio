'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from '@/components/ui/use-toast';
import { 
  UserIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  PencilIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  isPremium: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  subscription?: {
    id: string;
    plan: string;
    status: string;
    expiresAt: Date | null;
  };
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  // Verificar se o usuário é superadmin
  useEffect(() => {
    if (session?.user?.role !== 'superadmin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      router.push('/documents');
    }
  }, [session, router]);

  // Carregar lista de usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'superadmin') {
      fetchUsers();
    }
  }, [session]);

  // Filtrar usuários com base no termo de pesquisa
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir diálogo para editar plano do usuário
  const handleEditPlan = (user: User) => {
    setEditingUser(user);
    setSelectedPlan(user.subscription?.plan || user.plan || 'free');
    setIsDialogOpen(true);
  };

  // Atualizar plano do usuário
  const handleUpdatePlan = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}/update-plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          isPremium: selectedPlan !== 'free'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user plan');
      }

      const data = await response.json();

      // Atualizar a lista de usuários com os dados atualizados
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { 
              ...user, 
              plan: selectedPlan, 
              isPremium: selectedPlan !== 'free',
              subscription: data.user.subscription
            } 
          : user
      ));

      toast({
        title: "Success",
        description: `Plan updated for ${editingUser.name} to ${selectedPlan.toUpperCase()}`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Formatar data
  const formatDate = (date: Date | null) => {
    if (!date) return 'Not verified';
    return new Date(date).toLocaleDateString();
  };

  if (session?.user?.role !== 'superadmin') {
    return null; // Não renderizar nada se não for superadmin
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users and their subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Email Verified</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-[#f5f5f7]/70">
                          {user.subscription?.plan === 'free' || user.plan === 'free' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-[#f5f5f7]/70">
                              Free
                            </span>
                          ) : user.subscription?.plan === 'basic' || user.plan === 'basic' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                              Basic
                            </span>
                          ) : user.subscription?.plan === 'pro' || user.plan === 'pro' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-300">
                              Pro
                            </span>
                          ) : user.subscription?.plan === 'enterprise' || user.plan === 'enterprise' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                              Enterprise
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                              {user.subscription?.plan || user.plan || 'Unknown'}
                            </span>
                          )}
                          {user.subscription?.status && user.subscription.status !== 'active' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-300">
                              {user.subscription.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPlan(user)}
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit Plan
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar plano */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Plan</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="font-medium">{editingUser.name}</div>
                <div className="text-sm text-gray-500">{editingUser.email}</div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="plan">Subscription Plan</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan}>
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
