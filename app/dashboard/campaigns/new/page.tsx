'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewCampaignPage() {
  const router = useRouter();
  const [channel, setChannel] = useState<'sms' | 'email'>('sms');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ body?: string }>({});
  const { toast } = useToast();

  const SMS_MAX_LENGTH = 1600;
  const remainingChars = SMS_MAX_LENGTH - body.length;
  const isSMS = channel === 'sms';
  const isNearLimit = isSMS && remainingChars < 100;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!body.trim()) {
      newErrors.body = 'Message body is required';
    } else if (isSMS && body.length > SMS_MAX_LENGTH) {
      newErrors.body = `SMS messages must be ${SMS_MAX_LENGTH} characters or less`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, body: body.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create campaign');
      }

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });

      router.push('/dashboard/campaigns');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground mt-2">
          Create a new message campaign to send to your customers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Choose your channel and compose your message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Channel Selection */}
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={channel} onValueChange={(value: 'sms' | 'email') => setChannel(value)}>
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose whether to send via SMS or Email
              </p>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body">
                  Message Body <span className="text-destructive">*</span>
                </Label>
                {isSMS && (
                  <Badge variant={isNearLimit ? 'destructive' : 'secondary'}>
                    {remainingChars} characters remaining
                  </Badge>
                )}
              </div>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (errors.body) setErrors({ ...errors, body: undefined });
                }}
                required
                rows={isSMS ? 8 : 12}
                maxLength={isSMS ? SMS_MAX_LENGTH : undefined}
                placeholder={
                  isSMS
                    ? 'Enter your SMS message. Remember to include STOP instructions for compliance (e.g., "Reply STOP to unsubscribe").'
                    : 'Enter your email message. You can include HTML formatting.'
                }
                className={errors.body ? 'border-destructive' : ''}
              />
              {errors.body && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.body}
                </p>
              )}
              {isSMS && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-medium mb-1">SMS Compliance Requirements:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                        <li>Include "Reply STOP to unsubscribe" for compliance</li>
                        <li>Maximum {SMS_MAX_LENGTH} characters</li>
                        <li>Messages are sent to customers who have consented to SMS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {!isSMS && (
                <p className="text-sm text-muted-foreground">
                  Email messages can include HTML formatting and will be sent to customers who have consented to email.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
