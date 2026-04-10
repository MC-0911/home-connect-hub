import { useAgentVerification } from '@/hooks/useAgentVerification';
import { ShieldCheck, ShieldAlert, Clock, ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function VerificationBanner() {
  const { status, loading } = useAgentVerification();

  if (loading) return null;

  if (status === 'verified') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">Verified Agent</span>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-5 h-5 text-amber-600" />
        <span className="text-sm font-medium text-amber-700">Verification Under Review</span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
        <ShieldX className="w-5 h-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">Verification Rejected</span>
        <Button variant="outline" size="sm" asChild className="ml-auto">
          <Link to="/agent-verification">Resubmit</Link>
        </Button>
      </div>
    );
  }

  // status === 'none'
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20">
      <ShieldAlert className="w-5 h-5 text-primary" />
      <span className="text-sm font-medium text-foreground">Complete verification to unlock all features</span>
      <Button variant="gold" size="sm" asChild className="ml-auto">
        <Link to="/agent-verification">Verify Now</Link>
      </Button>
    </div>
  );
}

export function VerifiedBadge() {
  const { status, loading } = useAgentVerification();
  if (loading || status !== 'verified') return null;
  return (
    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1">
      <ShieldCheck className="w-3 h-3" />
      Verified
    </Badge>
  );
}
