import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UsersTable } from '@/components/admin/UsersTable';
import { ListingsTable } from '@/components/admin/ListingsTable';
import { BlogsTable } from '@/components/admin/BlogsTable';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { ServiceBookingsTable } from '@/components/admin/ServiceBookingsTable';
import { PropertyTypesManager } from '@/components/admin/PropertyTypesManager';
import { AdminSidebar, type AdminSection } from '@/components/admin/AdminSidebar';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Crown, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AlertsDropdown } from '@/components/agent/AlertsDropdown';
import { useAuth } from '@/hooks/useAuth';

const sectionMeta: Record<AdminSection, { title: string; description: string; icon: typeof Shield }> = {
  analytics: { title: 'Dashboard Overview', description: 'Platform analytics and performance metrics', icon: Crown },
  users: { title: 'User Management', description: 'View and manage all registered users', icon: Shield },
  listings: { title: 'Listing Management', description: 'Manage all property listings', icon: Shield },
  leads: { title: 'Lead Management', description: 'Track and export buyer leads', icon: Shield },
  bookings: { title: 'Service Bookings', description: 'Manage service booking requests', icon: Shield },
  blogs: { title: 'Blog Management', description: 'Create and manage blog posts', icon: Shield },
  settings: { title: 'Platform Settings', description: 'Manage property types and amenities', icon: Shield },
};

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [activeSection, setActiveSection] = useState<AdminSection>('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="relative">
            <Shield className="w-16 h-16 text-primary" />
            <Crown className="w-6 h-6 text-accent absolute -top-2 -right-2" />
          </div>
          <p className="text-muted-foreground font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 p-8"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-display font-bold">Access Denied</h1>
            <p className="text-muted-foreground max-w-md">
              You don't have permission to access the admin dashboard.
              Contact an administrator if you believe this is an error.
            </p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const meta = sectionMeta[activeSection];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Royal Landmark</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex bg-muted/30">
        <AdminSidebar activeSection={activeSection} onSectionChange={(s) => { setActiveSection(s); setGlobalSearch(''); }} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main content area — shifts based on sidebar */}
        <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}>
          {/* Top Header Bar */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50"
          >
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                {activeSection === 'analytics' ? (
                  <>
                    <h1 className="text-2xl font-display font-bold text-foreground">
                      {getGreeting()}, Admin 👋
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Here's what's happening with your real estate platform</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-display font-bold text-foreground">{meta.title}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties, clients..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="pl-10 w-72 bg-card border-border/60 rounded-full h-11 shadow-sm focus-visible:shadow-md transition-shadow"
                  />
                </div>
                <button className="relative w-11 h-11 rounded-full bg-card border border-border/60 shadow-sm hover:shadow-md flex items-center justify-center transition-all">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-card" />
                </button>
              </div>
            </div>
          </motion.header>

          {/* Content */}
          <div className="p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'analytics' && <AdminAnalytics />}

              {activeSection === 'users' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <UsersTable globalSearch={globalSearch} />
                  </div>
                </div>
              )}

              {activeSection === 'listings' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <ListingsTable globalSearch={globalSearch} />
                  </div>
                </div>
              )}

              {activeSection === 'leads' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <LeadsTable globalSearch={globalSearch} />
                  </div>
                </div>
              )}

              {activeSection === 'bookings' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <ServiceBookingsTable globalSearch={globalSearch} />
                  </div>
                </div>
              )}

              {activeSection === 'blogs' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <BlogsTable globalSearch={globalSearch} />
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <PropertyTypesManager />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Admin Footer */}
          <footer className="px-8 py-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Royal Landmark — Real estate management suite</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              System online
            </span>
          </footer>
        </main>
      </div>
    </>
  );
}
