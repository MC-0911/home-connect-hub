import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsDateFilter, getDateRangeForPreset } from './analytics/AnalyticsDateFilter';
import { AnalyticsStatsCards } from './analytics/AnalyticsStatsCards';
import { LiveActivityFeed } from './analytics/LiveActivityFeed';
import {
  ActivityOverTimeChart,
  UserGrowthChart,
  ListingsByTypeChart,
  DonutChart,
  NewListingsOverTimeChart,
  OffersCharts,
  LeadsCharts,
  TrafficCharts,
  TrafficOverviewChart,
  RevenueTrendChart,
} from './analytics/AnalyticsCharts';
import { useAnalyticsData } from './analytics/useAnalyticsData';
import type { DateRange, PresetRange } from './analytics/AnalyticsDateFilter';

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [presetRange, setPresetRange] = useState<PresetRange>('6months');

  // Initialize with 6 months default
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    const defaultRange = getDateRangeForPreset('6months');
    setDateRange(defaultRange);
    setInitialized(true);
  }

  const { analytics, loading } = useAnalyticsData(dateRange);

  const handlePresetChange = (preset: PresetRange) => {
    setPresetRange(preset);
    setDateRange(getDateRangeForPreset(preset));
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setPresetRange('custom');
    }
  };

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setPresetRange('all');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
        <Skeleton className="h-[300px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter Bar */}
      <AnalyticsDateFilter
        dateRange={dateRange}
        presetRange={presetRange}
        onPresetChange={handlePresetChange}
        onDateSelect={handleDateSelect}
        onClear={clearDateFilter}
        onExport={() => {
          // Placeholder for CSV export
          console.log('Export analytics');
        }}
      />

      {/* Stats Cards */}
      <AnalyticsStatsCards
        totalUsers={analytics.totalUsers}
        activeUsers={analytics.activeUsers}
        suspendedUsers={analytics.suspendedUsers}
        totalListings={analytics.totalListings}
        activeListings={analytics.activeListings}
        pendingListings={analytics.pendingListings}
        soldListings={analytics.soldListings}
        totalBlogs={analytics.totalBlogs}
        publishedBlogs={analytics.publishedBlogs}
        draftBlogs={analytics.draftBlogs}
        totalLeads={analytics.totalLeads}
        newLeads={analytics.newLeads}
        contactedLeads={analytics.contactedLeads}
        qualifiedLeads={analytics.qualifiedLeads}
        totalBlogViews={analytics.totalBlogViews}
      />

      {/* Live Activity Feed + Activity Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveActivityFeed />
        <ActivityOverTimeChart
          listings={analytics.rawListings}
          users={analytics.rawUsers}
          fromDate={dateRange.from}
          toDate={dateRange.to}
        />
      </div>

      {/* Traffic Overview + Revenue Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficOverviewChart
          blogViews={analytics.rawBlogViews}
          users={analytics.rawUsers}
          fromDate={dateRange.from}
          toDate={dateRange.to}
        />
        <RevenueTrendChart
          soldListings={analytics.rawSoldListings}
          offers={analytics.rawOffers}
          fromDate={dateRange.from}
          toDate={dateRange.to}
        />
      </div>

      {/* User Growth */}
      <UserGrowthChart
        items={analytics.rawUsers}
        fromDate={dateRange.from}
        toDate={dateRange.to}
      />

      {/* Listings by Type + Properties by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ListingsByTypeChart data={analytics.listingsByType} />
        <DonutChart
          data={analytics.propertiesByStatus}
          title="Properties by Status"
          delay={0.45}
          showLegend
        />
      </div>

      {/* New Listings Over Time */}
      <NewListingsOverTimeChart
        items={analytics.rawListings}
        fromDate={dateRange.from}
        toDate={dateRange.to}
      />

      {/* Offers */}
      <OffersCharts
        offers={analytics.rawOffers}
        fromDate={dateRange.from}
        toDate={dateRange.to}
      />

      {/* Leads */}
      <LeadsCharts
        leadsByStatus={analytics.leadsByStatus}
        leadsByType={analytics.leadsByType}
        leadsRaw={analytics.rawLeads}
        fromDate={dateRange.from}
        toDate={dateRange.to}
      />

      {/* Blog Traffic */}
      <TrafficCharts blogViewsData={analytics.blogViewsData} />
    </div>
  );
}
