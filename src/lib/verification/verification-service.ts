import { supabase } from "@/integrations/supabase/client";

export interface SubmitVerificationInput {
  user_id: string;
  full_name: string;
  phone: string;
  agency_name: string;
  years_experience?: string;
  license_number: string;
  state: string;
  license_expiry: string; // ISO date
  license_photo_url: string;
  board_membership_url?: string | null;
}

export const VERIFICATION_BUCKET = "agent-verifications";

/**
 * Upload a license-related file to Supabase Storage under {userId}/{kind}.{ext}.
 * Returns the storage path (use createSignedUrl to render).
 */
export async function uploadVerificationFile(
  userId: string,
  file: File,
  kind: "license" | "board",
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true });
  if (error) throw error;
  return path;
}

/** Generate a temporary signed URL to view a private verification file. */
export async function getSignedVerificationUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(VERIFICATION_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

/** Insert or update a verification record (one per user). */
export async function submitVerification(
  input: SubmitVerificationInput,
): Promise<{ success: boolean; verificationId: string }> {
  const { data, error } = await supabase
    .from("agent_verifications")
    .upsert(
      {
        user_id: input.user_id,
        full_name: input.full_name,
        phone: input.phone,
        agency_name: input.agency_name,
        years_experience: input.years_experience ?? null,
        license_number: input.license_number,
        state: input.state,
        license_expiry: input.license_expiry,
        license_photo_url: input.license_photo_url,
        board_membership_url: input.board_membership_url ?? null,
        status: "verifying",
        rejection_reason: null,
      },
      { onConflict: "user_id" },
    )
    .select("id")
    .single();

  if (error) throw error;
  return { success: true, verificationId: data.id };
}

/** Trigger the mock license verification edge function. */
export async function verifyLicense(
  verificationId: string,
): Promise<{
  status: "verified" | "rejected" | "manual_review";
  message: string;
  license_details?: Record<string, unknown>;
}> {
  const { data, error } = await supabase.functions.invoke(
    "verify-agent-license",
    { body: { verification_id: verificationId } },
  );
  if (error) throw error;
  return data as {
    status: "verified" | "rejected" | "manual_review";
    message: string;
    license_details?: Record<string, unknown>;
  };
}

/** Move a record into manual_review when the user requests human review. */
export async function requestManualReview(
  verificationId: string,
  additionalInfo?: string,
): Promise<void> {
  const { error } = await supabase
    .from("agent_verifications")
    .update({
      status: "manual_review",
      admin_notes: additionalInfo ?? null,
    })
    .eq("id", verificationId);
  if (error) throw error;
}

export async function getVerificationStatus(userId: string) {
  const { data, error } = await supabase
    .from("agent_verifications")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
