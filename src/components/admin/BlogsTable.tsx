import { useEffect, useState } from 'react';
import { useBlogAutosave } from '@/hooks/useBlogAutosave';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from './RichTextEditor';
import { BlogCoverImagePicker } from './BlogCoverImagePicker';
import { BlogContentPreview } from './BlogContentPreview';
import { BlogPostPreview } from './BlogPostPreview';
import { BlogAuthorSelector } from './BlogAuthorSelector';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, MoreVertical, MoreHorizontal, CheckCircle, Eye, Clock, Timer, Save, Loader2, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { useTableUtils } from '@/hooks/useTableUtils';
import { TablePagination } from './TablePagination';
import { SortableTableHead } from './SortableTableHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Countdown Badge Component
const CountdownBadge = ({ publishAt }: { publishAt: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const publishDate = new Date(publishAt);
      const diffSeconds = differenceInSeconds(publishDate, now);

      if (diffSeconds <= 0) {
        setIsPast(true);
        setTimeLeft('Publishing...');
        return;
      }

      const days = differenceInDays(publishDate, now);
      const hours = differenceInHours(publishDate, now) % 24;
      const minutes = differenceInMinutes(publishDate, now) % 60;
      const seconds = diffSeconds % 60;

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [publishAt]);

  return (
    <Badge 
      variant="outline" 
      className={`text-xs font-normal ${
        isPast 
          ? 'bg-success/10 text-success border-success/30' 
          : 'bg-info/10 text-info border-info/30'
      }`}
    >
      <Timer className="h-3 w-3 mr-1" />
      {timeLeft}
    </Badge>
  );
};

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id?: string | null;
  author_name?: string | null;
  author_avatar_url?: string | null;
  status: string;
  views: number;
  publish_at?: string | null;
  published_at: string | null;
  created_at: string;
}
export function BlogsTable() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author_id: null as string | null,
    author_name: '' as string | null,
    author_avatar_url: '' as string | null,
    publish_at_local: '' as string,
    status: 'draft'
  });

  const { autosaveStatus } = useBlogAutosave(formData, editingBlog?.id ?? null, isDialogOpen);

  const localDateTimeToIso = (localValue: string) => {
    if (!localValue) return null;
    const d = new Date(localValue);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const isoToLocalDateTimeInput = (iso: string | null | undefined) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const fetchBlogs = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('blogs').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBlogs();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const publishAtIso = localDateTimeToIso(formData.publish_at_local);

      const blogData = {
        ...formData,
        author_id: formData.author_id || null,
        author_name: formData.author_name || null,
        author_avatar_url: formData.author_avatar_url || null,
        publish_at: publishAtIso,
        // If publish_at is set, we force scheduled as requested.
        status: publishAtIso ? 'scheduled' : formData.status,
        published_at: (publishAtIso ? null : formData.status === 'published') ? new Date().toISOString() : null
      };

      // Do not send the local-only helper field to DB
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { publish_at_local, ...blogDataForDb } = blogData as any;

      if (editingBlog) {
        const {
          error
        } = await supabase.from('blogs').update(blogDataForDb).eq('id', editingBlog.id);
        if (error) throw error;
        toast.success('Blog updated successfully');
      } else {
        const {
          error
        } = await supabase.from('blogs').insert([blogDataForDb]);
        if (error) throw error;
        toast.success('Blog created successfully');
      }
      setIsDialogOpen(false);
      setEditingBlog(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        author_id: null,
        author_name: '',
        author_avatar_url: '',
        publish_at_local: '',
        status: 'draft'
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    }
  };
  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      content: blog.content,
      cover_image: blog.cover_image || '',
      author_id: blog.author_id ?? null,
      author_name: blog.author_name ?? '',
      author_avatar_url: blog.author_avatar_url ?? '',
      publish_at_local: isoToLocalDateTimeInput(blog.publish_at ?? null),
      status: blog.status
    });
    setIsDialogOpen(true);
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const {
        error
      } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredBlogs.map(b => b.id)));
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
      } = await supabase.from('blogs').delete().in('id', Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} blogs deleted successfully`);
      setSelectedIds(new Set());
      setBulkDeleteDialogOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error bulk deleting blogs:', error);
      toast.error('Failed to delete blogs');
    }
  };
  const handleBulkStatusUpdate = async () => {
    try {
      const updateData: any = {
        status: bulkStatus
      };
      if (bulkStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }
      const {
        error
      } = await supabase.from('blogs').update(updateData).in('id', Array.from(selectedIds));
      if (error) throw error;
      toast.success(`${selectedIds.size} blogs updated to ${bulkStatus}`);
      setSelectedIds(new Set());
      setBulkStatusDialogOpen(false);
      setBulkStatus('');
      fetchBlogs();
    } catch (error) {
      console.error('Error bulk updating blogs:', error);
      toast.error('Failed to update blogs');
    }
  };
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'upcoming') {
      // Upcoming = scheduled posts within next 24 hours
      if (blog.status === 'scheduled' && blog.publish_at) {
        const publishDate = new Date(blog.publish_at);
        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        matchesStatus = publishDate >= now && publishDate <= in24h;
      }
    } else {
      matchesStatus = blog.status === statusFilter;
    }
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
    data: filteredBlogs,
    itemsPerPage: 10,
    defaultSortKey: 'created_at',
    defaultSortDirection: 'desc'
  });
  const allSelected = paginatedData.length > 0 && paginatedData.every(b => selectedIds.has(b.id));
  const someSelected = selectedIds.size > 0;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'scheduled':
        return 'bg-muted text-muted-foreground border-muted';
      case 'archived':
        return 'bg-muted text-muted-foreground border-muted';
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
            <Input placeholder="Search blogs by title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="upcoming">Upcoming (24h)</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          {someSelected && <Badge variant="secondary" className="whitespace-nowrap">
              {selectedIds.size} selected
            </Badge>}
          <Badge variant="secondary" className="whitespace-nowrap">
            {filteredBlogs.length} blogs
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
              setBulkStatus('published');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Publish All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
              setBulkStatus('draft');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4 text-yellow-600" />
                  Set Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
              setBulkStatus('archived');
              setBulkStatusDialogOpen(true);
            }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Archive All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setBulkDeleteDialogOpen(true)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>}

          <Dialog open={isDialogOpen} onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingBlog(null);
            setFormData({
              title: '',
              slug: '',
              excerpt: '',
              content: '',
              cover_image: '',
              author_id: null,
              author_name: '',
              author_avatar_url: '',
              publish_at_local: '',
              status: 'draft'
            });
          }
        }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
                  {editingBlog && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      {autosaveStatus === 'saving' && (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Saving…</span>
                        </>
                      )}
                      {autosaveStatus === 'saved' && (
                        <>
                          <Save className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Autosaved</span>
                        </>
                      )}
                      {autosaveStatus === 'error' && (
                        <>
                          <AlertCircle className="h-3 w-3 text-destructive" />
                          <span className="text-destructive">Save failed</span>
                        </>
                      )}
                      {autosaveStatus === 'idle' && editingBlog && (
                        <>
                          <Save className="h-3 w-3" />
                          <span>Autosave on</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={e => {
                  setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: editingBlog ? formData.slug : generateSlug(e.target.value)
                  });
                }} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={formData.slug} onChange={e => setFormData({
                  ...formData,
                  slug: e.target.value
                })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea id="excerpt" value={formData.excerpt} onChange={e => setFormData({
                  ...formData,
                  excerpt: e.target.value
                })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>

                  <Tabs defaultValue="edit" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Preview
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="mt-3">
                      <RichTextEditor
                        value={formData.content}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            content: value,
                          })
                        }
                        placeholder="Write your blog content here..."
                      />
                    </TabsContent>

                    <TabsContent value="preview" className="mt-3">
                      <div className="rounded-md border bg-background p-6 max-h-[60vh] overflow-y-auto">
                        <BlogPostPreview
                          title={formData.title}
                          content={formData.content}
                          coverImage={formData.cover_image}
                          excerpt={formData.excerpt}
                          authorName={formData.author_name}
                          authorAvatarUrl={formData.author_avatar_url}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <BlogCoverImagePicker
                    value={formData.cover_image}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        cover_image: url,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Author</Label>
                  <BlogAuthorSelector
                    value={{
                      author_id: formData.author_id,
                      author_name: formData.author_name,
                      author_avatar_url: formData.author_avatar_url,
                    }}
                    onChange={(next) =>
                      setFormData({
                        ...formData,
                        author_id: next.author_id,
                        author_name: next.author_name,
                        author_avatar_url: next.author_avatar_url,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publish_at">Publish date & time</Label>
                  <div className="flex gap-2">
                    <Input
                      id="publish_at"
                      type="datetime-local"
                      value={formData.publish_at_local}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publish_at_local: e.target.value,
                          status: e.target.value ? 'scheduled' : (formData.status === 'scheduled' ? 'draft' : formData.status),
                        })
                      }
                      className="flex-1"
                    />
                    {formData.publish_at_local && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            publish_at_local: '',
                            status: 'draft',
                          })
                        }
                      >
                        Cancel Schedule
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Times are saved from your local timezone and stored in UTC. If set, status will be Scheduled.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.publish_at_local ? 'scheduled' : formData.status}
                    onValueChange={value => setFormData({
                    ...formData,
                    status: value
                  })}
                    disabled={!!formData.publish_at_local}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingBlog ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-hidden border-0 rounded-none">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              
              <SortableTableHead label="Title" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Scheduled For" sortKey="publish_at" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Views" sortKey="views" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Published" sortKey="published_at" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Created" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No blogs found
                </TableCell>
              </TableRow> : paginatedData.map(blog => <TableRow key={blog.id} className="hover:bg-muted/30">
                  
                  <TableCell>
                    <div>
                      <p className="font-medium">{blog.title}</p>
                      <p className="text-sm text-muted-foreground">/{blog.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border ${getStatusColor(blog.status)}`}>
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {blog.publish_at ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(new Date(blog.publish_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                        {blog.status === 'scheduled' && (
                          <CountdownBadge publishAt={blog.publish_at} />
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{blog.views.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {blog.published_at ? format(new Date(blog.published_at), 'MMM d, yyyy') : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(blog.created_at), 'MMM d, yyyy')}
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
                        <DropdownMenuItem onClick={() => handleEdit(blog)} className="flex items-center gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(blog.id)} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
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
            <AlertDialogTitle>Delete {selectedIds.size} Blogs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} blogs? This action cannot be undone.
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
            <AlertDialogTitle>Update {selectedIds.size} Blogs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to set {selectedIds.size} blogs to "{bulkStatus}"?
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