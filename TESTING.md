# Testing Guide

## RLS Policy Testing

Test Row Level Security (RLS) policies to ensure tenant isolation is working correctly.

### Prerequisites

1. Ensure `.env.local` has all required variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Running RLS Tests

```bash
pnpm test:rls
```

### What the Tests Verify

1. **current_account_id() Function**
   - Returns correct account ID for each user
   - Different users get different account IDs

2. **Tenant Isolation - SELECT**
   - Users can read their own account's data
   - Users cannot read other accounts' data
   - Tests: customers, accounts, join_tokens

3. **Tenant Isolation - INSERT**
   - Users can insert data in their own account
   - Users cannot insert data with other account_id
   - RLS automatically sets correct account_id

4. **Tenant Isolation - UPDATE**
   - Users can update their own account's data
   - Users cannot update other accounts' data

### Expected Results

All tests should pass. If any test fails, it indicates an RLS policy issue that needs to be fixed.

### Test Coverage

- ✅ `current_account_id()` function
- ✅ `accounts` table RLS
- ✅ `customers` table RLS
- ✅ `join_tokens` table RLS
- ✅ INSERT isolation
- ✅ UPDATE isolation
- ✅ Cross-tenant access prevention

## Join Flow Testing

Test join flows including QR/web join, SMS keyword join, consent capture, and unsubscribe handling.

### Running Join Flow Tests

```bash
pnpm test:join
```

### What the Tests Verify

1. **QR/Web Join Flow**
   - Valid token creates/updates customer
   - Consent records are created with proper metadata
   - Invalid tokens are rejected
   - Inactive tokens are rejected

2. **SMS Keyword Join**
   - JOIN keyword creates consent for existing customers
   - STOP keyword creates unsubscribe and revokes consent
   - Proper handling of form-encoded webhook data

3. **Consent Capture**
   - Records IP address and user agent
   - Proper channel and status tracking
   - Append-only audit trail

4. **Unsubscribe Handling**
   - Creates unsubscribe records
   - Revokes consent
   - Prevents future messages (suppression)

### Expected Results

All tests should pass. Edge Functions must be deployed and accessible.

### Test Coverage

- ✅ QR/Web join via Edge Function
- ✅ Token validation
- ✅ Customer creation/upsert
- ✅ Consent capture (SMS and email)
- ✅ SMS keyword JOIN
- ✅ SMS keyword STOP
- ✅ Unsubscribe record creation
- ✅ Consent revocation

## Campaign Sending Testing

Test campaign sending including suppression checks, delivery tracking, and webhook updates.

### Running Campaign Sending Tests

```bash
pnpm test:campaigns
```

### What the Tests Verify

1. **Suppression Checks**
   - Unsubscribed customers are excluded from campaigns
   - Email unsubscribed customers are excluded
   - Suppression is checked before creating deliveries

2. **Consent Validation**
   - Only customers with granted consent are included
   - Customers without consent are excluded
   - Latest consent status is checked

3. **Delivery Tracking**
   - Delivery records are created for eligible customers
   - Delivery status is updated after sending
   - Provider message IDs are stored
   - Timestamps (sent_at, failed_at) are recorded

4. **Webhook Updates**
   - Delivery status updated via webhook (delivered)
   - Failed delivery status updated via webhook
   - Provider event IDs tracked for idempotency
   - Timestamps updated correctly

### Expected Results

All tests should pass. These tests validate the core campaign sending logic without actually sending messages.

### Test Coverage

- ✅ Suppression checks (SMS and email)
- ✅ Consent validation
- ✅ Delivery record creation
- ✅ Delivery status updates
- ✅ Webhook status updates (delivered/failed)
- ✅ Provider message ID tracking
- ✅ Timestamp tracking

