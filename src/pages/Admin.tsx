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
import { Shield, Crown, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Royal Landmark</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex bg-muted/30">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Main content area — shifts based on sidebar */}
        <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}>
          {/* Top Header Bar */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50"
          >
            <div className="flex items-center justify-between px-8 py-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">{meta.title}</h1>
                <p className="text-sm text-muted-foreground">{meta.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 w-64 bg-muted/50 border-border/50 rounded-xl h-10"
                  />
                </div>
                <button className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
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
                    <UsersTable />
                  </div>
                </div>
              )}

              {activeSection === 'listings' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <ListingsTable />
                  </div>
                </div>
              )}

              {activeSection === 'leads' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <LeadsTable />
                  </div>
                </div>
              )}

              {activeSection === 'bookings' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <ServiceBookingsTable />
                  </div>
                </div>
              )}

              {activeSection === 'blogs' && (
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <BlogsTable />
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
        </main>
      </div>
    </>
  );
}
