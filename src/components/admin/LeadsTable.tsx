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
import { Search, Eye, Mail, Phone } from 'lucide-react';
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

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500';
      case 'contacted': return 'bg-yellow-500/10 text-yellow-500';
      case 'qualified': return 'bg-green-500/10 text-green-500';
      case 'converted': return 'bg-purple-500/10 text-purple-500';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.full_name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <Badge variant="outline" className="mr-1 capitalize">
                        {lead.requirement_type}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {lead.property_type}
                      </Badge>
                      <p className="text-muted-foreground mt-1">
                        {lead.min_bedrooms}+ beds, {lead.min_bathrooms}+ baths
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.min_budget || lead.max_budget ? (
                      <span>
                        ${lead.min_budget?.toLocaleString() || '0'} - ${lead.max_budget?.toLocaleString() || '∞'}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status || 'new'}
                      onValueChange={(value) => updateStatus(lead.id, value)}
                    >
                      <SelectTrigger className={`w-[120px] ${getStatusColor(lead.status)}`}>
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
                    {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Lead Details</DialogTitle>
                        </DialogHeader>
                        {selectedLead && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Contact Information</h4>
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">{selectedLead.full_name}</span>
                                </p>
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  {selectedLead.email}
                                </p>
                                {selectedLead.phone && (
                                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    {selectedLead.phone}
                                  </p>
                                )}
                                <p className="text-sm mt-2">
                                  Preferred: {selectedLead.preferred_contact_method || 'Email'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Property Requirements</h4>
                                <p>Type: <span className="capitalize">{selectedLead.requirement_type}</span></p>
                                <p>Property: <span className="capitalize">{selectedLead.property_type}</span></p>
                                <p>Bedrooms: {selectedLead.min_bedrooms}+</p>
                                <p>Bathrooms: {selectedLead.min_bathrooms}+</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Budget</h4>
                              <p>
                                ${selectedLead.min_budget?.toLocaleString() || '0'} - ${selectedLead.max_budget?.toLocaleString() || 'No limit'}
                              </p>
                            </div>
                            {selectedLead.preferred_locations && selectedLead.preferred_locations.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Preferred Locations</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLead.preferred_locations.map((loc, i) => (
                                    <Badge key={i} variant="secondary">{loc}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedLead.must_have_features && selectedLead.must_have_features.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Must-Have Features</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedLead.must_have_features.map((feature, i) => (
                                    <Badge key={i} variant="outline">{feature}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Timeline</h4>
                                <p>{selectedLead.move_timeline || 'Not specified'}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Current Situation</h4>
                                <p>{selectedLead.current_situation || 'Not specified'}</p>
                              </div>
                            </div>
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
