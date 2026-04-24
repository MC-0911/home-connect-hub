import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export type VerificationStatus =
  | "none"
  | "pending"
  | "verifying"
  | "verified"
  | "rejected"
  | "manual_review";

export interface VerificationRecord {
  id: string;
  status: VerificationStatus;
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
  verified_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAgentVerification() {
  const { user } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();
  const [record, setRecord] = useState<VerificationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const isAgent = hasRole("agent");

  const checkStatus = useCallback(async () => {
    if (!user) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_verifications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      console.error("Verification fetch error:", error);
    }
    setRecord((data as unknown as VerificationRecord) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Realtime sync
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`agent-verification-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_verifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => checkStatus(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkStatus]);

  const status: VerificationStatus = record
    ? (record.status as VerificationStatus)
    : "none";
  const isVerified = status === "verified";
  const isPending =
    status === "pending" || status === "verifying" || status === "manual_review";
  const isRejected = status === "rejected";
  const needsVerification =
    isAgent && !isVerified && !roleLoading && !loading;

  return {
    record,
    status,
    loading: loading || roleLoading,
    isAgent,
    isVerified,
    isPending,
    isRejected,
    needsVerification,
    checkStatus,
  };
}
