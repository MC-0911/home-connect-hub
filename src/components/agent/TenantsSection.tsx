import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Mail, Phone, DollarSign, MessageSquare, Pencil, Trash2, Users, CalendarIcon, RotateCcw, Receipt, FileDown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format, differenceInDays, addMonths, addYears } from "date-fns";
import { cn } from "@/lib/utils";
import { PaymentHistoryDialog } from "./PaymentHistoryDialog";

interface Tenant {
  id: string;
  tenant_name: string;
  email: string | null;
  phone: string | null;
  property_name: string | null;
  monthly_rent: number;
  payment_status: string;
  lease_start: string | null;
  lease_end: string | null;
  notes: string | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid: { label: "Paid", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function TenantsSection() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState({
    tenant_name: "",
    email: "",
    phone: "",
    property_name: "",
    monthly_rent: "",
    payment_status: "pending",
    lease_start: "",
    lease_end: "",
    notes: "",
  });

  const fetchTenants = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setTenants(data as Tenant[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTenants();
    if (!user) return;
    const channel = supabase
      .channel("agent-tenants")
      .on("postgres_changes", { event: "*", schema: "public", table: "tenants", filter: `user_id=eq.${user.id}` }, fetchTenants)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const resetForm = () => {
    setForm({ tenant_name: "", email: "", phone: "", property_name: "", monthly_rent: "", payment_status: "pending", lease_start: "", lease_end: "", notes: "" });
    setEditingTenant(null);
  };

  const openEdit = (t: Tenant) => {
    setEditingTenant(t);
    setForm({
      tenant_name: t.tenant_name,
      email: t.email || "",
      phone: t.phone || "",
      property_name: t.property_name || "",
      monthly_rent: String(t.monthly_rent || ""),
      payment_status: t.payment_status,
      lease_start: t.lease_start || "",
      lease_end: t.lease_end || "",
      notes: t.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user || !form.tenant_name.trim()) {
      toast.error("Tenant name is required");
      return;
    }
    const payload = {
      user_id: user.id,
      tenant_name: form.tenant_name,
      email: form.email || null,
      phone: form.phone || null,
      property_name: form.property_name || null,
      monthly_rent: Number(form.monthly_rent) || 0,
      payment_status: form.payment_status,
      lease_start: form.lease_start || null,
      lease_end: form.lease_end || null,
      notes: form.notes || null,
    };

    if (editingTenant) {
      const { error } = await supabase.from("tenants").update(payload).eq("id", editingTenant.id);
      if (error) { toast.error("Failed to update tenant"); return; }
      toast.success("Tenant updated");
    } else {
      const { error } = await supabase.from("tenants").insert(payload);
      if (error) { toast.error("Failed to add tenant"); return; }
      toast.success("Tenant added");
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tenants").delete().eq("id", id);
    if (error) toast.error("Failed to delete tenant");
    else toast.success("Tenant removed");
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("tenants").update({ payment_status: status }).eq("id", id);
    if (error) toast.error("Failed to update status");
  };

  // Lease renewal
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [renewingTenant, setRenewingTenant] = useState<Tenant | null>(null);
  const [newLeaseEnd, setNewLeaseEnd] = useState<Date | undefined>();
  const [newRent, setNewRent] = useState("");

  // Payment history
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentTenant, setPaymentTenant] = useState<Tenant | null>(null);

  const openRenew = (t: Tenant) => {
    setRenewingTenant(t);
    setNewLeaseEnd(t.lease_end ? addYears(new Date(t.lease_end), 1) : addYears(new Date(), 1));
    setNewRent(String(t.monthly_rent || ""));
    setRenewDialogOpen(true);
  };

  const handleRenew = async () => {
    if (!renewingTenant || !newLeaseEnd) {
      toast.error("Please select a new lease end date");
      return;
    }
    const newStart = renewingTenant.lease_end || format(new Date(), "yyyy-MM-dd");
    const { error } = await supabase
      .from("tenants")
      .update({
        lease_start: newStart,
        lease_end: format(newLeaseEnd, "yyyy-MM-dd"),
        monthly_rent: Number(newRent) || renewingTenant.monthly_rent,
      })
      .eq("id", renewingTenant.id);
    if (error) {
      toast.error("Failed to renew lease");
      return;
    }
    toast.success(`Lease renewed for ${renewingTenant.tenant_name}`);
    setRenewDialogOpen(false);
    setRenewingTenant(null);
  };

  const stats = {
    total: tenants.length,
    paid: tenants.filter((t) => t.payment_status === "paid").length,
    pending: tenants.filter((t) => t.payment_status === "pending").length,
    overdue: tenants.filter((t) => t.payment_status === "overdue").length,
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading tenants...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenant Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your tenants and track rent payments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTenant ? "Edit Tenant" : "Add Tenant"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Full Name *</Label>
                <Input value={form.tenant_name} onChange={(e) => setForm({ ...form, tenant_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Property</Label>
                  <Input value={form.property_name} onChange={(e) => setForm({ ...form, property_name: e.target.value })} placeholder="Sunset Villa" />
                </div>
                <div className="grid gap-2">
                  <Label>Monthly Rent ($)</Label>
                  <Input type="number" value={form.monthly_rent} onChange={(e) => setForm({ ...form, monthly_rent: e.target.value })} placeholder="2500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Lease Start</Label>
                  <Input type="date" value={form.lease_start} onChange={(e) => setForm({ ...form, lease_start: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Lease End</Label>
                  <Input type="date" value={form.lease_end} onChange={(e) => setForm({ ...form, lease_end: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Payment Status</Label>
                <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingTenant ? "Save Changes" : "Add Tenant"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tenants", value: stats.total, color: "text-foreground" },
          { label: "Paid", value: stats.paid, color: "text-green-600" },
          { label: "Pending", value: stats.pending, color: "text-amber-600" },
          { label: "Overdue", value: stats.overdue, color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tenant Cards */}
      {tenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No tenants yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Add your first tenant to start managing rent payments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map((tenant, i) => {
            const cfg = statusConfig[tenant.payment_status] || statusConfig.pending;
            return (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    {/* Tenant info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {tenant.tenant_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{tenant.tenant_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{tenant.property_name || "No property"}</p>
                      </div>
                    </div>

                    {/* Contact & rent */}
                    <div className="space-y-1.5 text-sm">
                      {tenant.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tenant.email}</span>
                        </div>
                      )}
                      {tenant.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{tenant.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        <span>Monthly Rent: {formatCurrency(tenant.monthly_rent)}</span>
                      </div>
                    </div>

                    {/* Lease info */}
                    {tenant.lease_end && (
                      <div className="text-xs text-muted-foreground">
                        Lease: {tenant.lease_start ? format(new Date(tenant.lease_start), "MMM d, yyyy") : "N/A"} — {format(new Date(tenant.lease_end), "MMM d, yyyy")}
                        {(() => {
                          const days = differenceInDays(new Date(tenant.lease_end), new Date());
                          if (days < 0) return <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">Expired</Badge>;
                          if (days <= 30) return <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{days}d left</Badge>;
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Select value={tenant.payment_status} onValueChange={(v) => updateStatus(tenant.id, v)}>
                        <SelectTrigger className="w-auto h-auto p-0 border-0 shadow-none">
                          <Badge variant={cfg.variant} className="cursor-pointer">{cfg.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Payment History" onClick={() => { setPaymentTenant(tenant); setPaymentDialogOpen(true); }}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Renew Lease" onClick={() => openRenew(tenant)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(tenant)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(tenant.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Renew Lease Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={(o) => { setRenewDialogOpen(o); if (!o) setRenewingTenant(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Lease — {renewingTenant?.tenant_name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {renewingTenant?.lease_end && (
              <div className="text-sm text-muted-foreground">
                Current lease ends: <span className="font-medium text-foreground">{format(new Date(renewingTenant.lease_end), "PPP")}</span>
              </div>
            )}
            <div className="grid gap-2">
              <Label>New Lease End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newLeaseEnd && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newLeaseEnd ? format(newLeaseEnd, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newLeaseEnd}
                    onSelect={setNewLeaseEnd}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              {[6, 12, 24].map((m) => (
                <Button
                  key={m}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewLeaseEnd(addMonths(renewingTenant?.lease_end ? new Date(renewingTenant.lease_end) : new Date(), m))}
                >
                  +{m}mo
                </Button>
              ))}
            </div>
            <div className="grid gap-2">
              <Label>Updated Monthly Rent ($)</Label>
              <Input type="number" value={newRent} onChange={(e) => setNewRent(e.target.value)} placeholder="Keep current rent" />
            </div>
            <Button onClick={handleRenew} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" /> Renew Lease
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      {paymentTenant && (
        <PaymentHistoryDialog
          open={paymentDialogOpen}
          onOpenChange={(o) => { setPaymentDialogOpen(o); if (!o) setPaymentTenant(null); }}
          tenantId={paymentTenant.id}
          tenantName={paymentTenant.tenant_name}
          monthlyRent={paymentTenant.monthly_rent}
        />
      )}
    </div>
  );
}
