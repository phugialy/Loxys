import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/landing/navbar';
import { TestimonialCarousel } from '@/components/landing/testimonial-carousel';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { 
  Users, 
  Mail, 
  Shield, 
  Zap, 
  MessageSquare,
  BarChart3,
  QrCode,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Lock,
  FileCheck,
  Smartphone,
  Building2,
  Heart,
  Sparkles
} from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { StorySection } from '@/components/landing/story-section';
import { StatsSection } from '@/components/landing/stats-section';
import { ROIShowcase } from '@/components/landing/roi-showcase';
import { TrustBadges } from '@/components/landing/trust-badges';
import { QuickSetup } from '@/components/landing/quick-setup';
import { LiveActivity } from '@/components/landing/live-activity';

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const features = [
    {
      iconName: 'QrCode',
      title: 'QR Code Join Links',
      description: 'Customers scan and join instantly. Print QR codes for your counter, flyers, or receipts. No app downloads needed.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: 0.1,
    },
    {
      iconName: 'Smartphone',
      title: 'SMS Keyword Join',
      description: 'Customers text JOIN to your number. Instant opt-in, zero friction. Perfect for in-store promotions.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: 0.2,
    },
    {
      iconName: 'MessageSquare',
      title: 'Multi-Channel Campaigns',
      description: 'Send SMS and email from one platform. Reach customers on their preferred channel with personalized messages.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      delay: 0.3,
    },
    {
      iconName: 'Shield',
      title: 'Compliance Built-In',
      description: 'Automatic consent tracking, unsubscribe handling, and regulatory compliance. Sleep well knowing you\'re protected.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      delay: 0.4,
    },
    {
      iconName: 'Lock',
      title: 'Private-First Architecture',
      description: 'Your data is completely isolated. Multi-tenant security means your customer list stays yours—always.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      delay: 0.5,
    },
    {
      iconName: 'BarChart3',
      title: 'Real-Time Analytics',
      description: 'Track delivery rates, opens, clicks, and engagement. Make data-driven decisions to grow your business.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      delay: 0.6,
    },
  ];

  const uniqueValues = [
    {
      iconName: 'FileCheck',
      title: 'Consent-First Messaging',
      description: 'Explicit opt-in required per channel. Not just "agree to terms"—actual channel-specific consent. Your customers choose how they want to hear from you.',
    },
    {
      iconName: 'Lock',
      title: 'Complete Data Isolation',
      description: 'Every business is a separate tenant. Your customer data is encrypted, isolated, and protected. No shared databases, no data leaks.',
    },
    {
      iconName: 'Shield',
      title: 'Audit Trail Built-In',
      description: 'Append-only consent logs. Every opt-in, opt-out, and unsubscribe is permanently recorded. Compliance isn\'t optional—it\'s automatic.',
    },
    {
      iconName: 'Building2',
      title: 'Built for Local Businesses',
      description: 'Not enterprise software. Not a side project. Built specifically for local businesses who need simple, fast, affordable customer communication.',
    },
  ];

  const benefits = [
    'No credit card required',
    'Free forever plan available',
    'Cancel anytime',
    '24/7 customer support',
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Local Coffee Shop',
      role: 'Owner',
      quote: 'Loxys made it so easy to stay in touch with our regular customers. Our engagement has increased significantly! The QR codes at the counter are a game-changer.',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      business: 'Fitness Studio',
      role: 'Manager',
      quote: 'The QR code feature is brilliant. Customers can join our list right at the counter. Highly recommend! Plus, compliance is handled automatically—no stress.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      business: 'Beauty Salon',
      role: 'Owner',
      quote: 'Finally, a platform that handles compliance automatically. I can focus on my business, not paperwork. The consent tracking gives me peace of mind.',
      rating: 5,
    },
    {
      name: 'David Park',
      business: 'Local Restaurant',
      role: 'Owner',
      quote: 'We tried other platforms, but Loxys is the only one that truly understands local businesses. Simple, fast, and actually affordable.',
      rating: 5,
    },
    {
      name: 'Lisa Thompson',
      business: 'Boutique Store',
      role: 'Manager',
      quote: 'The multi-channel approach is perfect. Some customers prefer SMS, others email. Loxys handles both seamlessly.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '500+', label: 'Local Businesses', iconName: 'Building2' },
    { value: '50K+', label: 'Messages Sent', iconName: 'Mail' },
    { value: '99.9%', label: 'Uptime', iconName: 'Zap' },
    { value: '24/7', label: 'Support', iconName: 'Heart' },
  ];

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection benefits={benefits} />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Live Activity */}
      <LiveActivity />

      {/* Story Section */}
      <StorySection />

      {/* Stats Section */}
      <StatsSection stats={stats} />

      {/* Unique Value Propositions */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent/20 bg-accent/10 backdrop-blur-sm px-4 py-1.5 text-sm mb-4 shadow-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-accent font-semibold">What Makes Us Different</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground">
            Built for Local Businesses, Not Enterprises
          </h2>
          <p className="max-w-[700px] text-foreground/80 md:text-lg">
            We understand the unique challenges local businesses face. That's why we built Loxys differently.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {uniqueValues.map((value, index) => {
            // Map icon names to components
            const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
              FileCheck,
              Lock,
              Shield,
              Building2,
            };
            const Icon = iconMap[value.iconName];
            if (!Icon) return null;
            return (
              <Card key={value.title} className="border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all bg-card">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{value.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-foreground/80">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-muted/40 via-muted/30 to-muted/40 py-24 md:py-32">
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="max-w-[700px] text-foreground/80 md:text-lg">
              Powerful features designed for local businesses. Simple enough for anyone to use.
            </p>
          </div>
          <FeatureShowcase features={features} />
        </div>
      </section>

      {/* ROI Showcase */}
      <ROIShowcase />

      {/* Quick Setup */}
      <QuickSetup />

      {/* Testimonials Section */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground">
            Loved by Local Businesses
          </h2>
          <p className="max-w-[700px] text-foreground/80 md:text-lg">
            Join hundreds of businesses using Loxys to grow their customer base
          </p>
        </div>
        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* CTA Section */}
      <section className="container py-24 md:py-32">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/15 to-primary/10 overflow-hidden relative shadow-2xl">
          {/* Decorative gradient orb */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl -z-10" />
          
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-30" />
          <CardHeader className="text-center relative z-10 pt-8">
            <CardTitle className="text-3xl md:text-4xl lg:text-5xl mb-4 text-foreground">
              Ready to Grow Your Business?
            </CardTitle>
            <CardDescription className="text-lg md:text-xl max-w-2xl mx-auto text-foreground/80">
              Join local businesses using Loxys to connect with customers and drive growth. 
              Start your free account today—no credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 pb-8">
            <Button asChild size="lg" className="text-lg px-8 h-14 bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/30 font-semibold">
              <Link href="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 h-14 border-2 hover:bg-primary/5 font-medium">
              <Link href="/auth/login">Sign In to Existing Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col items-center justify-between gap-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Loxys
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/auth/signup" className="hover:text-foreground transition-colors font-medium">
              Sign Up
            </Link>
          </div>
        </div>
        <div className="container border-t py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Loxys. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
