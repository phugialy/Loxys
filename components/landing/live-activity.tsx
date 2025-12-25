'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Simulated live activity - in production, this would fetch real data
const generateRandomActivity = () => {
  const messages = [12500, 15800, 22100, 19300, 26700];
  const customers = [3420, 3890, 4150, 4520, 4780];
  const businesses = [520, 587, 634, 692, 718];
  
  return {
    messages: messages[Math.floor(Math.random() * messages.length)],
    customers: customers[Math.floor(Math.random() * customers.length)],
    businesses: businesses[Math.floor(Math.random() * businesses.length)],
  };
};

export function LiveActivity() {
  const [activity, setActivity] = useState(generateRandomActivity());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActivity(generateRandomActivity());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 border-y border-primary/10">
      <div className="container">
        <motion.div
          className="flex flex-col items-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">
              Live Activity This Month
            </p>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activity.messages}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-accent/20 bg-card hover:shadow-lg hover:border-accent/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium text-foreground/60">Messages Sent</p>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">{formatNumber(activity.messages)}+</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activity.customers}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-accent/20 bg-card hover:shadow-lg hover:border-accent/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium text-foreground/60">Customers Joined</p>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">{formatNumber(activity.customers)}+</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activity.businesses}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-2 border-accent/20 bg-card hover:shadow-lg hover:border-accent/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        <p className="text-sm font-medium text-foreground/60">Active Businesses</p>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">{activity.businesses}+</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

