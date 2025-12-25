# Loxys

Multi-tenant SaaS for local businesses to collect customer contact info and send compliant SMS/email broadcasts.

## Features

- **Multi-tenant isolation** - Secure tenant separation with RLS
- **Contact collection** - QR/web join and SMS keyword join
- **Compliant messaging** - Consent-first with unsubscribe support
- **Campaign management** - SMS and email broadcasts with delivery tracking

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth
- **Language**: TypeScript
- **Package Manager**: pnpm
- **SMS Provider**: Twilio
- **Email Provider**: Postmark

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Get your service role key from Supabase dashboard
   - Add Twilio credentials (for SMS)
   - Add Postmark credentials (for email)

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for required environment variables.

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### Optional (for messaging)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `POSTMARK_API_KEY` - Postmark API key
- `POSTMARK_FROM_EMAIL` - From email address

### Optional (for cron jobs)
- `CRON_SECRET` - Secret for securing cron endpoints

## Project Structure

```
├── app/          # Next.js app router pages
├── ui/           # React components
├── server/       # API routes and server actions
├── db/           # Database queries and migrations
├── providers/    # External service adapters (Twilio, Email, etc.)
├── edge/         # Supabase Edge Functions
├── lib/          # Shared utilities
└── types/        # TypeScript type definitions
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

The cron job for processing deliveries is configured in `vercel.json` to run every 5 minutes.

### Supabase Edge Functions

Edge Functions are already deployed:
- `join-web` - Public join endpoint
- `join-sms-webhook` - SMS keyword handler
- `provider-status-webhook` - Delivery status updates

## License

ISC
