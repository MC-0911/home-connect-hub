import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const CHART_COLORS = {
  primary: 'hsl(228, 76%, 59%)',
  secondary: 'hsl(230, 24%, 14%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  info: 'hsl(262, 83%, 58%)',
  accent: 'hsl(187, 85%, 43%)',
  muted: 'hsl(215, 16%, 47%)',
};

const DONUT_COLORS = [CHART_COLORS.secondary, CHART_COLORS.accent, CHART_COLORS.warning, CHART_COLORS.primary, CHART_COLORS.success];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function ChartCard({ title, subtitle, children, delay = 0, className }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">{message}</div>
  );
}

// Build time series from created_at dates
function buildTimeSeries(items: { created_at: string }[], fromDate?: Date, toDate?: Date) {
  const now = toDate || new Date();
  const start = fromDate || subMonths(now, 6);
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(now) });

  const counts: Record<string, number> = {};
  months.forEach((m) => (counts[format(m, 'MMM yyyy')] = 0));

  items.forEach((item) => {
    const d = parseISO(item.created_at);
    const key = format(startOfMonth(d), 'MMM yyyy');
    if (key in counts) counts[key]++;
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// ─── Exported Charts ────────────────────────────────────────────────

interface ActivityOverTimeProps {
  listings: { created_at: string }[];
  users: { created_at: string }[];
  fromDate?: Date;
  toDate?: Date;
}

export function ActivityOverTimeChart({ listings, users, fromDate, toDate }: ActivityOverTimeProps) {
  const now = toDate || new Date();
  const start = fromDate || subMonths(now, 3);
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(now) });

  const data = months.map((m) => {
    const key = format(m, 'MMM yyyy');
    const listingCount = listings.filter((l) => format(startOfMonth(parseISO(l.created_at)), 'MMM yyyy') === key).length;
    const userCount = users.filter((u) => format(startOfMonth(parseISO(u.created_at)), 'MMM yyyy') === key).length;
    return { name: key, listings: listingCount, users: userCount };
  });

  return (
    <ChartCard title="Activity Over Time" subtitle={fromDate && toDate ? `${format(fromDate, 'MMM d, yyyy')} - ${format(toDate, 'MMM d, yyyy')}` : undefined} delay={0.2}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="listings" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ r: 3 }} name="Listings" />
            <Line type="monotone" dataKey="users" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 3 }} name="Users" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No activity data available" />
      )}
    </ChartCard>
  );
}

interface TimeSeriesProps {
  items: { created_at: string }[];
  fromDate?: Date;
  toDate?: Date;
}

export function UserGrowthChart({ items, fromDate, toDate }: TimeSeriesProps) {
  const data = buildTimeSeries(items, fromDate, toDate);
  // Make cumulative
  let cumulative = 0;
  const cumulativeData = data.map((d) => {
    cumulative += d.value;
    return { ...d, total: cumulative };
  });

  return (
    <ChartCard title="User Growth" subtitle={fromDate && toDate ? `${format(fromDate, 'MMM d, yyyy')} - ${format(toDate, 'MMM d, yyyy')}` : undefined} delay={0.3}>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={cumulativeData}>
          <defs>
            <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="total" stroke={CHART_COLORS.accent} fill="url(#userGrowthGradient)" strokeWidth={2} name="Total Users" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface BarChartProps {
  data: { name: string; value: number }[];
}

export function ListingsByTypeChart({ data }: BarChartProps) {
  return (
    <ChartCard title="Listings by Property Type" delay={0.4}>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} name="Listings" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No listing data available" />
      )}
    </ChartCard>
  );
}

interface DonutChartProps {
  data: { name: string; value: number }[];
  title: string;
  delay?: number;
  showLegend?: boolean;
}

