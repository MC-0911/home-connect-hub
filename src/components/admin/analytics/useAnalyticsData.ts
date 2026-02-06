import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';
import type { DateRange } from './AnalyticsDateFilter';

interface BlogViewData {
  title: string;
  views: number;
  slug: string;
}

export interface AnalyticsData {
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
  listingsByType: { name: string; value: number }[];
  propertiesByStatus: { name: string; value: number }[];
  leadsByStatus: { name: string; value: number }[];
  leadsByType: { name: string; value: number }[];
  blogViewsData: BlogViewData[];
  // Raw arrays for time-series charts
  rawListings: { created_at: string; property_type: string; status: string }[];
  rawUsers: { created_at: string }[];
  rawOffers: { status: string; created_at: string }[];
  rawLeads: { created_at: string; requirement_type: string; status: string }[];
}

const INITIAL: AnalyticsData = {
  totalUsers: 0, activeUsers: 0, suspendedUsers: 0,
  totalListings: 0, activeListings: 0, pendingListings: 0, soldListings: 0,
  totalBlogs: 0, publishedBlogs: 0, draftBlogs: 0,
  totalLeads: 0, newLeads: 0, contactedLeads: 0, qualifiedLeads: 0,
  totalBlogViews: 0,
  listingsByType: [], propertiesByStatus: [], leadsByStatus: [], leadsByType: [],
  blogViewsData: [],
  rawListings: [], rawUsers: [], rawOffers: [], rawLeads: [],
};

export function useAnalyticsData(dateRange: DateRange) {
  const [analytics, setAnalytics] = useState<AnalyticsData>(INITIAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const fromDate = dateRange.from ? startOfDay(dateRange.from).toISOString() : null;
        const toDate = dateRange.to ? endOfDay(dateRange.to).toISOString() : null;

        let usersQ = supabase.from('profiles').select('id, is_suspended, created_at');
        let listingsQ = supabase.from('properties').select('id, status, property_type, created_at');
        let blogsQ = supabase.from('blogs').select('id, title, slug, views, status, created_at');
        let leadsQ = supabase.from('buyer_requirements').select('id, created_at, status, requirement_type');
        let offersQ = supabase.from('property_offers').select('id, status, created_at');

        if (fromDate) {
          usersQ = usersQ.gte('created_at', fromDate);
          listingsQ = listingsQ.gte('created_at', fromDate);
          blogsQ = blogsQ.gte('created_at', fromDate);
          leadsQ = leadsQ.gte('created_at', fromDate);
          offersQ = offersQ.gte('created_at', fromDate);
        }
        if (toDate) {
          usersQ = usersQ.lte('created_at', toDate);
          listingsQ = listingsQ.lte('created_at', toDate);
          blogsQ = blogsQ.lte('created_at', toDate);
          leadsQ = leadsQ.lte('created_at', toDate);
          offersQ = offersQ.lte('created_at', toDate);
        }

        const [usersRes, listingsRes, blogsRes, leadsRes, offersRes] = await Promise.all([
          usersQ, listingsQ, blogsQ, leadsQ, offersQ,
        ]);

        const users = usersRes.data || [];
        const listings = listingsRes.data || [];
        const blogs = blogsRes.data || [];
        const leads = leadsRes.data || [];
        const offers = offersRes.data || [];

        // User breakdown
        const suspendedUsers = users.filter((u) => u.is_suspended === true).length;
        const activeUsers = users.length - suspendedUsers;

        // Listings breakdown
        const activeListings = listings.filter((p) => p.status === 'active').length;
        const pendingListings = listings.filter((p) => p.status === 'under_review').length;
        const soldListings = listings.filter((p) => p.status === 'sold').length;

        // Blogs breakdown
        const publishedBlogs = blogs.filter((b) => b.status === 'published').length;
        const draftBlogs = blogs.filter((b) => b.status === 'draft').length;

        // Leads breakdown
        const newLeads = leads.filter((l) => l.status === 'new').length;
        const contactedLeads = leads.filter((l) => l.status === 'contacted').length;
        const qualifiedLeads = leads.filter((l) => l.status === 'qualified').length;

        // Listings by type
        const typeCounts: Record<string, number> = {};
        listings.forEach((l) => {
          const t = l.property_type;
          typeCounts[t] = (typeCounts[t] || 0) + 1;
        });
        const listingsByType = Object.entries(typeCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), value,
        }));

        // Properties by status
        const statusCounts: Record<string, number> = {};
        listings.forEach((l) => {
          const s = l.status || 'active';
          statusCounts[s] = (statusCounts[s] || 0) + 1;
        });
        const propertiesByStatus = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '), value,
        }));

        // Leads by status
        const lsc: Record<string, number> = {};
        leads.forEach((l) => { const s = l.status || 'new'; lsc[s] = (lsc[s] || 0) + 1; });
        const leadsByStatus = Object.entries(lsc).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), value,
        }));

        // Leads by type
        const ltc: Record<string, number> = {};
        leads.forEach((l) => { const t = l.requirement_type || 'buy'; ltc[t] = (ltc[t] || 0) + 1; });
        const leadsByType = Object.entries(ltc).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), value,
        }));

        // Blog views
        const blogViewsData: BlogViewData[] = blogs
          .map((b) => ({
            title: b.title.length > 25 ? b.title.substring(0, 22) + '...' : b.title,
            views: b.views || 0,
            slug: b.slug,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        const totalBlogViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

        setAnalytics({
          totalUsers: users.length, activeUsers, suspendedUsers,
          totalListings: listings.length, activeListings, pendingListings, soldListings,
          totalBlogs: blogs.length, publishedBlogs, draftBlogs,
          totalLeads: leads.length, newLeads, contactedLeads, qualifiedLeads,
          totalBlogViews,
          listingsByType, propertiesByStatus, leadsByStatus, leadsByType,
          blogViewsData,
          rawListings: listings.map((l) => ({ created_at: l.created_at, property_type: l.property_type, status: l.status || 'active' })),
          rawUsers: users.map((u) => ({ created_at: u.created_at })),
          rawOffers: offers.map((o) => ({ status: o.status, created_at: o.created_at })),
          rawLeads: leads.map((l) => ({ created_at: l.created_at, requirement_type: l.requirement_type, status: l.status || 'new' })),
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  return { analytics, loading };
}
