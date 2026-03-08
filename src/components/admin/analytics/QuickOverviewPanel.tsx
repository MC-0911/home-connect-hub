import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, Home, Trophy, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { QuickOverviewData } from './useAnalyticsData';

interface QuickOverviewPanelProps {
  data: QuickOverviewData;
}

export function QuickOverviewPanel({ data }: QuickOverviewPanelProps) {
  const overviewItems = [
    { label: 'Buyers / Tenants', value: data.buyerCount, icon: Users },
    { label: 'Sellers / Landlords', value: data.sellerCount, icon: Home },
    { label: 'Active Agents', value: data.agentCount, icon: UserCheck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
    >
      <Card className="h-full border-border/50 shadow-[0_15px_30px_-12px_hsl(var(--primary)/0.12)] hover:shadow-[0_25px_40px_-16px_hsl(var(--primary)/0.2)] transition-shadow duration-300 rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quick Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {overviewItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-1"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-lg font-bold text-foreground">{item.value.toLocaleString()}</span>
            </div>
          ))}

          {/* Top Agent highlight */}
          {data.topAgent && (
            <div className="mt-2 rounded-2xl bg-accent/10 border border-accent/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-foreground">Top agent this month</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{data.topAgent.name}</span>
                </div>
                <span className="text-sm font-bold text-accent">
                  {data.topAgent.deals} {data.topAgent.deals === 1 ? 'listing' : 'listings'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