export function DonutChart({ data, title, delay = 0.5, showLegend = true }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title={title} delay={delay}>
      {data.length > 0 ? (
        <div className={showLegend ? 'flex items-center gap-6' : 'flex justify-center'}>
          <ResponsiveContainer width={showLegend ? '55%' : '100%'} height={220}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <text x="50%" y="48%" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-lg font-bold">
                {total}
              </text>
            </PieChart>
          </ResponsiveContainer>
          {showLegend && (
            <div className="space-y-2">
              {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                  <span className="text-muted-foreground text-xs">{entry.name}:</span>
                  <span className="font-semibold text-xs">{entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyState message="No data available" />
      )}
    </ChartCard>
  );
}

export function NewListingsOverTimeChart({ items, fromDate, toDate }: TimeSeriesProps) {
  const data = buildTimeSeries(items, fromDate, toDate);

  return (
    <ChartCard title="New Listings Over Time" subtitle={fromDate && toDate ? `${format(fromDate, 'MMM d, yyyy')} - ${format(toDate, 'MMM d, yyyy')}` : undefined} delay={0.5}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} name="New Listings" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface OffersChartsProps {
  offers: { status: string; created_at: string }[];
  fromDate?: Date;
  toDate?: Date;
}

export function OffersCharts({ offers, fromDate, toDate }: OffersChartsProps) {
  // By status
  const statusCounts: Record<string, number> = {};
  offers.forEach((o) => {
    const s = o.status || 'pending';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Over time
  const timeData = buildTimeSeries(offers, fromDate, toDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Offers by Status" delay={0.6}>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} name="Offers" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No offers data" />
        )}
      </ChartCard>

      <ChartCard title="Offers Over Time" subtitle={fromDate && toDate ? `${format(fromDate, 'MMM d, yyyy')} - ${format(toDate, 'MMM d, yyyy')}` : undefined} delay={0.65}>
        {timeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ r: 3 }} name="Offers" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="No offers timeline data" />
        )}
      </ChartCard>
    </div>
  );
}

interface LeadsChartsProps {
  leadsByStatus: { name: string; value: number }[];
  leadsByType: { name: string; value: number }[];
  leadsRaw: { created_at: string }[];
  fromDate?: Date;
  toDate?: Date;
}

export function LeadsCharts({ leadsByStatus, leadsByType, leadsRaw, fromDate, toDate }: LeadsChartsProps) {
  const timeData = buildTimeSeries(leadsRaw, fromDate, toDate);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart data={leadsByStatus} title="Leads by Status" delay={0.7} showLegend />
        <DonutChart data={leadsByType} title="Leads by Type" delay={0.75} showLegend={false} />
      </div>

      <ChartCard title="Leads Over Time" subtitle={fromDate && toDate ? `${format(fromDate, 'MMM d, yyyy')} - ${format(toDate, 'MMM d, yyyy')}` : undefined} delay={0.8}>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={timeData}>
            <defs>
              <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={CHART_COLORS.secondary} fill="url(#leadsGradient)" strokeWidth={2} name="Leads" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

// ─── Blog Activity Over Time ───────────────────────────────────────

interface BlogActivityOverTimeProps {
  blogs: { created_at: string }[];
  blogViews: { viewed_at: string }[];
  fromDate?: Date;
  toDate?: Date;
}

export function BlogActivityOverTimeChart({ blogs = [], blogViews = [], fromDate, toDate }: BlogActivityOverTimeProps) {
  const now = toDate || new Date();
  const start = fromDate || subMonths(now, 6);
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(now) });

  const data = months.map((m) => {
    const key = format(m, 'MMM yyyy');
    const newPosts = blogs.filter((b) => format(startOfMonth(parseISO(b.created_at)), 'MMM yyyy') === key).length;
    const views = blogViews.filter((v) => format(startOfMonth(parseISO(v.viewed_at)), 'MMM yyyy') === key).length;
    return { name: key, newPosts, views };
  });

  return (
    <ChartCard
      title="Blog Activity Over Time"
      subtitle={fromDate && toDate ? `${format(fromDate, 'MMM d, yyyy')} - ${format(toDate, 'MMM d, yyyy')}` : undefined}
      delay={0.85}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="newPosts" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ r: 4 }} name="New Posts" />
            <Line type="monotone" dataKey="views" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 4 }} name="Views" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No blog activity data available" />
      )}
    </ChartCard>
  );
}

