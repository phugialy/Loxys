'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Building2, Mail, Zap, Heart, LucideIcon } from 'lucide-react';

interface Stat {
  value: string;
  label: string;
  iconName: string;
}

// Animated counter component
function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Check if value is a number or contains special characters
  const isNumber = /^\d+/.test(value);
  const isPercentage = value.includes('%');
  
  useEffect(() => {
    if (hasAnimated) return;
    
    if (isPercentage && value === '99.9%') {
      // Special handling for 99.9%
      const target = 99.9;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayValue('99.9%');
          setHasAnimated(true);
          clearInterval(timer);
        } else {
          setDisplayValue(`${current.toFixed(1)}%`);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else if (isNumber) {
      const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
      const suffix = value.replace(/[0-9]/g, '');
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setDisplayValue(`${numericValue}${suffix}`);
          setHasAnimated(true);
          clearInterval(timer);
        } else {
          setDisplayValue(`${Math.floor(current)}${suffix}`);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
    
    // For non-numeric values like "24/7", just display as-is
    setHasAnimated(true);
  }, [value, isNumber, isPercentage, hasAnimated]);

  return <span>{displayValue}</span>;
}

interface StatsSectionProps {
  stats: Stat[];
}

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Mail,
  Zap,
  Heart,
};

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="container py-24 md:py-32">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.iconName];
          if (!Icon) return null;
          return (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 shadow-md mb-4"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.div
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent/90 to-accent/70 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                <AnimatedCounter value={stat.value} />
              </motion.div>
              <p className="text-foreground/80 text-sm md:text-base font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

