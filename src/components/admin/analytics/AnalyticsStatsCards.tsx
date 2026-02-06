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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value.toLocaleString()}</div>
              {stat.breakdown.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                  {stat.breakdown.map((item) => (
                    <span key={item.label} className={item.colorClass}>
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
