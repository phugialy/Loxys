'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Archive, ArchiveRestore, Trash2, Users, Edit, Calendar } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface Customer {
  id: string;
  name: string;
  phone_e164: string | null;
  email: string | null;
  date_of_birth: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [birthMonthFilter, setBirthMonthFilter] = useState<string>('all');
  const [loyaltyFilter, setLoyaltyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [archivingIds, setArchivingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, birthMonthFilter, loyaltyFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (search) {
        params.append('search', search);
      }
      if (birthMonthFilter !== 'all') {
        params.append('birthMonth', birthMonthFilter);
      }
      if (loyaltyFilter !== 'all') {
        params.append('loyalty', loyaltyFilter);
      }

      const response = await fetch(`/api/customers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(customers.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (customerId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;

    setArchivingIds(new Set(selectedIds));
    try {
      const promises = Array.from(selectedIds).map(id =>
        fetch(`/api/customers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'archive' }),
        })
      );

      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedIds.size} customer(s) archived`,
      });
      setSelectedIds(new Set());
      fetchCustomers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive customers',
        variant: 'destructive',
      });
    } finally {
      setArchivingIds(new Set());
    }
  };

  const handleArchive = async (customerId: string) => {
    setArchivingIds(new Set([customerId]));
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Customer archived',
        });
        fetchCustomers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive customer',
        variant: 'destructive',
      });
    } finally {
      setArchivingIds(new Set());
    }
  };

  const handleRestore = async (customerId: string) => {
    setArchivingIds(new Set([customerId]));
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Customer restored',
        });
        fetchCustomers();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore customer',
        variant: 'destructive',
      });
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone_e164?.includes(search) ||
      customer.notes?.toLowerCase().includes(searchLower)
    );
  });

  const allSelected = customers.length > 0 && selectedIds.size === customers.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < customers.length;

  // Helper function to calculate days in program
  const getDaysInProgram = (createdAt: string): string => {
    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day';
      if (diffDays < 30) return `${diffDays} days`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? '1 month' : `${months} months`;
      }
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (years === 1 && remainingMonths === 0) return '1 year';
      if (remainingMonths === 0) return `${years} years`;
      return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your customer contacts and roster
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/customers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, phone, or notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'archived') => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={birthMonthFilter} onValueChange={setBirthMonthFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Birth Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
              <Select value={loyaltyFilter} onValueChange={setLoyaltyFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Loyalty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="new">New (0-30 days)</SelectItem>
                  <SelectItem value="regular">Regular (31-90 days)</SelectItem>
                  <SelectItem value="long-term">Long-term (90+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm font-medium">
                {selectedIds.size} customer{selectedIds.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  disabled={archivingIds.size > 0}
                  className="w-full sm:w-auto"
                >
                  {archivingIds.size > 0 ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Selected
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  className="w-full sm:w-auto"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table - Desktop, Cards - Mobile */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first customer'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button asChild>
                  <Link href="/dashboard/customers/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days in Program</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(customer.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(customer.id, checked as boolean)
                            }
                            aria-label={`Select ${customer.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {customer.phone_e164 || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {customer.email || '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {customer.date_of_birth 
                            ? (() => {
                                // Parse date string as local date to avoid timezone issues
                                const [year, month, day] = customer.date_of_birth.split('-').map(Number);
                                const date = new Date(year, month - 1, day);
                                return date.toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                              })()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.status === 'active' ? 'default' : 'secondary'}
                          >
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {getDaysInProgram(customer.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                              title="Edit customer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {customer.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(customer.id)}
                                disabled={archivingIds.has(customer.id)}
                                title="Archive customer"
                              >
                                {archivingIds.has(customer.id) ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <Archive className="h-4 w-4" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRestore(customer.id)}
                                disabled={archivingIds.has(customer.id)}
                                title="Restore customer"
                              >
                                {archivingIds.has(customer.id) ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <ArchiveRestore className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedIds.has(customer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(customer.id, checked as boolean)
                          }
                          aria-label={`Select ${customer.name}`}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">{customer.name}</h3>
                          <div className="mt-1 space-y-1">
                            {customer.phone_e164 && (
                              <p className="text-sm text-muted-foreground truncate">
                                📞 {customer.phone_e164}
                              </p>
                            )}
                            {customer.email && (
                              <p className="text-sm text-muted-foreground truncate">
                                ✉️ {customer.email}
                              </p>
                            )}
                            {customer.date_of_birth && (
                              <p className="text-sm text-muted-foreground truncate">
                                🎂 {(() => {
                                  // Parse date string as local date to avoid timezone issues
                                  const [year, month, day] = customer.date_of_birth.split('-').map(Number);
                                  const date = new Date(year, month - 1, day);
                                  return date.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  });
                                })()}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {getDaysInProgram(customer.created_at)} in program
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={customer.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {customer.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                          title="Edit customer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {customer.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(customer.id)}
                            disabled={archivingIds.has(customer.id)}
                            title="Archive customer"
                          >
                            {archivingIds.has(customer.id) ? (
                              <Spinner size="sm" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(customer.id)}
                            disabled={archivingIds.has(customer.id)}
                            title="Restore customer"
                          >
                            {archivingIds.has(customer.id) ? (
                              <Spinner size="sm" />
                            ) : (
                              <ArchiveRestore className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pl-8">
                      Added {new Date(customer.created_at).toLocaleDateString()} • {getDaysInProgram(customer.created_at)} in program
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
