import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, MessageSquare, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { getDashboardStats } from '@/server/dashboard/stats';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get account name for welcome message
  let accountName = 'your business';
  const { data: accountId } = await supabase.rpc('current_account_id');
  if (accountId) {
    const { data: account } = await supabase
      .from('accounts')
      .select('name')
      .eq('id', accountId)
      .maybeSingle();
    if (account?.name) {
      accountName = account.name;
    }
  }

  // Get dashboard stats
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    stats = {
      totalCustomers: 0,
      totalCampaigns: 0,
      totalMessagesSent: 0,
      recentCustomers: [],
      recentCampaigns: [],
    };
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'sending':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'draft':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with {accountName}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Campaigns created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessagesSent}</div>
            <p className="text-xs text-muted-foreground">
              Total messages delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-start">
            <Link href="/dashboard/customers/new">
              <Plus className="h-5 w-5 mb-2" />
              <span className="font-semibold">Add Customer</span>
              <span className="text-sm text-muted-foreground font-normal">
                Add a new customer to your roster
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-start">
            <Link href="/dashboard/campaigns/new">
              <Plus className="h-5 w-5 mb-2" />
              <span className="font-semibold">Create Campaign</span>
              <span className="text-sm text-muted-foreground font-normal">
                Send a new message campaign
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-start">
            <Link href="/dashboard/join-tokens">
              <Plus className="h-5 w-5 mb-2" />
              <span className="font-semibold">Generate Join Link</span>
              <span className="text-sm text-muted-foreground font-normal">
                Create a new customer join link
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Customers</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/customers">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentCustomers.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        {customer.name || customer.email || customer.phone_e164 || 'Unnamed Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(customer.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No customers yet. Add your first customer to get started!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Campaigns</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/campaigns">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline">{campaign.channel.toUpperCase()}</Badge>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">
                        {campaign.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(campaign.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No campaigns yet. Create your first campaign!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
