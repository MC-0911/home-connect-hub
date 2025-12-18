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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Eye, Mail, Phone, Download, FileSpreadsheet, FileText, MoreHorizontal, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  requirement_type: string;
  property_type: string;
  min_bedrooms: number;
  min_bathrooms: number;
  preferred_locations: string[] | null;
  min_budget: number | null;
  max_budget: number | null;
  must_have_features: string[] | null;
  move_timeline: string | null;
  current_situation: string | null;
  preferred_contact_method: string | null;
  additional_requirements: string | null;
  status: string | null;
  created_at: string;
}

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('buyer_requirements')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Status updated successfully');
      fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
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
      const { error } = await supabase
        .from('buyer_requirements')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`${selectedIds.size} leads deleted successfully`);
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
      fetchLeads();
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      toast.error('Failed to delete leads');
    }
  };

  const handleBulkStatusUpdate = async () => {
    try {
      const { error } = await supabase
        .from('buyer_requirements')
        .update({ status: bulkStatus })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      toast.success(`${selectedIds.size} leads updated to ${bulkStatus}`);
      setSelectedIds(new Set());
      setBulkStatusDialogOpen(false);
      setBulkStatus('');
      fetchLeads();
    } catch (error) {
      console.error('Error bulk updating leads:', error);
      toast.error('Failed to update leads');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const allSelected = filteredLeads.length > 0 && filteredLeads.every(l => selectedIds.has(l.id));
  const someSelected = selectedIds.size > 0;

  const exportToCSV = () => {
    const dataToExport = someSelected 
      ? filteredLeads.filter(l => selectedIds.has(l.id))
      : filteredLeads;

    const headers = [
      'Name', 'Email', 'Phone', 'Requirement Type', 'Property Type',
      'Bedrooms', 'Bathrooms', 'Min Budget', 'Max Budget',
      'Preferred Locations', 'Must Have Features', 'Move Timeline',
      'Current Situation', 'Preferred Contact', 'Additional Requirements',
      'Status', 'Submitted Date'
    ];

    const csvData = dataToExport.map(lead => [
      lead.full_name, lead.email, lead.phone || '',
      lead.requirement_type, lead.property_type,
      lead.min_bedrooms, lead.min_bathrooms,
      lead.min_budget || '', lead.max_budget || '',
      lead.preferred_locations?.join('; ') || '',
      lead.must_have_features?.join('; ') || '',
      lead.move_timeline || '', lead.current_situation || '',
      lead.preferred_contact_method || '',
      lead.additional_requirements || '',
      lead.status || 'new',
      format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success(`Exported ${dataToExport.length} leads to CSV`);
  };

  const exportToJSON = () => {
    const dataToExport = someSelected 
      ? filteredLeads.filter(l => selectedIds.has(l.id))
      : filteredLeads;

    const jsonData = dataToExport.map(lead => ({
      name: lead.full_name, email: lead.email, phone: lead.phone,
      requirementType: lead.requirement_type, propertyType: lead.property_type,
      bedrooms: lead.min_bedrooms, bathrooms: lead.min_bathrooms,
      budget: { min: lead.min_budget, max: lead.max_budget },
      preferredLocations: lead.preferred_locations,
      mustHaveFeatures: lead.must_have_features,
      moveTimeline: lead.move_timeline, currentSituation: lead.current_situation,
      preferredContact: lead.preferred_contact_method,
      additionalRequirements: lead.additional_requirements,
      status: lead.status || 'new', submittedDate: lead.created_at
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    
    toast.success(`Exported ${dataToExport.length} leads to JSON`);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'contacted': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'qualified': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'converted': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'closed': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
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
              placeholder="Search leads by name, email, or phone..."
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {someSelected && (
            <Badge variant="secondary" className="whitespace-nowrap">
              {selectedIds.size} selected
            </Badge>
          )}
          <Badge variant="secondary" className="whitespace-nowrap">
            {filteredLeads.length} leads
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                Export {someSelected ? 'Selected' : 'All'} as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Export {someSelected ? 'Selected' : 'All'} as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {someSelected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setBulkStatus('new'); setBulkStatusDialogOpen(true); }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                  Set New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkStatus('contacted'); setBulkStatusDialogOpen(true); }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-yellow-600" />
                  Set Contacted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkStatus('qualified'); setBulkStatusDialogOpen(true); }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Set Qualified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkStatus('converted'); setBulkStatusDialogOpen(true); }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                  Set Converted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setBulkStatus('closed'); setBulkStatusDialogOpen(true); }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Set Closed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
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
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(lead.id)}
                      onCheckedChange={(checked) => handleSelectOne(lead.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{lead.full_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </p>
                      {lead.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="capitalize text-xs">
                          {lead.requirement_type}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-xs">
                          {lead.property_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lead.min_bedrooms}+ beds, {lead.min_bathrooms}+ baths
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.min_budget || lead.max_budget ? (
                      <span className="text-sm font-medium">
                        ${lead.min_budget?.toLocaleString() || '0'} - ${lead.max_budget?.toLocaleString() || '∞'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status || 'new'}
                      onValueChange={(value) => updateStatus(lead.id, value)}
                    >
                      <SelectTrigger className={`w-[120px] h-8 text-xs border ${getStatusColor(lead.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedLead(lead)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Lead Details</DialogTitle>
                        </DialogHeader>
                        {selectedLead && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                                  <div className="space-y-2">
                                    <p className="font-medium text-lg">{selectedLead.full_name}</p>
                                    <p className="flex items-center gap-2 text-sm">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      {selectedLead.email}
                                    </p>
                                    {selectedLead.phone && (
                                      <p className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {selectedLead.phone}
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                      Preferred: {selectedLead.preferred_contact_method || 'Email'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Property Requirements</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>Type: <span className="font-medium capitalize">{selectedLead.requirement_type}</span></p>
                                    <p>Property: <span className="font-medium capitalize">{selectedLead.property_type}</span></p>
                                    <p>Bedrooms: <span className="font-medium">{selectedLead.min_bedrooms}+</span></p>
                                    <p>Bathrooms: <span className="font-medium">{selectedLead.min_bathrooms}+</span></p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 rounded-lg bg-muted/50">
                              <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Budget</h4>
                              <p className="text-lg font-medium">
                                ${selectedLead.min_budget?.toLocaleString() || '0'} - ${selectedLead.max_budget?.toLocaleString() || 'No limit'}
                              </p>
                            </div>
                            
                            {selectedLead.preferred_locations && selectedLead.preferred_locations.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Preferred Locations</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLead.preferred_locations.map((loc, i) => (
                                    <Badge key={i} variant="secondary">{loc}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {selectedLead.must_have_features && selectedLead.must_have_features.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Must-Have Features</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLead.must_have_features.map((feature, i) => (
                                    <Badge key={i} variant="outline">{feature}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1 text-sm text-muted-foreground uppercase tracking-wide">Timeline</h4>
                                <p className="text-sm">{selectedLead.move_timeline || 'Not specified'}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1 text-sm text-muted-foreground uppercase tracking-wide">Current Situation</h4>
                                <p className="text-sm">{selectedLead.current_situation || 'Not specified'}</p>
                              </div>
                            </div>

                            {selectedLead.additional_requirements && (
                              <div>
                                <h4 className="font-semibold mb-1 text-sm text-muted-foreground uppercase tracking-wide">Additional Requirements</h4>
                                <p className="text-sm text-muted-foreground">{selectedLead.additional_requirements}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Leads</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} leads? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Status Update Dialog */}
      <AlertDialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update {selectedIds.size} Leads</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set {selectedIds.size} leads to "{bulkStatus}"?
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
    </div>
  );
}