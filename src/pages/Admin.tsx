import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { UsersTable } from '@/components/admin/UsersTable';
import { ListingsTable } from '@/components/admin/ListingsTable';
import { BlogsTable } from '@/components/admin/BlogsTable';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, Users, Home, FileText, MessageSquare, Shield } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center space-y-4">
            <Shield className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact an administrator if you believe this is an error.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Royal Landmark</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your platform's users, listings, blogs, and leads
              </p>
            </div>

            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="bg-card border">
                <TabsTrigger value="analytics" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="listings" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Listings</span>
                </TabsTrigger>
                <TabsTrigger value="blogs" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Blogs</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Leads</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                <AdminAnalytics />
              </TabsContent>

              <TabsContent value="users">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">User Management</h2>
                  <UsersTable />
                </div>
              </TabsContent>

              <TabsContent value="listings">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Listing Management</h2>
                  <ListingsTable />
                </div>
              </TabsContent>

              <TabsContent value="blogs">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Blog Management</h2>
                  <BlogsTable />
                </div>
              </TabsContent>

              <TabsContent value="leads">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Lead Management</h2>
                  <LeadsTable />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