interface TrafficChartsProps {
  blogViewsData: { title: string; views: number }[];
}

export function TrafficCharts({ blogViewsData }: TrafficChartsProps) {
  return (
    <ChartCard title="Blog Traffic - Top Performing Articles" delay={0.9}>
      {blogViewsData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={blogViewsData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal vertical={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="title" width={160} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [`${value.toLocaleString()} views`, 'Views']}
            />
            <Bar dataKey="views" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No blog view data available yet" />
      )}
    </ChartCard>
  );
}

// ─── Traffic Overview (Monthly Visitors & Page Views) ──────────────

interface TrafficOverviewProps {
  blogViews: { viewed_at: string }[];
  users: { created_at: string }[];
  fromDate?: Date;
  toDate?: Date;
}

export function TrafficOverviewChart({ blogViews, users, fromDate, toDate }: TrafficOverviewProps) {
  const now = toDate || new Date();
  const start = fromDate || subMonths(now, 6);
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(now) });

  const data = months.map((m) => {
    const key = format(m, 'MMM yyyy');
    const pageViews = blogViews.filter((v) => format(startOfMonth(parseISO(v.viewed_at)), 'MMM yyyy') === key).length;
    const visitors = users.filter((u) => format(startOfMonth(parseISO(u.created_at)), 'MMM yyyy') === key).length;
    return { name: key, pageViews, visitors };
  });

  return (
    <ChartCard
      title="Traffic Overview"
      subtitle="Monthly page views & new visitors"
      delay={0.35}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="pageViewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="pageViews" stroke={CHART_COLORS.primary} fill="url(#pageViewsGrad)" strokeWidth={2} name="Page Views" />
            <Area type="monotone" dataKey="visitors" stroke={CHART_COLORS.success} fill="url(#visitorsGrad)" strokeWidth={2} name="New Visitors" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No traffic data available" />
      )}
    </ChartCard>
  );
}

// ─── Revenue Trend (Monthly Sold Property Values) ──────────────────

interface RevenueTrendProps {
  soldListings: { price: number; updated_at: string }[];
  offers: { status: string; created_at: string; offer_amount: number }[];
  fromDate?: Date;
  toDate?: Date;
}

export function RevenueTrendChart({ soldListings, offers, fromDate, toDate }: RevenueTrendProps) {
  const now = toDate || new Date();
  const start = fromDate || subMonths(now, 6);
  const months = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(now) });

  const data = months.map((m) => {
    const key = format(m, 'MMM yyyy');
    // Sum sold listing prices for that month
    const soldValue = soldListings
      .filter((l) => format(startOfMonth(parseISO(l.updated_at)), 'MMM yyyy') === key)
      .reduce((sum, l) => sum + Number(l.price), 0);
    // Sum accepted offer amounts for that month
    const offerValue = offers
      .filter((o) => o.status === 'accepted' && format(startOfMonth(parseISO(o.created_at)), 'MMM yyyy') === key)
      .reduce((sum, o) => sum + Number(o.offer_amount), 0);
    return { name: key, soldValue, offerValue };
  });

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <ChartCard
      title="Revenue Trend"
      subtitle="Monthly property sales & accepted offers value"
      delay={0.4}
    >
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={formatCurrency} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'soldValue' ? 'Sold Listings' : 'Accepted Offers',
              ]}
            />
            <Bar dataKey="soldValue" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} name="Sold Listings" />
            <Bar dataKey="offerValue" fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} name="Accepted Offers" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No revenue data available" />
      )}
    </ChartCard>
  );
}
