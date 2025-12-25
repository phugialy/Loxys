'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Link2, Copy, Check, Power, RefreshCw, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JoinToken {
  id: string;
  token: string;
  channel_hint: string | null;
  active: boolean;
  created_at: string;
}

export default function JoinTokensPage() {
  const [tokens, setTokens] = useState<JoinToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [regenerateDialog, setRegenerateDialog] = useState<{ open: boolean; tokenId: string | null }>({
    open: false,
    tokenId: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/join-tokens');
      if (!response.ok) throw new Error('Failed to fetch tokens');
      const data = await response.json();
      setTokens(data.tokens || []);
    } catch (error) {
      console.error('Error fetching join tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to load join tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    setCreating(true);
    try {
      const response = await fetch('/api/join-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create token');
      }

      toast({
        title: 'Success',
        description: 'Join link created successfully',
      });

      fetchTokens();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create join link',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (tokenId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/join-tokens/${tokenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: currentActive ? 'deactivate' : 'activate' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update token');
      }

      toast({
        title: 'Success',
        description: `Join link ${currentActive ? 'deactivated' : 'activated'}`,
      });

      fetchTokens();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update join link',
        variant: 'destructive',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!regenerateDialog.tokenId) return;

    try {
      const response = await fetch(`/api/join-tokens/${regenerateDialog.tokenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to regenerate token');
      }

      toast({
        title: 'Success',
        description: 'Join link regenerated successfully',
      });

      setRegenerateDialog({ open: false, tokenId: null });
      fetchTokens();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to regenerate join link',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = async (url: string, tokenId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(tokenId);
      toast({
        title: 'Copied!',
        description: 'Join URL copied to clipboard',
      });
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const getJoinUrl = (token: string) => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/join/${token}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Join Links</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Create and manage customer join links and QR codes
          </p>
        </div>
        <Button onClick={handleCreateToken} disabled={creating} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {creating ? 'Creating...' : 'Create Join Link'}
        </Button>
      </div>

      {/* Tokens Grid */}
      {tokens.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No join links yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first join link to start collecting customer contacts
            </p>
            <Button onClick={handleCreateToken} disabled={creating}>
              <Plus className="mr-2 h-4 w-4" />
              Create Join Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tokens.map((token) => {
            const joinUrl = getJoinUrl(token.token);
            const isCopied = copiedToken === token.id;

            return (
              <Card key={token.id} className={!token.active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Link2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Join Link</CardTitle>
                        <CardDescription className="text-xs">
                          {token.channel_hint || 'All channels'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={token.active ? 'default' : 'secondary'}>
                      {token.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Join URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={joinUrl}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(joinUrl, token.id)}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(token.id, token.active)}
                      className="flex-1"
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {token.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRegenerateDialog({ open: true, tokenId: token.id })}
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created {new Date(token.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog
        open={regenerateDialog.open}
        onOpenChange={(open) => setRegenerateDialog({ open, tokenId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Join Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new token and invalidate the old one. The old join link will no longer work.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
