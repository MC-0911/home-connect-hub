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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Search, UserX, UserCheck, Eye, Mail, Phone, MapPin, Calendar, MoreVertical, MoreHorizontal, Shield, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTableUtils } from '@/hooks/useTableUtils';
import { TablePagination } from './TablePagination';
import { SortableTableHead } from './SortableTableHead';

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
  email?: string | null;
  is_admin?: boolean;
}

export function UsersTable() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSuspendDialogOpen, setBulkSuspendDialogOpen] = useState(false);
  const [bulkUnsuspendDialogOpen, setBulkUnsuspendDialogOpen] = useState(false);
  const [bulkSuspensionReason, setBulkSuspensionReason] = useState('');

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user emails using the admin function
      const { data: emailsData, error: emailsError } = await supabase
        .rpc('get_user_emails');

      // Fetch admin roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      // Create a map of user_id to email
      const emailMap = new Map<string, string>();
      if (!emailsError && emailsData) {
        emailsData.forEach((item: { user_id: string; email: string }) => {
          emailMap.set(item.user_id, item.email);
        });
      }

      // Create a set of admin user_ids
      const adminSet = new Set<string>();
      if (!rolesError && rolesData) {
        rolesData.forEach((item: { user_id: string }) => {
          adminSet.add(item.user_id);
        });
      }

      // Merge emails and admin status into profiles
      const usersWithEmails = (profilesData || []).map(profile => ({
        ...profile,
        email: emailMap.get(profile.user_id) || null,
        is_admin: adminSet.has(profile.user_id),
      }));

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignAdminRole = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.user_id, role: 'admin' });

      if (error) {
        if (error.code === '23505') {
          toast.error('User is already an admin');
        } else {
          throw error;
        }
        return;
      }

      toast.success(`${user.full_name || 'User'} is now an admin`);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast.error('Failed to assign admin role');
    }
  };

  const removeAdminRole = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id)
        .eq('role', 'admin');

      if (error) throw error;

      toast.success(`Admin role removed from ${user.full_name || 'User'}`);
      fetchUsers();
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast.error('Failed to remove admin role');
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map(u => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkSuspend = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspension_reason: bulkSuspensionReason || 'Bulk suspension by admin',
        })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`${selectedIds.size} users suspended successfully`);
      setSelectedIds(new Set());
      setBulkSuspendDialogOpen(false);
      setBulkSuspensionReason('');
      fetchUsers();
    } catch (error) {
      console.error('Error bulk suspending users:', error);
      toast.error('Failed to suspend users');
    }
  };

  const handleBulkUnsuspend = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspended_at: null,
          suspension_reason: null,
        })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`${selectedIds.size} users unsuspended successfully`);
      setSelectedIds(new Set());
      setBulkUnsuspendDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk unsuspending users:', error);
      toast.error('Failed to unsuspend users');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const {
    paginatedData,
    currentPage,
    totalPages,
    sortConfig,
    handleSort,
    goToPage,
    totalItems,
    startIndex,
    endIndex,
  } = useTableUtils({
    data: filteredUsers,
    itemsPerPage: 10,
    defaultSortKey: 'created_at',
    defaultSortDirection: 'desc',
  });

  const allSelected = paginatedData.length > 0 && paginatedData.every(u => selectedIds.has(u.id));
  const someSelected = selectedIds.size > 0;

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
            placeholder="Search users by name, email, location, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSelectAll(!allSelected)}
            className="gap-1.5"
          >
            {allSelected ? (
              <>
                <CheckSquare className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="h-4 w-4" />
                Select All
              </>
            )}
          </Button>
          {someSelected && (
            <Badge variant="secondary" className="whitespace-nowrap bg-primary/10 text-primary">
              {selectedIds.size} selected
            </Badge>
          )}
          <Badge variant="secondary" className="whitespace-nowrap">
            {filteredUsers.length} users
          </Badge>
          {someSelected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setBulkSuspendDialogOpen(true)}
                  className="text-destructive"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setBulkUnsuspendDialogOpen(true)}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Unsuspend Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableTableHead label="User" sortKey="full_name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Email" sortKey="email" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Ph No." sortKey="phone" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Status" sortKey="is_suspended" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Joined" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((user) => (
                <TableRow key={user.id} className={`hover:bg-muted/30 ${selectedIds.has(user.id) ? 'bg-primary/5' : ''}`}>
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
                    <div className="flex items-center gap-1.5 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className={user.email ? '' : 'text-muted-foreground'}>
                        {user.email || 'No email'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {user.phone}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {user.is_admin && (
                        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                          <Shield className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem 
                          onClick={() => handleSelectOne(user.id, !selectedIds.has(user.id))}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {selectedIds.has(user.id) ? (
                            <>
                              <CheckSquare className="h-4 w-4 text-primary" />
                              Deselect
                            </>
                          ) : (
                            <>
                              <Square className="h-4 w-4" />
                              Select
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.is_admin ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer text-amber-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Shield className="h-4 w-4" />
                                Remove Admin Role
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Admin Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove admin privileges from {user.full_name || 'this user'}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeAdminRole(user)}
                                  className="bg-amber-600 hover:bg-amber-700"
                                >
                                  Remove Admin
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer text-primary"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Shield className="h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Assign Admin Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to make {user.full_name || 'this user'} an admin? 
                                  They will have full access to manage the platform.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => assignAdminRole(user)}
                                >
                                  Make Admin
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <DropdownMenuSeparator />
                        {user.is_suspended ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer text-green-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <UserCheck className="h-4 w-4" />
                                Unsuspend User
                              </DropdownMenuItem>
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
                              <DropdownMenuItem 
                                className="flex items-center gap-2 cursor-pointer text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <UserX className="h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={goToPage}
      />

      {/* Bulk Suspend Dialog */}
      <AlertDialog open={bulkSuspendDialogOpen} onOpenChange={setBulkSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {selectedIds.size} Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedIds.size} users? They will lose access to platform features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for suspension (optional)"
              value={bulkSuspensionReason}
              onChange={(e) => setBulkSuspensionReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkSuspensionReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkSuspend}
              className="bg-destructive hover:bg-destructive/90"
            >
              Suspend All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Unsuspend Dialog */}
      <AlertDialog open={bulkUnsuspendDialogOpen} onOpenChange={setBulkUnsuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsuspend {selectedIds.size} Users</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unsuspend {selectedIds.size} users? They will regain access to all platform features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkUnsuspend}
              className="bg-green-600 hover:bg-green-700"
            >
              Unsuspend All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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