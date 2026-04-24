import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentVerification } from "@/hooks/useAgentVerification";

const DISMISS_KEY = "unverified-agent-banner-dismissed-at";

export function UnverifiedBanner() {
  const { needsVerification, status, loading } = useAgentVerification();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Reappears every login session (cleared at start of new session)
    const last = sessionStorage.getItem(DISMISS_KEY);
    if (last) setDismissed(true);
  }, []);

  if (loading || !needsVerification || dismissed) return null;

  const message =
    status === "rejected"
      ? "Your verification was rejected. Update your details to try again."
      : status === "manual_review"
        ? "Your application is in manual review. We'll notify you once complete."
        : status === "verifying" || status === "pending"
          ? "Verification in progress. Complete or check status to start listing."
          : "Complete verification to start listing properties.";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 p-5 backdrop-blur"
    >
      <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--accent)/0.15),transparent_50%),radial-gradient(circle_at_80%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Get Verified as a Real Estate Agent
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90">
            <Link to="/verify-agent">
              {status === "none" ? "Start Verification" : "View Status"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <button
            aria-label="Dismiss"
            onClick={() => {
              sessionStorage.setItem(DISMISS_KEY, String(Date.now()));
              setDismissed(true);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-background/50 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
