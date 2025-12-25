'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  QrCode,
  Smartphone,
  MessageSquare,
  Shield,
  Lock,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

interface Feature {
  iconName: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  delay: number;
}

interface FeatureShowcaseProps {
  features: Feature[];
}

const iconMap: Record<string, LucideIcon> = {
  QrCode,
  Smartphone,
  MessageSquare,
  Shield,
  Lock,
  BarChart3,
};

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = iconMap[feature.iconName];
        if (!Icon) return null;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: feature.delay }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className={`border-2 transition-all h-full cursor-pointer group bg-card ${
              feature.title === 'Real-Time Analytics' || feature.title === 'Multi-Channel Campaigns'
                ? 'border-primary/20 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10'
                : 'border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10'
            }`}>
              <CardHeader>
                <motion.div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                    feature.title === 'Real-Time Analytics' || feature.title === 'Multi-Channel Campaigns'
                      ? 'bg-accent/10 group-hover:bg-accent/15'
                      : feature.bgColor
                  } group-hover:scale-110 transition-transform shadow-sm`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`h-7 w-7 ${
                    feature.title === 'Real-Time Analytics' || feature.title === 'Multi-Channel Campaigns'
                      ? 'text-accent'
                      : feature.color
                  }`} />
                </motion.div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-base text-foreground/80">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

