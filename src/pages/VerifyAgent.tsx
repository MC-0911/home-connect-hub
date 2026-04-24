import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck2, BadgeCheck, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useAgentVerification } from "@/hooks/useAgentVerification";
import { Step1BasicInfo, type Step1Values } from "@/components/verify-agent/Step1BasicInfo";
import { Step2LicenseDetails, type Step2Values } from "@/components/verify-agent/Step2LicenseDetails";
import { Step3VerificationStatus } from "@/components/verify-agent/Step3VerificationStatus";
import { submitVerification } from "@/lib/verification/verification-service";
import { toast } from "sonner";

const DRAFT_KEY = "verify-agent-draft";

const STEPS = [
  { key: "basic", label: "Profile", icon: ShieldCheck },
  { key: "license", label: "License", icon: FileCheck2 },
  { key: "status", label: "Verification", icon: BadgeCheck },
];

export default function VerifyAgent() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();
  const { record, status, loading, checkStatus } = useAgentVerification();

  const [stepIndex, setStepIndex] = useState(0);
  const [step1, setStep1] = useState<Partial<Step1Values>>({});
  const [step2, setStep2] = useState<Partial<Step2Values>>({});

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/verify-agent");
  }, [authLoading, user, navigate]);

  // Already verified? bounce to dashboard
  useEffect(() => {
    if (!loading && status === "verified") {
      navigate("/agent-dashboard", { replace: true });
    }
  }, [loading, status, navigate]);

  // Hydrate from existing record or localStorage draft
  useEffect(() => {
    if (record) {
      setStep1({
        full_name: record.full_name ?? "",
        phone: record.phone ?? "",
        agency_name: record.agency_name ?? "",
        years_experience: record.years_experience ?? undefined,
        email: user?.email ?? "",
      });
      setStep2({
        license_number: record.license_number,
        state: record.state,
        license_expiry: record.license_expiry ?? "",
        license_photo_url: record.license_photo_url,
        board_membership_url: record.board_membership_url ?? null,
        confirm: true as const,
      });
      // Jump to status step if already submitted
      if (status !== "none") setStepIndex(2);
    } else {
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
        if (draft) {
          setStep1(draft.step1 ?? {});
          setStep2(draft.step2 ?? {});
        }
      } catch {
        /* ignore */
      }
    }
  }, [record, status, user]);

  // Persist draft
  useEffect(() => {
    if (status === "verified") return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step1, step2 }));
  }, [step1, step2, status]);

  const isAgent = hasRole("agent");
  const showRoleWarning = !roleLoading && user && !isAgent;

  const onSubmitFinal = async (values: Step2Values) => {
    if (!user) return;
    if (!step1.full_name || !step1.phone || !step1.agency_name) {
      toast.error("Complete the profile step first");
      setStepIndex(0);
      return;
    }
    try {
      await submitVerification({
        user_id: user.id,
        full_name: step1.full_name,
        phone: step1.phone!,
        agency_name: step1.agency_name!,
        years_experience: step1.years_experience,
        license_number: values.license_number,
        state: values.state,
        license_expiry: values.license_expiry,
        license_photo_url: values.license_photo_url,
        board_membership_url: values.board_membership_url ?? null,
      });
      toast.success("Submitted for verification");
      localStorage.removeItem(DRAFT_KEY);
      await checkStatus();
      setStepIndex(2);
    } catch (e) {
      console.error(e);
      toast.error("Could not submit verification");
    }
  };

  const indicator = useMemo(
    () => (
      <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const active = i === stepIndex;
          const done = i < stepIndex;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{ scale: active ? 1.05 : 1 }}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                    active
                      ? "border-transparent bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                      : done
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
                        : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-8 sm:w-16 ${done ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    ),
    [stepIndex],
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-3xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => navigate(isAgent ? "/agent-dashboard" : "/")}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card/80 p-6 shadow-elegant backdrop-blur sm:p-10"
          >
            <div className="mb-2 text-center">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Real Estate Agent Verification
              </h1>
              <p className="mt-2 text-muted-foreground">
                Complete verification to unlock listing properties on Royal Landmark.
              </p>
            </div>

            {showRoleWarning && (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                Your account isn't set as an Agent. You can still complete verification, but listing requires an Agent role.
              </div>
            )}

            <div className="mt-6">{indicator}</div>

            {stepIndex === 0 && (
              <Step1BasicInfo
                email={user?.email ?? ""}
                defaultValues={step1}
                onNext={(v) => {
                  setStep1(v);
                  setStepIndex(1);
                }}
              />
            )}

            {stepIndex === 1 && user && (
              <Step2LicenseDetails
                userId={user.id}
                defaultValues={step2}
                onBack={() => setStepIndex(0)}
                onNext={async (v) => {
                  setStep2(v);
                  await onSubmitFinal(v);
                }}
              />
            )}

            {stepIndex === 2 && record && (
              <Step3VerificationStatus
                record={record}
                onRetry={() => setStepIndex(1)}
              />
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
