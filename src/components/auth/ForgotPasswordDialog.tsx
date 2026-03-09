import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success("Password reset link sent! Check your email.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSent(false);
      setEmail("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {sent ? "Check Your Email" : "Reset Your Password"}
          </DialogTitle>
          <DialogDescription>
            {sent
              ? "We've sent a password reset link to your email address. Please check your inbox and spam folder."
              : "Enter your email address and we'll send you a link to reset your password."}
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-10 h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button variant="gold" className="w-full h-12" type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email?{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-accent hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
