import { useEffect, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, MoreVertical, MoreHorizontal, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useTableUtils } from '@/hooks/useTableUtils';
import { TablePagination } from './TablePagination';
import { SortableTableHead } from './SortableTableHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: string;
  views: number;
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
    status: 'draft'
  });
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
      const blogData = {
        ...formData,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };
      if (editingBlog) {
        const {
          error
        } = await supabase.from('blogs').update(blogData).eq('id', editingBlog.id);
        if (error) throw error;
        toast.success('Blog updated successfully');
      } else {
        const {
          error
        } = await supabase.from('blogs').insert([blogData]);
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
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
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
                <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
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
                      <TabsTrigger value="preview">Preview</TabsTrigger>
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
                      <div className="rounded-md border bg-background p-4">
                        {formData.content ? (
                          <BlogContentPreview html={formData.content} />
                        ) : (
                          <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
                        )}
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={value => setFormData({
                  ...formData,
                  status: value
                })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
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
              <SortableTableHead label="Views" sortKey="views" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Published" sortKey="published_at" sortConfig={sortConfig} onSort={handleSort} />
              <SortableTableHead label="Created" sortKey="created_at" sortConfig={sortConfig} onSort={handleSort} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
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