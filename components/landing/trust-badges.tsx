'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle2, Award, FileCheck, Zap } from 'lucide-react';

const badges = [
  { icon: Shield, text: 'GDPR Compliant', color: 'text-blue-600' },
  { icon: Lock, text: 'TCPA Compliant', color: 'text-green-600' },
  { icon: FileCheck, text: 'CAN-SPAM Compliant', color: 'text-purple-600' },
  { icon: Lock, text: 'SOC 2 Ready', color: 'text-indigo-600' },
  { icon: Zap, text: '99.9% Uptime SLA', color: 'text-orange-600' },
  { icon: Award, text: 'Enterprise Security', color: 'text-red-600' },
];

export function TrustBadges() {
  return (
    <section className="border-y border-primary/10 bg-muted/20 py-12">
      <div className="container">
        <motion.div
          className="flex flex-col items-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">
            Trusted & Certified
          </p>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.text}
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className={`h-5 w-5 ${badge.color}`} />
                <span className="text-sm font-medium text-foreground/80">{badge.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

