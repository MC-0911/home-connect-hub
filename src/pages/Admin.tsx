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
import { ServiceBookingsTable } from '@/components/admin/ServiceBookingsTable';
import { PropertyTypesManager } from '@/components/admin/PropertyTypesManager';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, Users, Home, FileText, MessageSquare, Shield, Settings, Crown, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';
export default function Admin() {
  const navigate = useNavigate();
  const {
    isAdmin,
    loading
  } = useAdmin();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="relative">
            <Shield className="w-16 h-16 text-primary" />
            <Crown className="w-6 h-6 text-accent absolute -top-2 -right-2" />
          </div>
          <p className="text-muted-foreground font-medium">Verifying admin access...</p>
        </div>
      </div>;
  }
  if (!isAdmin) {
    return <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-20">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} className="text-center space-y-4 p-8">
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
      </div>;
  }
  return <>
      <Helmet>
        <title>Admin Dashboard - Royal Landmark</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-24 pb-12 bg-primary-foreground">
          <div className="container mx-auto px-4">
            {/* Admin Header */}
            <motion.div initial={{
            opacity: 0,
            y: -20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Complete control over your platform
                  </p>
                </div>
              </div>
            </motion.div>

            <Tabs defaultValue="analytics" className="space-y-6">
              <TabsList className="bg-card border p-1 h-auto flex-wrap">
                <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="listings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Listings</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Leads</span>
                </TabsTrigger>
                <TabsTrigger value="blogs" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Blogs</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics">
                <AdminAnalytics />
              </TabsContent>

              <TabsContent value="users">
                <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">User Management</h2>
                        <p className="text-sm text-muted-foreground">View and manage all registered users</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <UsersTable />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="listings">
                <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Home className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Listing Management</h2>
                        <p className="text-sm text-muted-foreground">Manage all property listings</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ListingsTable />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="blogs">
                <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Blog Management</h2>
                        <p className="text-sm text-muted-foreground">Create and manage blog posts</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <BlogsTable />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="leads">
                <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Lead Management</h2>
                        <p className="text-sm text-muted-foreground">Track and export buyer leads</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <LeadsTable />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="bookings">
                <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Service Bookings</h2>
                        <p className="text-sm text-muted-foreground">Manage service booking requests</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ServiceBookingsTable />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="settings">
                <motion.div initial={{
                opacity: 0
              }} animate={{
                opacity: 1
              }} className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Platform Settings</h2>
                        <p className="text-sm text-muted-foreground">Manage property types and amenities</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-0 rounded-none shadow-none">
                    <PropertyTypesManager />
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>;
}