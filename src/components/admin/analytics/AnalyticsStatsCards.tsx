import { Card, CardContent } from '@/components/ui/card';
import { Users, Home, FileText, MessageSquare, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatBreakdown {
  label: string;
  value: number;
  colorClass: string;
}

interface StatCardData {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  breakdown: StatBreakdown[];
}

interface AnalyticsStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  totalBlogViews: number;
}

export function AnalyticsStatsCards(props: AnalyticsStatsCardsProps) {
  const stats: StatCardData[] = [
    {
      title: 'Total Users',
      value: props.totalUsers,
      icon: Users,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      breakdown: [
        { label: 'active', value: props.activeUsers, colorClass: 'text-success' },
        { label: 'suspended', value: props.suspendedUsers, colorClass: 'text-destructive' },
      ],
    },
    {
      title: 'Total Listings',
      value: props.totalListings,
      icon: Home,
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
      breakdown: [
        { label: 'active', value: props.activeListings, colorClass: 'text-success' },
        { label: 'pending', value: props.pendingListings, colorClass: 'text-warning' },
        { label: 'sold', value: props.soldListings, colorClass: 'text-primary' },
      ],
    },
    {
      title: 'Total Blogs',
      value: props.totalBlogs,
      icon: FileText,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
      breakdown: [
        { label: 'published', value: props.publishedBlogs, colorClass: 'text-success' },
        { label: 'draft', value: props.draftBlogs, colorClass: 'text-muted-foreground' },
      ],
    },
    {
      title: 'Total Leads',
      value: props.totalLeads,
      icon: MessageSquare,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      breakdown: [
        { label: 'new', value: props.newLeads, colorClass: 'text-primary' },
        { label: 'contacted', value: props.contactedLeads, colorClass: 'text-warning' },
        { label: 'qualified', value: props.qualifiedLeads, colorClass: 'text-success' },
      ],
    },
    {
      title: 'Total Blog Views',
      value: props.totalBlogViews,
      icon: Eye,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      breakdown: [],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
        >
          <Card className="h-full border-border/50 shadow-[0_15px_30px_-12px_hsl(var(--primary)/0.12)] hover:shadow-[0_25px_40px_-16px_hsl(var(--primary)/0.2)] transition-shadow duration-300 rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-foreground leading-tight">
                    {stat.value.toLocaleString()}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </span>
                </div>
              </div>
              {stat.breakdown.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs mt-3 pt-3 border-t border-border/50">
                  {stat.breakdown.map((item) => (
                    <span key={item.label} className={`${item.colorClass} font-medium`}>
                      {item.value} {item.label}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
