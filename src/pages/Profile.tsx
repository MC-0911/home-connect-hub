import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, FileText, Loader2, Upload, Pencil, Trash2, MoreVertical, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { ImageCropper } from '@/components/profile/ImageCropper';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setCropperOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    if (!user) return;
    setUploading(true);
    try {
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImage, {
          upsert: true,
          contentType: 'image/jpeg'
        });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      setFormData(prev => ({ ...prev, avatar_url: urlWithCacheBuster }));
      await updateProfile({ avatar_url: urlWithCacheBuster });
      setCropperOpen(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCropperClose = () => {
    setCropperOpen(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const filePath = `${user.id}/avatar.jpg`;
      const { error: deleteError } = await supabase.storage.from('avatars').remove([filePath]);
      if (deleteError) throw deleteError;

      setFormData(prev => ({ ...prev, avatar_url: '' }));
      await updateProfile({ avatar_url: null });
      setDeleteDialogOpen(false);
      toast({
        title: "Profile picture deleted",
        description: "Your profile picture has been removed successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting avatar:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-display text-2xl">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 border-2 border-border">
                        <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
                          {formData.full_name ? getInitials(formData.full_name) : <User className="h-10 w-10" />}
                        </AvatarFallback>
                      </Avatar>
                      {(uploading || deleting) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                      {formData.avatar_url && !uploading && !deleting && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Change Photo
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialogOpen(true)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Photo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading || deleting}>
                        <Upload className="mr-2 h-4 w-4" />
                        {formData.avatar_url ? 'Change' : 'Upload'} Photo
                      </Button>
                      {formData.avatar_url && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setDeleteDialogOpen(true)} 
                          disabled={uploading || deleting}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                  </div>

                  {/* Full Name */}
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

                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        value={user?.email || ''} 
                        disabled 
                        className="pl-10 bg-muted cursor-not-allowed" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
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

                  {/* Save Button */}
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>

                  {/* Sign Out */}
                  <div className="pt-4 border-t border-border">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />

      <ImageCropper 
        imageSrc={selectedImage} 
        open={cropperOpen} 
        onClose={handleCropperClose} 
        onCropComplete={handleCropComplete} 
        isUploading={uploading} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile Picture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your profile picture? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;