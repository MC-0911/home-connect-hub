import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  BlogActivityOverTimeChart,
  TrafficOverviewChart,
  RevenueTrendChart,
  TrafficSourcesChart,
} from './analytics/AnalyticsCharts';
import { useAnalyticsData } from './analytics/useAnalyticsData';
import type { DateRange, PresetRange } from './analytics/AnalyticsDateFilter';

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [presetRange, setPresetRange] = useState<PresetRange>('6months');
  const analyticsRef = useRef<HTMLDivElement>(null);

  // Initialize with 6 months default
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    const defaultRange = getDateRangeForPreset('6months');
    setDateRange(defaultRange);
    setInitialized(true);
  }

  const { analytics, loading } = useAnalyticsData(dateRange);

  const handleExport = useCallback(async () => {
    if (!analyticsRef.current) return;
    const toastId = toast.loading('Generating PDF…');
    try {
      const canvas = await html2canvas(analyticsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: analyticsRef.current.scrollWidth,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let yPos = 10;
      let remainingHeight = imgHeight;

      // Multi-page support
      while (remainingHeight > 0) {
        pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
        remainingHeight -= (pdfHeight - 20);
        if (remainingHeight > 0) {
          pdf.addPage();
          yPos = -(imgHeight - remainingHeight - 10);
        }
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`analytics-report-${dateStr}.pdf`);
      toast.success('PDF downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  }, []);

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
        onExport={handleExport}
      />

      <div ref={analyticsRef} className="space-y-6">
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
        <LiveActivityFeed fromDate={dateRange.from} toDate={dateRange.to} />
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

      {/* Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSourcesChart
          deviceTraffic={analytics.deviceTraffic}
          totalSessions={analytics.totalSessions}
        />
        <UserGrowthChart
        items={analytics.rawUsers}
          fromDate={dateRange.from}
          toDate={dateRange.to}
        />
      </div>

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

      {/* Blog Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlogActivityOverTimeChart
          blogs={analytics.rawBlogs}
          blogViews={analytics.rawBlogViews}
          fromDate={dateRange.from}
          toDate={dateRange.to}
        />
        <DonutChart data={analytics.blogsByStatus} title="Blogs by Status" delay={0.9} />
      </div>

      {/* Blog Traffic */}
      <TrafficCharts blogViewsData={analytics.blogViewsData} />
      </div>
    </div>
  );
}
