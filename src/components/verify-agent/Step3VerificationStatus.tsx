import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, MailQuestion, FileText, MapPin, Hash, CalendarDays, Paperclip, FileUp, Search, BadgeCheck, XCircle, Radio, UserCheck, ArrowRight, ChevronDown, ClipboardList, StickyNote, Clock, Camera, ShieldAlert, Image as ImageIcon, Info, ScanLine, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { requestManualReview, verifyLicense } from "@/lib/verification/verification-service";
import { toast } from "sonner";
import type { VerificationRecord } from "@/hooks/useAgentVerification";

interface Props {
  record: VerificationRecord;
  onRetry: () => void;
}

const LOG_LINES = [
  "› Connecting to state license registry…",
  "› Authenticating credentials…",
  "› Validating license number format…",
  "› Cross-checking expiration date…",
  "› Reviewing submitted documents…",
  "› Finalizing verification…",
];

export function Step3VerificationStatus({ record, onRetry }: Props) {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const status = record.status;

  // Animate log lines while verifying
  useEffect(() => {
    if (status !== "verifying") return;
    setLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        if (i >= LOG_LINES.length) return prev;
        const next = [...prev, LOG_LINES[i]];
        i++;
        return next;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [status, record.id]);

  // Auto-trigger verification once when entering verifying state
  useEffect(() => {
    if (status === "verifying" && !submitting) {
      setSubmitting(true);
      verifyLicense(record.id)
        .catch((e) => {
          console.error(e);
          toast.error("Verification failed to start");
        })
        .finally(() => setSubmitting(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.id, status]);

  const fileNameFromPath = (p?: string | null) => {
    if (!p) return null;
    return p.split("/").pop() ?? p;
  };

  const licensePhotoName = fileNameFromPath(record.license_photo_url);
  const boardName = fileNameFromPath(record.board_membership_url);
  const expiry = record.license_expiry
    ? new Date(record.license_expiry).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-muted/30 p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Submitted License Details</h4>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Preview</span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Hash className="mt-0.5 h-4 w-4 text-accent" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">License Number</dt>
              <dd className="truncate font-mono text-sm font-medium text-foreground">
                {record.license_number || "—"}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 text-accent" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">State / Province</dt>
              <dd className="truncate text-sm font-medium text-foreground">
                {record.state || "—"}
              </dd>
            </div>
          </div>
          {expiry && (
            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 h-4 w-4 text-accent" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Expiration</dt>
                <dd className="truncate text-sm font-medium text-foreground">{expiry}</dd>
              </div>
            </div>
          )}
          {record.agency_name && (
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 text-accent" />
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">Agency</dt>
                <dd className="truncate text-sm font-medium text-foreground">{record.agency_name}</dd>
              </div>
            </div>
          )}
        </dl>
        <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
          {licensePhotoName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">License document:</span>
              <span className="truncate">{licensePhotoName}</span>
            </div>
          )}
          {boardName && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-foreground">Board membership card:</span>
              <span className="truncate">{boardName}</span>
            </div>
          )}
          {!licensePhotoName && !boardName && (
            <p className="text-xs text-muted-foreground">No documents attached.</p>
          )}
        </div>
      </motion.div>

      <VerificationTimeline record={record} />

      <ReviewDetailsSection record={record} />

      <AnimatePresence>
        {(status === "verified" || status === "rejected") && (
          <motion.div
            key={`continue-${status}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 180, damping: 20 }}
            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
              status === "verified"
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-destructive/40 bg-destructive/5"
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {status === "verified" ? "All set — your account is ready" : "Let's get this sorted"}
              </p>
              <p className="text-xs text-muted-foreground">
                {status === "verified"
                  ? "Continue to your agent dashboard to start listing properties."
                  : "Continue to update your details and try verification again."}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() =>
                status === "verified" ? navigate("/agent-dashboard") : onRetry()
              }
              className={
                status === "verified"
                  ? "bg-gradient-to-r from-emerald-500 to-indigo-600 text-white hover:opacity-90"
                  : "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90"
              }
            >
              Continue to next step
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {(status === "verifying" || status === "pending") && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-5">
            <div className="relative">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
              <div className="absolute inset-0 -z-10 h-7 w-7 rounded-full bg-indigo-500/30 blur-md" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Verifying your license</p>
              <p className="text-sm text-muted-foreground">This usually takes under a minute.</p>
            </div>
          </div>
        </motion.div>
      )}

      {status === "verified" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-indigo-500/5 to-violet-500/10 p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-indigo-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">You're Verified! 🎉</h3>
          <p className="mt-2 text-muted-foreground">
            Your real estate license has been verified. You can now list properties.
          </p>
          <Button
            className="mt-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90"
            onClick={() => navigate("/agent-dashboard")}
          >
            Go to Dashboard
          </Button>
        </motion.div>
      )}

      {status === "rejected" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-destructive/40 bg-gradient-to-br from-destructive/10 via-rose-500/5 to-orange-500/5 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-foreground">Verification Failed</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {record.rejection_reason ?? "We couldn't verify your license automatically."}
              </p>

              {/* What to fix — tailored to the rejection reason */}
              <TailoredFixChecklist reason={record.rejection_reason} />

              {/* Prominent Retry CTA */}
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
                className="mt-5"
              >
                <Button
                  size="lg"
                  onClick={onRetry}
                  className="group w-full bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-lg shadow-rose-500/30 hover:opacity-95 sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-5 w-5 transition-transform group-hover:rotate-180" />
                  Retry Verification
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  Update your details and resubmit — most retries succeed on the second attempt.
                </p>
              </motion.div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                <span className="text-xs text-muted-foreground">Still stuck?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await requestManualReview(record.id);
                      toast.success("Submitted for manual review");
                    } catch {
                      toast.error("Could not submit for review");
                    }
                  }}
                >
                  <MailQuestion className="mr-1.5 h-4 w-4" /> Request Manual Review
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {status === "manual_review" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6"
        >
          <div className="flex items-start gap-3">
            <MailQuestion className="h-6 w-6 shrink-0 text-amber-500" />
            <div>
              <h3 className="font-semibold text-foreground">Manual Review In Progress</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team is reviewing your application. You'll get an email when we're done — typically within 1–2 business days.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

type StageState = "done" | "current" | "pending" | "failed";

interface Stage {
  key: string;
  label: string;
  description: string;
  icon: typeof FileUp;
  state: StageState;
  timestamp?: string | null;
}

function VerificationTimeline({ record }: { record: VerificationRecord }) {
  const status = record.status;
  const isRejected = status === "rejected";
  const isVerified = status === "verified";
  const isManual = status === "manual_review";
  const isReviewing = status === "verifying" || status === "pending" || isManual;

  const submittedAt = record.created_at;
  const updatedAt = record.updated_at;
  const verifiedAt = record.verified_at;

  const stages: Stage[] = [
    {
      key: "submitted",
      label: "Submitted",
      description: "Your application was received.",
      icon: FileUp,
      state: "done",
      timestamp: submittedAt,
    },
    {
      key: "review",
      label: isManual ? "Manual Review" : "Under Review",
      description: isManual
        ? "Our team is double-checking your documents."
        : "Cross-checking your license with the registry.",
      icon: isManual ? UserCheck : Search,
      state: isReviewing ? "current" : "done",
      timestamp: isReviewing ? null : updatedAt,
    },
    {
      key: "decision",
      label: isVerified ? "Verified" : isRejected ? "Rejected" : "Decision",
      description: isVerified
        ? "You're cleared to list properties."
        : isRejected
          ? record.rejection_reason ?? "Your application could not be verified."
          : "Final outcome will appear here.",
      icon: isVerified ? BadgeCheck : isRejected ? XCircle : CheckCircle2,
      state: isVerified ? "done" : isRejected ? "failed" : "pending",
      timestamp: isVerified ? verifiedAt : isRejected ? updatedAt : null,
    },
  ];

  const tone = (s: StageState) => {
    switch (s) {
      case "done":
        return {
          dot: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-transparent shadow-md shadow-emerald-500/20",
          line: "bg-emerald-500/60",
          label: "text-foreground",
        };
      case "current":
        return {
          dot: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/30 animate-pulse",
          line: "bg-gradient-to-b from-emerald-500/60 to-border",
          label: "text-foreground",
        };
      case "failed":
        return {
          dot: "bg-destructive text-destructive-foreground border-transparent shadow-md shadow-destructive/30",
          line: "bg-destructive/40",
          label: "text-destructive",
        };
      default:
        return {
          dot: "bg-muted text-muted-foreground border-border",
          line: "bg-border",
          label: "text-muted-foreground",
        };
    }
  };

  const fmt = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Verification Timeline</h4>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600">
          <Radio className="h-3 w-3 animate-pulse" /> Live
        </span>
      </div>

      <ol className="relative space-y-5">
        {stages.map((stage, i) => {
          const t = tone(stage.state);
          const Icon = stage.icon;
          const isLast = i === stages.length - 1;
          return (
            <li key={stage.key} className="relative flex gap-4">
              {/* Connector */}
              {!isLast && (
                <span
                  className={`absolute left-[18px] top-9 -bottom-5 w-[2px] rounded-full ${t.line}`}
                  aria-hidden
                />
              )}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 18 }}
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${t.dot}`}
              >
                {stage.state === "current" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </motion.div>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className={`text-sm font-semibold ${t.label}`}>{stage.label}</p>
                  {stage.timestamp && (
                    <span className="text-[11px] text-muted-foreground">{fmt(stage.timestamp)}</span>
                  )}
                  {stage.state === "current" && (
                    <span className="text-[11px] font-medium text-indigo-500">In progress…</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{stage.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ReviewDetailsSection({ record }: { record: VerificationRecord }) {
  const status = record.status;
  const reasons = (record.rejection_reason ?? "")
    .split(/\r?\n|•|;|\u2022/)
    .map((r) => r.trim())
    .filter(Boolean);

  const hasReasons = reasons.length > 0;
  const hasNotes = !!record.admin_notes?.trim();
  const isTerminalReview =
    status === "rejected" || status === "manual_review" || status === "verified";

  // Only show when there's something meaningful to reveal
  if (!hasReasons && !hasNotes && status !== "rejected") return null;

  const tone =
    status === "rejected"
      ? {
          border: "border-destructive/40",
          bg: "bg-destructive/5",
          icon: "text-destructive",
          chip: "bg-destructive/10 text-destructive border-destructive/30",
          title: "Review details",
          subtitle: hasReasons
            ? `${reasons.length} issue${reasons.length > 1 ? "s" : ""} flagged by reviewer`
            : "Reviewer feedback available",
        }
      : status === "manual_review"
        ? {
            border: "border-amber-500/40",
            bg: "bg-amber-500/5",
            icon: "text-amber-500",
            chip: "bg-amber-500/10 text-amber-600 border-amber-500/30",
            title: "Review details",
            subtitle: "Notes from our review team",
          }
        : {
            border: "border-emerald-500/30",
            bg: "bg-emerald-500/5",
            icon: "text-emerald-600",
            chip: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
            title: "Review details",
            subtitle: "Reviewer notes from your verification",
          };

  const updatedAt = record.updated_at
    ? new Date(record.updated_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <Collapsible defaultOpen={status === "rejected"}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`overflow-hidden rounded-2xl border ${tone.border} ${tone.bg}`}
      >
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-foreground/[0.02]">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${tone.chip}`}
            >
              <ClipboardList className={`h-4 w-4 ${tone.icon}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{tone.title}</p>
              <p className="truncate text-xs text-muted-foreground">{tone.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isTerminalReview && updatedAt && (
              <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
                <Clock className="h-3 w-3" />
                {updatedAt}
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-4">
            {hasReasons && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <AlertTriangle className={`h-3.5 w-3.5 ${tone.icon}`} />
                  Rejection reason{reasons.length > 1 ? "s" : ""}
                </div>
                <ul className="space-y-2">
                  {reasons.map((reason, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/60 p-3"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold ${tone.chip}`}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">{reason}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {hasNotes && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5 text-accent" />
                  Reviewer notes
                </div>
                <p className="whitespace-pre-wrap rounded-xl border border-border/60 bg-background/60 p-3 text-sm leading-relaxed text-foreground">
                  {record.admin_notes}
                </p>
              </div>
            )}

            {!hasReasons && !hasNotes && status === "rejected" && (
              <p className="text-sm text-muted-foreground">
                No specific reason was provided. Please request a manual review for more information.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
}

// ── Rejection-reason → tailored checklist ─────────────────────────────────────

type FixCategory =
  | "license_number"
  | "state_mismatch"
  | "expired"
  | "name_mismatch"
  | "agency"
  | "photo_quality"
  | "photo_missing"
  | "photo_tampered"
  | "document_unreadable"
  | "board_membership"
  | "not_found"
  | "duplicate";

interface FixItem {
  id: FixCategory;
  icon: typeof Hash;
  title: string;
  detail: string;
  priority: number;
}

const FIX_LIBRARY: Record<FixCategory, Omit<FixItem, "id">> = {
  license_number: {
    icon: Hash,
    title: "Re-enter your license number",
    detail:
      "Check for typos, extra spaces, or missing prefixes — it must match the state registry character-for-character.",
    priority: 1,
  },
  state_mismatch: {
    icon: MapPin,
    title: "Verify the issuing state / province",
    detail:
      "Make sure the state you selected is the one that issued the license shown on your document.",
    priority: 1,
  },
  expired: {
    icon: CalendarDays,
    title: "Renew or update your license expiration",
    detail:
      "Your license appears expired. Upload your renewed license and update the expiration date to a future date.",
    priority: 0,
  },
  name_mismatch: {
    icon: User,
    title: "Match your full legal name",
    detail:
      "The name on your profile must exactly match the name printed on the license document.",
    priority: 1,
  },
  agency: {
    icon: Building2,
    title: "Update your agency / brokerage details",
    detail:
      "Provide the registered brokerage name as it appears on your license records.",
    priority: 2,
  },
  photo_quality: {
    icon: Camera,
    title: "Re-upload a higher-quality photo",
    detail:
      "Take the photo in good lighting with all four corners visible. Avoid glare, blur, and shadows.",
    priority: 1,
  },
  photo_missing: {
    icon: ImageIcon,
    title: "Upload your license photo",
    detail:
      "We didn't receive a valid license image. Please attach a clear scan or photo of the front of your license.",
    priority: 0,
  },
  photo_tampered: {
    icon: ShieldAlert,
    title: "Submit an unedited original",
    detail:
      "The image looks edited. Please upload a clean, unmodified photo or scan straight from the source.",
    priority: 0,
  },
  document_unreadable: {
    icon: ScanLine,
    title: "Make sure the document is readable",
    detail:
      "License number, expiration date, and your name must all be clearly legible without cropping.",
    priority: 1,
  },
  board_membership: {
    icon: Paperclip,
    title: "Re-upload your board membership card",
    detail:
      "Attach a current, legible copy of your real estate board / association membership card.",
    priority: 2,
  },
  not_found: {
    icon: Search,
    title: "Confirm your license is active",
    detail:
      "We couldn't find a matching record in the registry. Double-check the number and state, or request a manual review.",
    priority: 1,
  },
  duplicate: {
    icon: Info,
    title: "License already linked to another account",
    detail:
      "This license appears to be in use elsewhere. Contact support if this is an error.",
    priority: 2,
  },
};

function parseRejectionReason(reason: string | null | undefined): FixCategory[] {
  if (!reason) return [];
  const r = reason.toLowerCase();
  const hits: FixCategory[] = [];
  const add = (c: FixCategory) => {
    if (!hits.includes(c)) hits.push(c);
  };

  if (/\bexpir(e|ed|ation|y)\b|\bout of date\b|\blapsed\b/.test(r)) add("expired");
  if (/\bnot found\b|\bno match\b|\bcouldn'?t (be )?(find|verify)\b|\bnot in (the )?(state )?registry\b|\bregistry\b.*\b(no|not)\b/.test(r))
    add("not_found");
  if (/\blicense (number|no\.?|#)\b|\binvalid (license )?number\b|\bwrong number\b|\btypo\b/.test(r))
    add("license_number");
  if (/\bstate\b|\bjurisdiction\b|\bprovince\b|\bissuing (state|authority)\b/.test(r))
    add("state_mismatch");
  if (/\bname (does ?n[o']?t match|mismatch)\b|\bfull name\b|\blegal name\b/.test(r))
    add("name_mismatch");
  if (/\bagency\b|\bbrokerage\b|\bbroker\b|\bfirm\b/.test(r)) add("agency");
  if (/\b(blurry|blurred|low.?quality|low.?res|unclear|dark|glare|cropped|cut.?off|cut off)\b/.test(r))
    add("photo_quality");
  if (/\b(missing|no) (photo|image|document|upload)\b|\bnot (uploaded|provided)\b|\bno file\b/.test(r))
    add("photo_missing");
  if (/\b(edited|tampered|altered|photoshopped|modified|fake|forged)\b/.test(r))
    add("photo_tampered");
  if (/\b(unreadable|illegible|can'?t read|cannot read)\b/.test(r))
    add("document_unreadable");
  if (/\bboard\b|\bmembership\b|\bassociation\b/.test(r)) add("board_membership");
  if (/\bduplicate\b|\balready (in use|linked|registered)\b|\banother account\b/.test(r))
    add("duplicate");

  return hits;
}

const DEFAULT_FIXES: FixCategory[] = [
  "license_number",
  "photo_quality",
  "expired",
];

function TailoredFixChecklist({ reason }: { reason: string | null | undefined }) {
  const detected = parseRejectionReason(reason);
  const isTailored = detected.length > 0;
  const categories = (isTailored ? detected : DEFAULT_FIXES)
    .slice()
    .sort((a, b) => FIX_LIBRARY[a].priority - FIX_LIBRARY[b].priority);

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What to fix before retrying
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
            isTailored
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {isTailored ? (
            <>
              <ShieldAlert className="h-3 w-3" />
              Tailored to your rejection
            </>
          ) : (
            <>
              <Info className="h-3 w-3" />
              General checklist
            </>
          )}
        </span>
      </div>

      <ul className="space-y-2.5">
        {categories.map((id, i) => {
          const item = FIX_LIBRARY[id];
          const Icon = item.icon;
          return (
            <motion.li
              key={id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/60 p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>

      {!isTailored && reason && (
        <p className="mt-3 text-[11px] italic text-muted-foreground">
          We couldn't auto-categorize the rejection note — showing general guidance instead.
        </p>
      )}
    </div>
  );
}
