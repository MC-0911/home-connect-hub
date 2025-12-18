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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Eye, Mail, Phone, Download, FileSpreadsheet, FileText } from 'lucide-react';
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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Requirement Type',
      'Property Type',
      'Bedrooms',
      'Bathrooms',
      'Min Budget',
      'Max Budget',
      'Preferred Locations',
      'Must Have Features',
      'Move Timeline',
      'Current Situation',
      'Preferred Contact',
      'Additional Requirements',
      'Status',
      'Submitted Date'
    ];

    const csvData = filteredLeads.map(lead => [
      lead.full_name,
      lead.email,
      lead.phone || '',
      lead.requirement_type,
      lead.property_type,
      lead.min_bedrooms,
      lead.min_bathrooms,
      lead.min_budget || '',
      lead.max_budget || '',
      lead.preferred_locations?.join('; ') || '',
      lead.must_have_features?.join('; ') || '',
      lead.move_timeline || '',
      lead.current_situation || '',
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
    
    toast.success(`Exported ${filteredLeads.length} leads to CSV`);
  };

  const exportToJSON = () => {
    const jsonData = filteredLeads.map(lead => ({
      name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      requirementType: lead.requirement_type,
      propertyType: lead.property_type,
      bedrooms: lead.min_bedrooms,
      bathrooms: lead.min_bathrooms,
      budget: {
        min: lead.min_budget,
        max: lead.max_budget
      },
      preferredLocations: lead.preferred_locations,
      mustHaveFeatures: lead.must_have_features,
      moveTimeline: lead.move_timeline,
      currentSituation: lead.current_situation,
      preferredContact: lead.preferred_contact_method,
      additionalRequirements: lead.additional_requirements,
      status: lead.status || 'new',
      submittedDate: lead.created_at
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    
    toast.success(`Exported ${filteredLeads.length} leads to JSON`);
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

        <div className="flex items-center gap-2">
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
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToJSON} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
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
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/30">
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
    </div>
  );
}