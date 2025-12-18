import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Search, UserX, UserCheck, Eye, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  is_suspended: boolean | null;
  suspended_at: string | null;
  suspension_reason: string | null;
}

export function UsersTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSuspension = async (user: Profile, suspend: boolean, reason?: string) => {
    try {
      const updateData: any = {
        is_suspended: suspend,
        suspended_at: suspend ? new Date().toISOString() : null,
        suspension_reason: suspend ? reason : null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success(suspend ? 'User suspended successfully' : 'User unsuspended successfully');
      fetchUsers();
      setSuspensionReason('');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, phone, location, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="whitespace-nowrap">
          {filteredUsers.length} users
        </Badge>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {user.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">ID-based</span>
                      </p>
                      {user.phone && (
                        <p className="text-sm flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.location ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.location}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_suspended ? (
                      <Badge variant="destructive" className="gap-1">
                        <UserX className="h-3 w-3" />
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        <UserCheck className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {user.is_suspended ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Unsuspend User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to unsuspend {user.full_name || 'this user'}? 
                                They will regain access to all platform features.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => toggleSuspension(user, false)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Unsuspend
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspend User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to suspend {user.full_name || 'this user'}? 
                                They will lose access to platform features.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Textarea
                                placeholder="Reason for suspension (optional)"
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                className="min-h-[80px]"
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSuspensionReason('')}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => toggleSuspension(user, true, suspensionReason)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Suspend User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                  <AvatarImage src={selectedUser.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {selectedUser.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{selectedUser.user_id}</p>
                  {selectedUser.is_suspended ? (
                    <Badge variant="destructive" className="mt-1">Suspended</Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1 bg-green-500/10 text-green-600">Active</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.phone}</span>
                  </div>
                )}
                {selectedUser.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {format(new Date(selectedUser.created_at), 'MMMM d, yyyy')}</span>
                </div>
              </div>

              {selectedUser.bio && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Bio</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.is_suspended && selectedUser.suspension_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <h4 className="text-sm font-medium text-destructive mb-1">Suspension Reason</h4>
                  <p className="text-sm text-destructive/80">{selectedUser.suspension_reason}</p>
                  {selectedUser.suspended_at && (
                    <p className="text-xs text-destructive/60 mt-2">
                      Suspended on {format(new Date(selectedUser.suspended_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}