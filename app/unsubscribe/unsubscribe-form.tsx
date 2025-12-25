'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const accountId = searchParams.get('account');
  const channel = searchParams.get('channel') || 'email';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnsubscribe = async () => {
    if (!email && !accountId) {
      setError('Missing required parameters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          account_id: accountId,
          channel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unsubscribe');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#28a745' }}>Unsubscribed</h1>
        <p>You have been successfully unsubscribed from {channel.toUpperCase()} messages.</p>
        <p style={{ color: '#666', marginTop: '20px', fontSize: '14px' }}>
          You will no longer receive {channel.toUpperCase()} messages from us.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px' }}>
      <h1>Unsubscribe</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Are you sure you want to unsubscribe from {channel.toUpperCase()} messages?
      </p>
      {email && (
        <p style={{ marginBottom: '20px' }}>
          <strong>Email:</strong> {email}
        </p>
      )}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      <button
        onClick={handleUnsubscribe}
        disabled={loading}
        style={{
          padding: '12px 24px',
          backgroundColor: loading ? '#ccc' : '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
        }}
      >
        {loading ? 'Processing...' : 'Unsubscribe'}
      </button>
    </div>
  );
}

