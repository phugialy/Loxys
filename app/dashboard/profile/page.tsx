'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface AccountInfo {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Get user info
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !authUser) {
        throw new Error('Failed to load user profile');
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        created_at: authUser.created_at || '',
        last_sign_in_at: authUser.last_sign_in_at || null,
      });

      // Get account info
      const { data: accountId, error: accountIdError } = await supabase.rpc('current_account_id');
      
      if (!accountIdError && accountId) {
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('id, name, timezone, created_at')
          .eq('id', accountId)
          .maybeSingle();

        if (!accountError && accountData) {
          setAccount(accountData);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal account information
        </p>
      </div>

      {/* User Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your account details and login information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
            <div className="mt-1 text-base">{user?.email}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Your email is used for login and notifications
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Member Since</label>
            <div className="mt-1 text-base">{formatDate(user?.created_at || null)}</div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
            <div className="mt-1 text-base">{formatDate(user?.last_sign_in_at)}</div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={() => router.push('/dashboard/profile/edit')}>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Account Information */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle>Business Account</CardTitle>
            <CardDescription>
              Information about your business account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Business Name</label>
              <div className="mt-1 text-base font-semibold">{account.name}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Timezone</label>
              <div className="mt-1 text-base">{account.timezone}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Created</label>
              <div className="mt-1 text-base">{formatDate(account.created_at)}</div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
                Manage Business Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/profile/password')}
            className="w-full sm:w-auto"
          >
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
