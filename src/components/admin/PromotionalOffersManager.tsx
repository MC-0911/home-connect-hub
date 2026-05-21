import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface PromotionalOffer {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  rating: number;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  cta_link: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  display_order: number;
}

const emptyOffer = {
  title: '',
  subtitle: '',
  image_url: '',
  rating: 4.5,
  price: 0,
  original_price: 0,
  discount_percentage: 0,
  cta_link: '',
  start_date: '',
  end_date: '',
  is_active: true,
  display_order: 0,
};

export function PromotionalOffersManager() {
  const [offers, setOffers] = useState<PromotionalOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyOffer });
  const [saving, setSaving] = useState(false);

  const fetchOffers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('promotional_offers')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load offers');
    } else {
      setOffers((data || []) as PromotionalOffer[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOffers();
    const channel = supabase
      .channel('admin-promo-offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotional_offers' }, () => fetchOffers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyOffer });
    setDialogOpen(true);
  };

  const openEdit = (o: PromotionalOffer) => {
    setEditingId(o.id);
    setForm({
      title: o.title,
      subtitle: o.subtitle || '',
      image_url: o.image_url,
      rating: Number(o.rating),
      price: Number(o.price),
      original_price: Number(o.original_price || 0),
      discount_percentage: o.discount_percentage,
      cta_link: o.cta_link || '',
      start_date: o.start_date || '',
      end_date: o.end_date || '',
      is_active: o.is_active,
      display_order: o.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast.error('Title and image URL are required');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      rating: Number(form.rating) || 0,
      price: Number(form.price) || 0,
      original_price: Number(form.original_price) || null,
      discount_percentage: Number(form.discount_percentage) || 0,
      cta_link: form.cta_link || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_active: form.is_active,
      display_order: Number(form.display_order) || 0,
    };

    const { error } = editingId
      ? await supabase.from('promotional_offers').update(payload).eq('id', editingId)
      : await supabase.from('promotional_offers').insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? 'Offer updated' : 'Offer created');
      setDialogOpen(false);
      fetchOffers();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('promotional_offers').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Offer deleted'); fetchOffers(); }
  };

  const toggleActive = async (o: PromotionalOffer) => {
    const { error } = await supabase
      .from('promotional_offers')
      .update({ is_active: !o.is_active })
      .eq('id', o.id);
    if (error) toast.error(error.message);
    else fetchOffers();
  };

  const isOfferLive = (o: PromotionalOffer) => {
    if (!o.is_active) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (o.start_date && o.start_date > today) return false;
    if (o.end_date && o.end_date < today) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold">Promotional Offers</h2>
          <p className="text-sm text-muted-foreground">Manage the hotels & rental cards shown on the homepage carousel.</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" /> New Offer
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-2xl">
          No promotional offers yet. Create one to feature it on the homepage.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o) => {
            const live = isOfferLive(o);
            return (
              <div key={o.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm flex flex-col">
                <div className="relative h-40 bg-muted">
                  {o.image_url ? (
                    <img src={o.image_url} alt={o.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {o.discount_percentage > 0 && (
                      <Badge className="bg-accent text-accent-foreground">{o.discount_percentage}% OFF</Badge>
                    )}
                    <Badge variant={live ? 'default' : 'secondary'}>{live ? 'Live' : 'Hidden'}</Badge>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/90 text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-accent text-accent" />
                    {Number(o.rating).toFixed(1)}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div>
                    <h3 className="font-semibold leading-tight">{o.title}</h3>
                    {o.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{o.subtitle}</p>}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">${Number(o.price).toLocaleString()}</span>
                    {o.original_price ? (
                      <span className="text-xs text-muted-foreground line-through">${Number(o.original_price).toLocaleString()}</span>
                    ) : null}
                  </div>
                  {(o.start_date || o.end_date) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {o.start_date ? format(new Date(o.start_date), 'MMM d, yyyy') : '—'}
                      {' → '}
                      {o.end_date ? format(new Date(o.end_date), 'MMM d, yyyy') : '—'}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <Switch checked={o.is_active} onCheckedChange={() => toggleActive(o)} />
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(o)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this offer?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{o.title}" will be permanently removed from the homepage carousel.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(o.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Promotional Offer' : 'New Promotional Offer'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2 space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ramada by Wyndham" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="e.g. 5 star hotel in Katibagiya" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Image URL *</Label>
              <Textarea rows={2} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              {form.image_url && (
                <img src={form.image_url} alt="preview" className="h-32 w-full object-cover rounded-lg border" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Price ($) *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Original Price ($)</Label>
              <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Discount %</Label>
              <Input type="number" min={0} max={100} value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <Input type="number" step={0.1} min={0} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} placeholder="/properties?type=hotel" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive offers are hidden from the homepage.</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
