'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, MessageSquare, TrendingUp } from 'lucide-react';

const storySteps = [
  {
    icon: Building2,
    title: 'You Run a Local Business',
    description: 'Coffee shop, salon, restaurant, gym—you name it. You have regular customers, but staying in touch is hard. Email lists are outdated. Social media algorithms hide your posts. You need a better way.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Your Customers Want to Hear From You',
    description: 'They want to know about specials, new products, events. But they don\'t want spam. They want to choose how they hear from you—SMS for urgent updates, email for newsletters.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: MessageSquare,
    title: 'Compliance is Scary',
    description: 'You\'ve heard about GDPR, TCPA, CAN-SPAM. You know you need consent, but tracking it manually is a nightmare. One mistake could cost you thousands. You need it handled automatically.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    title: 'Loxys Solves This',
    description: 'QR codes at your counter. SMS keywords for in-store promotions. Automatic consent tracking. Built-in unsubscribe handling. Real-time analytics. All in one simple platform designed for local businesses like yours.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export function StorySection() {
  return (
    <section className="bg-gradient-to-b from-background via-muted/20 to-muted/30 py-24 md:py-32">
      <div className="container">
        <motion.div
          className="flex flex-col items-center justify-center gap-4 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            The Story of Every Local Business
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            We built Loxys because we understand your challenges. Here's how we solve them.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {storySteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`border-2 h-full transition-all bg-card ${
                  step.title === 'Loxys Solves This' 
                    ? 'border-accent/30 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10' 
                    : 'border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
                }`}>
                  <CardContent className="pt-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                      step.title === 'Loxys Solves This' 
                        ? 'bg-accent/10' 
                        : step.bgColor
                    } shadow-sm`}>
                      <Icon className={`h-6 w-6 ${
                        step.title === 'Loxys Solves This' 
                          ? 'text-accent' 
                          : step.color
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-foreground/80 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

