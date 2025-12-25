import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/landing/navbar';
import { 
  Users, 
  Mail, 
  Shield, 
  Zap, 
  CheckCircle2,
  MessageSquare,
  BarChart3
} from 'lucide-react';

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
      icon: Users,
      title: 'Customer Management',
      description: 'Easily collect and organize customer contacts with QR codes and join links.',
    },
    {
      icon: Mail,
      title: 'Multi-Channel Messaging',
      description: 'Send SMS and email campaigns to reach your customers where they are.',
    },
    {
      icon: Shield,
      title: 'Compliance Built-In',
      description: 'Automatic consent tracking, unsubscribe handling, and regulatory compliance.',
    },
    {
      icon: Zap,
      title: 'Quick Setup',
      description: 'Get started in minutes. No technical expertise required.',
    },
    {
      icon: MessageSquare,
      title: 'Two-Way Communication',
      description: 'Customers can join via SMS keywords and manage their preferences.',
    },
    {
      icon: BarChart3,
      title: 'Campaign Analytics',
      description: 'Track delivery rates, opens, and engagement with detailed analytics.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      business: 'Local Coffee Shop',
      quote: 'Loxys made it so easy to stay in touch with our regular customers. Our engagement has increased significantly!',
    },
    {
      name: 'Mike Chen',
      business: 'Fitness Studio',
      quote: 'The QR code feature is brilliant. Customers can join our list right at the counter. Highly recommend!',
    },
    {
      name: 'Emily Rodriguez',
      business: 'Beauty Salon',
      quote: 'Finally, a platform that handles compliance automatically. I can focus on my business, not paperwork.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-6 py-24 md:py-32 lg:py-40">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Connect with Your Customers
            <br />
            <span className="text-primary">The Easy Way</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Collect customer contacts, send compliant SMS and email campaigns, and grow your local business. 
            All in one simple platform.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24 md:py-32">
        <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything You Need to Grow
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Powerful features designed for local businesses. Simple enough for anyone to use.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container py-24 md:py-32 bg-muted/50">
        <div className="flex flex-col items-center justify-center gap-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Trusted by Local Businesses
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            See what business owners are saying about Loxys
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardHeader>
                <CardDescription className="text-base italic">
                  "{testimonial.quote}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 md:py-32">
        <Card className="border-2 bg-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl mb-4">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-lg">
              Join local businesses using Loxys to grow their customer base
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/signup">Start Free Trial</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">L</span>
            </div>
            <span className="font-semibold">Loxys</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="hover:text-foreground transition-colors">
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
