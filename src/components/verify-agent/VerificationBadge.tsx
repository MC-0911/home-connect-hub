import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { VerificationStatus } from "@/hooks/useAgentVerification";

interface Props {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
  licenseNumber?: string | null;
  className?: string;
}

const SIZE_MAP = {
  sm: { box: "h-6 px-2 text-[10px] gap-1", icon: "h-3 w-3" },
  md: { box: "h-7 px-2.5 text-xs gap-1.5", icon: "h-3.5 w-3.5" },
  lg: { box: "h-9 px-3 text-sm gap-2", icon: "h-4 w-4" },
};

export function VerificationBadge({ status, size = "md", licenseNumber, className }: Props) {
  const sz = SIZE_MAP[size];

  if (status === "verified") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "inline-flex items-center rounded-full font-semibold",
                "bg-gradient-to-r from-emerald-500/15 to-indigo-500/15 text-emerald-600 dark:text-emerald-400",
                "border border-emerald-500/30 shadow-[0_0_15px_-3px_hsl(160_84%_39%/0.4)]",
                "relative overflow-hidden",
                sz.box,
                className,
              )}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2.5s_infinite]" />
              <ShieldCheck className={sz.icon} />
              Verified Agent
            </span>
          </TooltipTrigger>
          {licenseNumber && (
            <TooltipContent>License: {licenseNumber}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (status === "pending" || status === "verifying" || status === "manual_review") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30",
          sz.box,
          className,
        )}
      >
        <ShieldQuestion className={sz.icon} />
        Pending Verification
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium",
          "bg-destructive/10 text-destructive border border-destructive/30",
          sz.box,
          className,
        )}
      >
        <ShieldAlert className={sz.icon} />
        Verification Failed
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-muted text-muted-foreground border border-border",
        sz.box,
        className,
      )}
    >
      <ShieldAlert className={sz.icon} />
      Unverified
    </span>
  );
}
