import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, MailQuestion } from "lucide-react";
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

  return (
    <div className="space-y-6">
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
