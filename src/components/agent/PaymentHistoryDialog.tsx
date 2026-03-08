import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, Plus, Trash2, Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface RentPayment {
  id: string;
  tenant_id: string;
  amount: number;
  payment_date: string;
  payment_month: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  monthlyRent: number;
}

const methodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  check: "Check",
  mobile_money: "Mobile Money",
  other: "Other",
};

const monthOptions = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PaymentHistoryDialog({ open, onOpenChange, tenantId, tenantName, monthlyRent }: PaymentHistoryDialogProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = monthOptions[new Date().getMonth()];

  const [form, setForm] = useState({
    amount: String(monthlyRent || ""),
    payment_date: format(new Date(), "yyyy-MM-dd"),
    payment_month: `${currentMonth} ${currentYear}`,
    payment_method: "bank_transfer",
    notes: "",
  });

  const fetchPayments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("rent_payments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false });
    if (!error && data) setPayments(data as RentPayment[]);
    setLoading(false);
  }, [user, tenantId]);

  useEffect(() => {
    if (open) {
      fetchPayments();
      setForm({
        amount: String(monthlyRent || ""),
        payment_date: format(new Date(), "yyyy-MM-dd"),
        payment_month: `${currentMonth} ${currentYear}`,
        payment_method: "bank_transfer",
        notes: "",
      });
      setShowForm(false);
    }
  }, [open, fetchPayments, monthlyRent]);

  const handleRecord = async () => {
    if (!user || !form.amount || !form.payment_month) {
      toast.error("Amount and month are required");
      return;
    }
    const paymentAmount = Number(form.amount);
    const { error } = await supabase.from("rent_payments").insert({
      tenant_id: tenantId,
      user_id: user.id,
      amount: paymentAmount,
      payment_date: form.payment_date,
      payment_month: form.payment_month,
      payment_method: form.payment_method,
      notes: form.notes || null,
    });
    if (error) {
      toast.error("Failed to record payment");
      return;
    }

    // Auto-update tenant status to 'paid' if payment covers current month's rent
    const currentMonthLabel = `${monthOptions[new Date().getMonth()]} ${new Date().getFullYear()}`;
    if (form.payment_month === currentMonthLabel && paymentAmount >= monthlyRent) {
      await supabase.from("tenants").update({ payment_status: "paid" }).eq("id", tenantId);
      toast.success("Payment recorded — status updated to Paid");
    } else {
      toast.success("Payment recorded");
    }

    setShowForm(false);
    fetchPayments();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("rent_payments").delete().eq("id", id);
    if (error) toast.error("Failed to delete payment");
    else {
      toast.success("Payment deleted");
      fetchPayments();
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidMonths = payments.length;

  // Generate month options for the current year
  const monthSelectOptions = monthOptions.map((m) => `${m} ${currentYear}`);
  const prevYearOptions = monthOptions.map((m) => `${m} ${currentYear - 1}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment History — {tenantName}
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold text-primary">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Payments</p>
            <p className="text-lg font-bold text-foreground">{paidMonths}</p>
          </div>
          <div className="rounded-xl bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Monthly Rent</p>
            <p className="text-lg font-bold text-foreground">${monthlyRent.toLocaleString()}</p>
          </div>
        </div>

        {/* Record Payment Form */}
        {showForm ? (
          <div className="border border-border rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Amount ($)</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Payment Date</Label>
                <Input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">For Month</Label>
                <Select value={form.payment_month} onValueChange={(v) => setForm({ ...form, payment_month: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {monthSelectOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    {prevYearOptions.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Notes (optional)</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Partial payment" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRecord} className="flex-1 gap-2" size="sm">
                <CheckCircle2 className="h-4 w-4" /> Record Payment
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowForm(true)} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" /> Record New Payment
          </Button>
        )}

        {/* Payment List */}
        <ScrollArea className="max-h-64">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No payments recorded yet.</p>
          ) : (
            <div className="space-y-0">
              {payments.map((p) => {
                const isPartial = Number(p.amount) < monthlyRent;
                const isOver = Number(p.amount) > monthlyRent;
                return (
                  <div key={p.id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                    <div className={`p-2 rounded-full shrink-0 ${isPartial ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {isPartial ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">${Number(p.amount).toLocaleString()}</p>
                        {isPartial && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Partial</Badge>}
                        {isOver && <Badge className="text-[10px] px-1.5 py-0">Overpaid</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.payment_month} • {methodLabels[p.payment_method] || p.payment_method} • {format(new Date(p.payment_date), "MMM d, yyyy")}
                      </p>
                      {p.notes && <p className="text-xs text-muted-foreground/70 mt-0.5">{p.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
