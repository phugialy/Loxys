'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, DollarSign, Users, ArrowUpRight } from 'lucide-react';

const roiMetrics = [
  {
    icon: TrendingUp,
    metric: '300%',
    label: 'Average Increase in Customer Engagement',
    description: 'Businesses see 3x more responses compared to traditional marketing',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Clock,
    metric: '5 Min',
    label: 'Average Setup Time',
    description: 'Get started and send your first campaign in under 5 minutes',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: DollarSign,
    metric: '40%',
    label: 'Average ROI Increase',
    description: 'Our customers report significantly better return on marketing spend',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Users,
    metric: '2.5x',
    label: 'Faster Customer Growth',
    description: 'Build your contact list 2.5x faster with QR codes and SMS keywords',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export function ROIShowcase() {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-24 md:py-32">
      <div className="container">
        <motion.div
          className="flex flex-col items-center justify-center gap-4 text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent/20 bg-accent/10 backdrop-blur-sm px-4 py-1.5 text-sm mb-4 shadow-sm">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-accent font-semibold">Proven Results</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-foreground">
            Real Numbers, Real Results
          </h2>
          <p className="max-w-[700px] text-foreground/80 md:text-lg">
            See what Loxys customers are achieving. These aren't promises—they're actual results from real businesses.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {roiMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="border-2 border-accent/20 hover:border-accent/40 h-full hover:shadow-xl hover:shadow-accent/15 transition-all bg-card group">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 shadow-sm group-hover:scale-110 group-hover:bg-accent/15 transition-all">
                      <Icon className="h-7 w-7 text-accent" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent/90 to-accent/70 bg-clip-text text-transparent mb-2">
                      {metric.metric}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{metric.label}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{metric.description}</p>
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

