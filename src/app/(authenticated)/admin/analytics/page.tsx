'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowDownTrayIcon, EllipsisHorizontalIcon, DocumentTextIcon, UserIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentAccessLog {
  id: string;
  documentId: string;
  userId: string | null;
  visitorToken: string | null;
  accessStartTime: string;
  accessEndTime: string | null;
  duration: number | null;
  userAgent: string;
  ipAddress: string;
  city: string | null;
  country: string | null;
  document: {
    name: string;
    mimeType: string;
    size: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface Stats {
  totalViews: number;
  uniqueDocuments: number;
  uniqueUsers: number;
  uniqueVisitors: number;
  avgDurationSeconds: number;
  maxDurationSeconds: number;
}

interface TopDocument {
  documentId: string;
  name: string;
  views: number;
}

// Funções de formatação
const formatDuration = (seconds: number | null) => {
  if (!seconds) return 'N/A';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

// Definição das colunas para o DataTable
const columns = [
  {
    accessorKey: "document.name",
    header: "Documento",
    cell: ({ row }) => <div className="font-medium">{row.original.document.name}</div>,
  },
  {
    accessorKey: "user",
    header: "Usuário",
    cell: ({ row }) => <div>{row.original.user ? row.original.user.name : 'Anônimo'}</div>,
  },
  {
    accessorKey: "accessStartTime",
    header: "Horário de Acesso",
    cell: ({ row }) => <div>{formatDate(row.original.accessStartTime)}</div>,
  },
  {
    accessorKey: "duration",
    header: "Duração",
    cell: ({ row }) => <div>{formatDuration(row.original.duration)}</div>,
  },
  {
    accessorKey: "location",
    header: "Localização",
    cell: ({ row }) => {
      const location = row.original.city && row.original.country 
        ? `${row.original.city}, ${row.original.country}` 
        : row.original.city || row.original.country || 'Desconhecida';
      return <div>{location}</div>;
    },
  },
];

export default function DocumentAnalyticsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<DocumentAccessLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [topDocuments, setTopDocuments] = useState<TopDocument[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  
  // Filter states
  const [documentId, setDocumentId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Check if user is admin or superadmin
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';
  
  // Fetch document access logs
  const fetchLogs = async () => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (documentId) params.append('documentId', documentId);
      if (userId) params.append('userId', userId);
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      
      const response = await fetch(`/api/analytics/document-access/list?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
      setStats(data.stats);
      setTopDocuments(data.topDocuments);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funções de formatação movidas para fora do componente
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  // Handle filter change
  const handleFilterChange = () => {
    setPagination({ ...pagination, page: 1 }); // Reset to first page when filtering
    fetchLogs();
  };
  
  // Export data as CSV
  const exportCSV = () => {
    if (!logs.length) return;
    
    const headers = [
      'Document Name',
      'User',
      'Visitor Token',
      'Access Start',
      'Access End',
      'Duration (s)',
      'IP Address',
      'Location',
      'User Agent'
    ];
    
    const rows = logs.map(log => [
      log.document.name,
      log.user ? log.user.name : 'Anonymous',
      log.visitorToken || 'N/A',
      formatDate(log.accessStartTime),
      log.accessEndTime ? formatDate(log.accessEndTime) : 'N/A',
      log.duration || 'N/A',
      log.ipAddress,
      `${log.city || ''} ${log.country || ''}`.trim() || 'Unknown',
      log.userAgent
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `document-access-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Fetch logs on component mount and when filters change
  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin, pagination.page, pagination.limit]);
  
  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-medium">Document Access Analytics</h1>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-8">ƒ
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <EyeIcon className="h-5 w-5 text-neutral-500" />
              <span className="text-sm text-neutral-500">Total Views</span>
            </div>
            <p className="text-3xl font-light">{stats.totalViews}</p>
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <DocumentTextIcon className="h-5 w-5 text-neutral-500" />
              <span className="text-sm text-neutral-500">Unique Documents</span>
            </div>
            <p className="text-3xl font-light">{stats.uniqueDocuments}</p>
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <UserIcon className="h-5 w-5 text-neutral-500" />
              <span className="text-sm text-neutral-500">Unique Users/Visitors</span>
            </div>
            <p className="text-3xl font-light">{stats.uniqueUsers + stats.uniqueVisitors}</p>
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="h-5 w-5 text-neutral-500" />
              <span className="text-sm text-neutral-500">Avg. View Duration</span>
            </div>
            <p className="text-3xl font-light">{formatDuration(Math.round(stats.avgDurationSeconds || 0))}</p>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="logs" className="mt-8">
        <TabsList className="border-0 bg-transparent mb-6">
          <TabsTrigger value="logs" className="data-[state=active]:text-neutral-200 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-200 data-[state=active]:shadow-none rounded-none">Access Logs</TabsTrigger>
          <TabsTrigger value="charts" className="data-[state=active]:text-neutral-200 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-gray-200 data-[state=active]:shadow-none rounded-none">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs" className="space-y-8">
          {/* Filters */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <span className="text-sm text-neutral-500">Document ID</span>
                <Input 
                  id="documentId" 
                  value={documentId} 
                  onChange={(e) => setDocumentId(e.target.value)} 
                  placeholder="Filter by document ID"
                  className="border-0 border-b border-neutral-200 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-neutral-500">User ID</span>
                <Input 
                  id="userId" 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)} 
                  placeholder="Filter by user ID"
                  className="border-0 border-b border-neutral-200 rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-neutral-500">Start Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"ghost"}
                      className={cn(
                        "w-full justify-start text-left font-normal p-0",
                        !startDate && "text-neutral-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Select start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0 shadow-sm">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-neutral-500">End Date</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"ghost"}
                      className={cn(
                        "w-full justify-start text-left font-normal p-0",
                        !endDate && "text-neutral-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Select end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-0 shadow-sm">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleFilterChange} variant="ghost" className="hover:bg-neutral-100">Apply Filters</Button>
              <Button variant="ghost" onClick={() => {
                setDocumentId('');
                setUserId('');
                setStartDate(undefined);
                setEndDate(undefined);
                setPagination({ ...pagination, page: 1 });
                fetchLogs();
              }} className="text-neutral-500 hover:bg-neutral-100">Reset</Button>
            </div>
          </div>
          
          {/* Data Table */}
          <div>
            <div className="text-sm text-neutral-500 mb-4">
              Showing {logs.length} of {pagination.totalCount} entries
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
              </div>
            ) : (
              <>
                <div>
                  <DataTable columns={columns} data={logs} />
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="hover:bg-neutral-100"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-2 text-neutral-600">
                      {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="hover:bg-neutral-100"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-8">
          {/* Top Documents Chart */}
          <div>
            <div className="text-sm text-neutral-500 mb-6">Top Documents by Views</div>
            
            {topDocuments.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topDocuments}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '4px', 
                        border: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        padding: '8px 12px',
                      }} 
                    />
                    <Bar 
                      dataKey="views" 
                      fill="#f0f0f0" 
                      name="Views" 
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40">
                <p className="text-neutral-400">No data available</p>
              </div>
            )}
          </div>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
