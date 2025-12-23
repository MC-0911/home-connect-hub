import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Eye, Star, StarOff, MoreHorizontal, MoreVertical, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useTableUtils } from '@/hooks/useTableUtils';
import { TablePagination } from './TablePagination';
import { SortableTableHead } from './SortableTableHead';
interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  property_type: string;
  listing_type: string;
  status: string;
  featured: boolean;
  created_at: string;
}
export function ListingsTable() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const fetchListings = async () => {
    try {
      let query = supabase.from('properties').select('*').order('created_at', {
        ascending: false
      });
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchListings();
  }, []);
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const {
        error
      } = await supabase.from('properties').update({
        featured: !currentFeatured
      }).eq('id', id);
      if (error) throw error;
      toast.success(currentFeatured ? 'Removed from featured' : 'Added to featured');
      fetchListings();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };
  const updateStatus = async (id: string, newStatus: 'active' | 'pending' | 'sold' | 'rented') => {
    try {
      const {
        error
      } = await supabase.from('properties').update({
        status: newStatus
      }).eq('id', id);
      if (error) throw error;
      toast.success('Status updated successfully');
      fetchListings();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredListings.map(l => l.id)));
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
  const handleBulkDelete = async () => {
    try {
      const {
        error
      } = await supabase.from('properties').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} listings deleted successfully`);
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
      fetchListings();
    } catch (error) {
      console.error('Error bulk deleting listings:', error);
      toast.error('Failed to delete listings');
    }
  };
  const handleBulkStatusUpdate = async () => {
    try {
      const {
        error
      } = await supabase.from('properties').update({
        status: bulkStatus as 'active' | 'pending' | 'sold' | 'rented'
      }).in('id', Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} listings updated to ${bulkStatus}`);
      setSelectedIds(new Set());
      setBulkStatusDialogOpen(false);
      setBulkStatus('');
      fetchListings();
    } catch (error) {
      console.error('Error bulk updating listings:', error);
      toast.error('Failed to update listings');
    }
  };
  const handleBulkFeature = async (featured: boolean) => {
    try {
      const {
        error
      } = await supabase.from('properties').update({
        featured
      }).in('id', Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} listings ${featured ? 'featured' : 'unfeatured'} successfully`);
      setSelectedIds(new Set());
      fetchListings();
    } catch (error) {
      console.error('Error bulk featuring listings:', error);
      toast.error('Failed to update listings');
    }
  };
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || listing.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
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
    endIndex
  } = useTableUtils({
    data: filteredListings,
    itemsPerPage: 10,
    defaultSortKey: 'created_at',
    defaultSortDirection: 'desc'
  });
  const allSelected = paginatedData.length > 0 && paginatedData.every(l => selectedIds.has(l.id));
  const someSelected = selectedIds.size > 0;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'sold':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'rented':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg" />)}
    </div>;
  }
  return <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search listings by title or city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && <Badge variant="secondary" className="whitespace-nowrap">
              {selectedIds.size} selected
            </Badge>}
          <Badge variant="secondary" className="whitespace-nowrap">
            {filteredListings.length} listings
          </Badge>
          {someSelected && <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
              setBulkStatus('active');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Set Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
              setBulkStatus('pending');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-yellow-600" />
                  Set Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
              setBulkStatus('sold');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                  Set Sold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
              setBulkStatus('rented');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                  Set Rented
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkFeature(true)}>
                  <Star className="mr-2 h-4 w-4 text-accent" />
                  Feature All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkFeature(false)}>
                  <StarOff className="mr-2 h-4 w-4" />
                  Unfeature All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setBulkDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onCheckedChange={handleSelectAll} />
              </TableHead>
              <SortableTableHead label="Property" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Price" sortKey="price" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Type</TableHead>
              <SortableTableHead label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead>Featured</TableHead>
              <SortableTableHead label="Created" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No listings found
                </TableCell>
              </TableRow> : paginatedData.map(listing => <TableRow key={listing.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox checked={selectedIds.has(listing.id)} onCheckedChange={checked => handleSelectOne(listing.id, checked as boolean)} />
                  </TableCell>
                  <TableCell>
                    <div>
                      
                      <p className="text-sm text-secondary">{listing.city}, {listing.state}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${listing.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {listing.listing_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={listing.status} onValueChange={value => updateStatus(listing.id, value as 'active' | 'pending' | 'sold' | 'rented')}>
                      <SelectTrigger className={`w-[100px] h-8 text-xs border ${getStatusColor(listing.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => toggleFeatured(listing.id, listing.featured)} className="h-8 w-8 p-0">
                      {listing.featured ? <Star className="h-4 w-4 fill-accent text-accent" /> : <StarOff className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(listing.created_at), 'MMM d, yyyy')}
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
                        <DropdownMenuItem asChild>
                          <Link to={`/property/${listing.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleFeatured(listing.id, !listing.featured)} className="flex items-center gap-2 cursor-pointer">
                          {listing.featured ? <>
                              <StarOff className="h-4 w-4" />
                              Unfeature
                            </> : <>
                              <Star className="h-4 w-4" />
                              Feature
                            </>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>

      <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} startIndex={startIndex} endIndex={endIndex} onPageChange={goToPage} />

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Listings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} listings? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Update Dialog */}
      <AlertDialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update {selectedIds.size} Listings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set {selectedIds.size} listings to "{bulkStatus}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkStatus('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkStatusUpdate}>
              Update All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}