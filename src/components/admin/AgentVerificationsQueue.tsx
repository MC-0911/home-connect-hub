import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle, FileText,
  Mail, Phone, MapPin, Hash, CalendarDays, ExternalLink, Loader2, RefreshCw,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  getSignedVerificationUrl,
} from "@/lib/verification/verification-service";

interface VerificationRow {
  id: string;
  user_id: string;
  status: string;
  full_name: string | null;
  phone: string | null;
  agency_name: string | null;
  years_experience: string | null;
  license_number: string;
  state: string;
  license_expiry: string | null;
  license_photo_url: string;
  board_membership_url: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  email?: string | null;
}

type FilterTab = "pending" | "rejected" | "manual_review" | "all";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  verifying: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
  manual_review: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

interface Props {
  globalSearch?: string;
}

export function AgentVerificationsQueue({ globalSearch = "" }: Props) {
  const [rows, setRows] = useState<VerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VerificationRow | null>(null);
  const [rejecting, setRejecting] = useState<VerificationRow | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [boardUrl, setBoardUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_verifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load verifications");
      console.error(error);
    } else {
      // best-effort email lookup via admin RPC (if available)
      let emailMap: Record<string, string> = {};
      try {
        const { data: emails } = await supabase.rpc("get_user_emails");
        if (Array.isArray(emails)) {
          emailMap = Object.fromEntries(
            emails.map((e: { user_id: string; email: string }) => [e.user_id, e.email]),
          );
        }
      } catch {
        /* non-admin or RPC unavailable */
      }
      setRows(
        (data ?? []).map((r) => ({
          ...(r as VerificationRow),
          email: emailMap[(r as VerificationRow).user_id] ?? null,
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-agent-verifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_verifications" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load signed urls when selecting a row
  useEffect(() => {
    setLicenseUrl(null);
    setBoardUrl(null);
    if (!selected) return;
    (async () => {
      try {
        if (selected.license_photo_url) {
          setLicenseUrl(await getSignedVerificationUrl(selected.license_photo_url));
        }
        if (selected.board_membership_url) {
          setBoardUrl(await getSignedVerificationUrl(selected.board_membership_url));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [selected]);

  const counts = useMemo(() => {
    const c = { pending: 0, rejected: 0, manual_review: 0, all: rows.length };
    for (const r of rows) {
      if (r.status === "pending" || r.status === "verifying") c.pending++;
      else if (r.status === "rejected") c.rejected++;
      else if (r.status === "manual_review") c.manual_review++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = (globalSearch || search).trim().toLowerCase();
    return rows
      .filter((r) => {
        if (tab === "pending") return r.status === "pending" || r.status === "verifying";
        if (tab === "rejected") return r.status === "rejected";
        if (tab === "manual_review") return r.status === "manual_review";
        return true;
      })
      .filter((r) => {
        if (!q) return true;
        return [
          r.full_name, r.agency_name, r.license_number, r.state, r.email, r.phone,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      });
  }, [rows, tab, search, globalSearch]);

  const approve = async (row: VerificationRow) => {
    setBusyId(row.id);
    const { error } = await supabase
      .from("agent_verifications")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast.error("Could not approve");
      console.error(error);
      return;
    }
    toast.success(`${row.full_name ?? "Agent"} approved`);
    setSelected(null);
  };

  const submitRejection = async () => {
    if (!rejecting) return;
    if (reason.trim().length < 5) {
      toast.error("Please provide a reason (min 5 characters)");
      return;
    }
    setBusyId(rejecting.id);
    const { error } = await supabase
      .from("agent_verifications")
      .update({
        status: "rejected",
        rejection_reason: reason.trim(),
        verified_at: null,
      })
      .eq("id", rejecting.id);
    setBusyId(null);
    if (error) {
      toast.error("Could not reject");
      console.error(error);
      return;
    }
    toast.success(`${rejecting.full_name ?? "Agent"} rejected`);
    setRejecting(null);
    setReason("");
    setSelected(null);
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge variant="outline" className={`${STATUS_STYLES[status] ?? ""} capitalize`}>
      {status.replace("_", " ")}
    </Badge>
  );

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Pending" value={counts.pending} icon={Clock} tone="amber" onClick={() => setTab("pending")} active={tab === "pending"} />
        <StatCard label="Manual Review" value={counts.manual_review} icon={FileQuestion} tone="indigo" onClick={() => setTab("manual_review")} active={tab === "manual_review"} />
        <StatCard label="Rejected" value={counts.rejected} icon={AlertTriangle} tone="red" onClick={() => setTab("rejected")} active={tab === "rejected"} />
        <StatCard label="Total" value={counts.all} icon={ShieldCheck} tone="emerald" onClick={() => setTab("all")} active={tab === "all"} />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            <TabsTrigger value="manual_review">Manual ({counts.manual_review})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name, license, state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center text-muted-foreground">
            No verifications in this view.
          </div>
        ) : (
          filtered.map((row) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {row.full_name || "Unnamed agent"}
                    </h3>
                    <StatusBadge status={row.status} />
                    {row.agency_name && (
                      <span className="text-xs text-muted-foreground">· {row.agency_name}</span>
                    )}
                  </div>
                  <div className="mt-2 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <Field icon={Hash} label="License" value={row.license_number} />
                    <Field icon={MapPin} label="State" value={row.state} />
                    <Field
                      icon={CalendarDays}
                      label="Expires"
                      value={row.license_expiry ? new Date(row.license_expiry).toLocaleDateString() : "—"}
                    />
                    <Field icon={Phone} label="Phone" value={row.phone || "—"} />
                  </div>
                  {row.status === "rejected" && row.rejection_reason && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                      <span className="font-semibold">Reason:</span> {row.rejection_reason}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
                    <FileText className="mr-1.5 h-4 w-4" /> Review
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => approve(row)}
                    disabled={busyId === row.id || row.status === "verified"}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {busyId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setRejecting(row); setReason(row.rejection_reason ?? ""); }}
                    disabled={busyId === row.id}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              {selected?.full_name || "Agent verification"}
            </DialogTitle>
            <DialogDescription>
              Submitted {selected ? new Date(selected.created_at).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field icon={Hash} label="License Number" value={selected.license_number} stack />
                <Field icon={MapPin} label="State" value={selected.state} stack />
                <Field
                  icon={CalendarDays}
                  label="Expiration"
                  value={selected.license_expiry ? new Date(selected.license_expiry).toLocaleDateString() : "—"}
                  stack
                />
                <Field icon={FileText} label="Agency" value={selected.agency_name || "—"} stack />
                <Field icon={Mail} label="Email" value={selected.email || "—"} stack />
                <Field icon={Phone} label="Phone" value={selected.phone || "—"} stack />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DocPreview label="License document" url={licenseUrl} path={selected.license_photo_url} />
                <DocPreview label="Board membership card" url={boardUrl} path={selected.board_membership_url} />
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                Current status: <StatusBadge status={selected.status} />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            {selected && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => { setRejecting(selected); setReason(selected.rejection_reason ?? ""); }}
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => approve(selected)}
                  disabled={busyId === selected.id}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => { if (!o) { setRejecting(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject verification</DialogTitle>
            <DialogDescription>
              The agent will see this reason and can update their submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g. License number doesn't match state registry, document is expired, etc."
            />
            <p className="text-xs text-muted-foreground">{reason.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejecting(null); setReason(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={submitRejection}
              disabled={busyId === rejecting?.id}
            >
              {busyId === rejecting?.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <XCircle className="mr-1.5 h-4 w-4" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  icon: Icon, label, value, stack,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  stack?: boolean;
}) {
  return (
    <div className={`flex ${stack ? "items-start" : "items-center"} gap-2`}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
      <div className="min-w-0">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
        <p className="truncate text-sm text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

function DocPreview({ label, url, path }: { label: string; url: string | null; path: string | null }) {
  if (!path) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        {label}: not provided
      </div>
    );
  }
  const isPdf = path.toLowerCase().endsWith(".pdf");
  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <div className="overflow-hidden rounded-lg bg-background">
        {url ? (
          isPdf ? (
            <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
              <FileText className="mr-1.5 h-4 w-4" /> PDF document
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="h-32 w-full object-cover" />
          )
        ) : (
          <Skeleton className="h-32 w-full" />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tone, onClick, active,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
  tone: "amber" | "red" | "emerald" | "indigo";
  onClick?: () => void;
  active?: boolean;
}) {
  const toneClass = {
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600",
    red: "from-red-500/20 to-red-500/5 text-red-600",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-600",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border bg-card p-4 text-left transition-all hover:shadow-md ${
        active ? "border-accent ring-2 ring-accent/30" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={`rounded-lg bg-gradient-to-br p-1.5 ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </button>
  );
}
