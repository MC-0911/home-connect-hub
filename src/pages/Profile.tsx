import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, FileText, Camera, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(formData);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Profile Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your account details and preferences
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="profile">Profile Details</TabsTrigger>
                <TabsTrigger value="account">Account Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how others see you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-2 border-border">
                          <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-display">
                            {formData.full_name ? getInitials(formData.full_name) : <User className="h-8 w-8" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Label htmlFor="avatar_url">Avatar URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="avatar_url"
                              name="avatar_url"
                              value={formData.avatar_url}
                              onChange={handleChange}
                              placeholder="https://example.com/avatar.jpg"
                              className="max-w-xs"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enter a URL for your profile picture
                          </p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="full_name"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="+1 (555) 000-0000"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="location">Location</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="New York, NY"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Textarea
                              id="bio"
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              placeholder="Tell us a bit about yourself..."
                              className="pl-10 min-h-[100px] resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={saving}>
                          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Display */}
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{user?.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contact support to change your email address
                      </p>
                    </div>

                    {/* Account Actions */}
                    <div className="pt-4 border-t border-border">
                      <h3 className="font-medium text-foreground mb-4">Danger Zone</h3>
                      <Button 
                        variant="destructive" 
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
