import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, MailQuestion, FileText, MapPin, Hash, CalendarDays, Paperclip, FileUp, Search, BadgeCheck, XCircle, Radio, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <div className="rounded-2xl border border-border bg-slate-950 p-5 font-mono text-xs text-emerald-300">
            <AnimatePresence>
              {logs.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="leading-relaxed"
                >
                  {l}
                </motion.div>
              ))}
            </AnimatePresence>
            <span className="inline-block h-3 w-2 animate-pulse bg-emerald-400" />
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-destructive" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Verification Failed</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {record.rejection_reason ?? "We couldn't verify your license automatically."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={onRetry} variant="outline">
                  <RefreshCw className="mr-1.5 h-4 w-4" /> Update & Retry
                </Button>
                <Button
                  variant="default"
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
