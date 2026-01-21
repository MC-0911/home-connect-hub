import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Eye, Mail, Phone, Calendar, Clock, MoreVertical, Trash2, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTableUtils } from '@/hooks/useTableUtils';
import { TablePagination } from './TablePagination';
import { SortableTableHead } from './SortableTableHead';
import { Label } from '@/components/ui/label';

interface ServiceBooking {
  id: string;
  service_name: string;
  service_slug: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  user_id: string | null;
}

export function ServiceBookingsTable() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<ServiceBooking | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('service_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching service bookings:', error);
      toast.error('Failed to load service bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Status updated successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateAdminNotes = async () => {
    if (!selectedBooking) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ admin_notes: adminNotes })
        .eq('id', selectedBooking.id);

      if (error) throw error;
      toast.success('Notes saved successfully');
      setRespondDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async () => {
    if (!bookingToDelete) return;
    try {
      const { error } = await supabase
        .from('service_bookings')
        .delete()
        .eq('id', bookingToDelete);

      if (error) throw error;
      toast.success('Booking deleted successfully');
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const uniqueServices = [...new Set(bookings.map(b => b.service_slug))];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      booking.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesService = serviceFilter === 'all' || booking.service_slug === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

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
    data: filteredBookings,
    itemsPerPage: 10,
    defaultSortKey: 'created_at',
    defaultSortDirection: 'desc',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'confirmed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const formatServiceName = (slug: string) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {uniqueServices.map((slug) => (
                <SelectItem key={slug} value={slug}>
                  {formatServiceName(slug)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Badge variant="secondary" className="whitespace-nowrap">
          {filteredBookings.length} bookings
        </Badge>
      </div>

      <div className="overflow-hidden border-0 rounded-none">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <SortableTableHead label="Contact" sortKey="full_name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Service" sortKey="service_name" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Date & Time" sortKey="preferred_date" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Submitted" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No service bookings found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{booking.full_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {booking.email}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {booking.service_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(booking.preferred_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {booking.preferred_time}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value) => updateStatus(booking.id, value)}
                    >
                      <SelectTrigger className={`w-[120px] h-8 text-xs border ${getStatusColor(booking.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDetailsDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedBooking(booking);
                            setAdminNotes(booking.admin_notes || '');
                            setRespondDialogOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Notes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="cursor-pointer text-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="cursor-pointer text-destructive"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setBookingToDelete(booking.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
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
        onPageChange={goToPage}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
      />

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Service</Label>
                  <p className="font-medium">{selectedBooking.service_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Full Name</Label>
                  <p className="font-medium">{selectedBooking.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium">{selectedBooking.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="font-medium">{selectedBooking.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Submitted</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.created_at), 'PPP')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Preferred Date</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.preferred_date), 'PPP')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Preferred Time</Label>
                  <p className="font-medium">{selectedBooking.preferred_time}</p>
                </div>
              </div>

              {selectedBooking.message && (
                <div>
                  <Label className="text-muted-foreground text-xs">Customer Message</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg mt-1">
                    {selectedBooking.message}
                  </p>
                </div>
              )}

              {selectedBooking.admin_notes && (
                <div>
                  <Label className="text-muted-foreground text-xs">Admin Notes</Label>
                  <p className="text-sm bg-primary/5 border border-primary/10 p-3 rounded-lg mt-1">
                    {selectedBooking.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond/Notes Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Notes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notes</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this booking..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateAdminNotes} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
