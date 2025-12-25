'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Mail, MessageSquare, Play, CheckCircle2, Clock, XCircle, BarChart3 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  channel: string;
  body: string;
  status: string;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  stats?: {
    total: number;
    queued: number;
    sent: number;
    delivered: number;
    failed: number;
    suppressed: number;
    bounced: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingCampaignId, setStartingCampaignId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [campaignToStart, setCampaignToStart] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
    // Refresh every 10 seconds to update stats for active campaigns
    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      const campaignsWithStats = await Promise.all(
        (data.campaigns || []).map(async (campaign: Campaign) => {
          try {
            const statsResponse = await fetch(`/api/campaigns/${campaign.id}`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              return { ...campaign, stats: statsData.campaign?.stats };
            }
          } catch {
            // Ignore stats fetch errors
          }
          return campaign;
        })
      );
      setCampaigns(campaignsWithStats);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartClick = (campaignId: string) => {
    setCampaignToStart(campaignId);
    setConfirmDialogOpen(true);
  };

  const handleStartCampaign = async () => {
    if (!campaignToStart) return;

    setStartingCampaignId(campaignToStart);
    setConfirmDialogOpen(false);

    try {
      const response = await fetch(`/api/campaigns/${campaignToStart}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start campaign');
      }

      toast({
        title: 'Success',
        description: 'Campaign started successfully',
      });
      
      // Refresh campaigns
      await fetchCampaigns();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start campaign',
        variant: 'destructive',
      });
    } finally {
      setStartingCampaignId(null);
      setCampaignToStart(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'sending':
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400"><Clock className="mr-1 h-3 w-3" />Sending</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Draft</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    return channel === 'sms' ? (
      <MessageSquare className="h-5 w-5" />
    ) : (
      <Mail className="h-5 w-5" />
    );
  };

  const getProgressPercentage = (stats?: Campaign['stats']) => {
    if (!stats || stats.total === 0) return 0;
    const completed = stats.delivered + stats.failed + stats.bounced + stats.suppressed;
    return Math.round((completed / stats.total) * 100);
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Create and manage your message campaigns
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first campaign to start sending messages to your customers
            </p>
            <Button asChild>
              <Link href="/dashboard/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const progress = getProgressPercentage(campaign.stats);
            const isStarting = startingCampaignId === campaign.id;

            return (
              <Card key={campaign.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {getChannelIcon(campaign.channel)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {campaign.channel.toUpperCase()} Campaign
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {campaign.body}
                  </p>

                  {/* Stats */}
                  {campaign.stats && campaign.stats.total > 0 && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total</span>
                          <span className="font-medium">{campaign.stats.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Delivered</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {campaign.stats.delivered}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Sent</span>
                          <span className="font-medium">{campaign.stats.sent}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Failed</span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            {campaign.stats.failed}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t">
                    {campaign.status === 'draft' && (
                      <Button
                        onClick={() => handleStartClick(campaign.id)}
                        disabled={isStarting}
                        className="w-full"
                        size="sm"
                      >
                        {isStarting ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Campaign
                          </>
                        )}
                      </Button>
                    )}
                    {campaign.status === 'sending' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Spinner size="sm" />
                        <span>Campaign in progress...</span>
                      </div>
                    )}
                    {campaign.status === 'completed' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span>Campaign completed</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Start Campaign Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the campaign to all eligible customers. This action cannot be undone.
              Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartCampaign}>
              Start Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
