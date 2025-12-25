'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const steps = [
  {
    step: 1,
    title: 'Sign Up',
    description: 'Create your account in 30 seconds. No credit card required.',
    icon: CheckCircle2,
    time: '30 sec',
  },
  {
    step: 2,
    title: 'Create Join Link',
    description: 'Generate your QR code or SMS keyword. Instant setup.',
    icon: Zap,
    time: '1 min',
  },
  {
    step: 3,
    title: 'Start Collecting',
    description: 'Print QR codes or display SMS keyword. Customers join instantly.',
    icon: ArrowRight,
    time: 'Immediate',
  },
  {
    step: 4,
    title: 'Send Campaigns',
    description: 'Create and send your first campaign. See results in real-time.',
    icon: Clock,
    time: '3 min',
  },
];

export function QuickSetup() {
  return (
    <section className="container py-24 md:py-32">
      <motion.div
        className="flex flex-col items-center justify-center gap-4 text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground">
          From Signup to First Campaign in 5 Minutes
        </h2>
        <p className="max-w-[700px] text-foreground/80 md:text-lg">
          No complex setup. No training needed. Start growing your customer base today.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-2 border-primary/20 hover:border-accent/40 h-full hover:shadow-xl hover:shadow-accent/10 transition-all bg-card relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>
                    <div className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                      {step.time}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Button asChild size="lg" className="text-lg px-8 h-14 bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/30 font-semibold">
          <Link href="/auth/signup">
            Get Started Now - It's Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}

